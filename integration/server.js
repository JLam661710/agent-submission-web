// 提交 API 服务（Express）：
// 路由 POST /api/submissions
// 流程：
// 1) 写入 Bitable 初始记录（问卷原始字段+提交时间+submission_id）
// 2) 调用 Coze 工作流获取四字段
// 3) 更新 Bitable 记录写入四字段
// 4) 返回四字段给前端展示

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const { getTenantAccessToken, createRecord, updateRecord, loadEnv } = require('./bitable_client');
const { runWorkflow } = require('./coze_client');

// 读取字段映射
function readFieldMapping() {
  const mappingPath = path.resolve(__dirname, 'bitable_field_mapping.json');
  const content = fs.readFileSync(mappingPath, 'utf-8');
  return JSON.parse(content);
}

function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  // 兼容环境：简单降级实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function pad2(n) { return n < 10 ? `0${n}` : `${n}`; }
function formatDateTime(date = new Date()) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function mapInputToFields(input, mapping) {
  const fields = mapping.fields;
  const out = {};
  const set = (key, value) => {
    const f = fields[key];
    if (f && value !== undefined && value !== null && value !== '') out[f.name] = value;
  };

  set('nickname', input.nickname);
  set('role_tags', input.role_tags);
  set('recent_annoyance', input.recent_annoyance);
  set('skills', input.skills);
  set('interest_score', input.interest_score);
  set('interest_description', input.interest_description);
  set('learning_attitude_sc', input.learning_attitude_sc);
  set('people_around_challe', input.people_around_challe);
  set('community_voices', input.community_voices);
  set('collaboration_prefer', input.collaboration_prefer);
  set('tool_idea', input.tool_idea);
  set('confidence_score', input.confidence_score);
  set('learning_goal', input.learning_goal);

  // challenges 映射：最多三项（mapping 中 challenge_1 仅有 score 字段）
  const ch = Array.isArray(input.challenges) ? input.challenges : [];
  if (ch[0]) {
    set('challenge_1', ch[0].description);
    set('challenge_1_score', ch[0].score);
  }
  if (ch[1]) {
    set('challenge_2', ch[1].description);
    set('challenge_2_score', ch[1].score);
  }
  if (ch[2]) {
    set('challenge_3', ch[2].description);
    set('challenge_3_score', ch[2].score);
  }
  return out;
}

// 输入归一化与宽松校验：
// - 去除字符串首尾空白；
// - 分数字段 clamp 到 [1..5]；
// - challenges 保留最多 3 项并对 score 进行 clamp；
// - collaboration_prefer 仅允许 {A,B,C,D}，否则忽略。
function normalizeInput(raw) {
  const i = { ...(raw || {}) };
  const trimStr = (v) => (typeof v === 'string' ? v.trim() : v);
  const clamp = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return undefined;
    return Math.min(5, Math.max(1, Math.round(x)));
  };

  i.nickname = trimStr(i.nickname);
  i.role_tags = trimStr(i.role_tags);
  i.recent_annoyance = trimStr(i.recent_annoyance);
  i.skills = trimStr(i.skills);
  i.interest_score = clamp(i.interest_score);
  i.interest_description = trimStr(i.interest_description);
  i.learning_attitude_sc = clamp(i.learning_attitude_sc);
  i.people_around_challe = trimStr(i.people_around_challe);
  i.community_voices = trimStr(i.community_voices);
  i.tool_idea = trimStr(i.tool_idea);
  i.confidence_score = clamp(i.confidence_score);
  i.learning_goal = trimStr(i.learning_goal);

  const collab = typeof i.collaboration_prefer === 'string' ? i.collaboration_prefer.trim().toUpperCase() : undefined;
  i.collaboration_prefer = ['A', 'B', 'C', 'D'].includes(collab) ? collab : undefined;

  const arr = Array.isArray(i.challenges) ? i.challenges.slice(0, 3) : [];
  i.challenges = arr.map((c) => ({
    description: trimStr(c?.description),
    score: clamp(c?.score),
  })).filter((c) => c.description && c.score);

  return i;
}

function mapCozeToFields(cozeData, mapping) {
  const fields = mapping.fields;
  const out = {};
  if (!cozeData) return out;
  if (typeof cozeData.easyprogramme === 'string') out[fields.coze_easyprogramme.name] = cozeData.easyprogramme;
  if (typeof cozeData.image === 'string') {
    const val = cozeData.image.trim();
    // 飞书多维表格 URL 字段写入结构：对象 { link, text }
    // 参考示例：{"链接": {"link": "https://example.com", "text": "示例"}}
    if (isValidHttpUrl(val)) {
      out[fields.coze_image.name] = { link: val, text: 'Coze 配图' };
    }
    // 非合法 URL 则跳过，避免 URLFieldConvFail
  }
  if (typeof cozeData.programme === 'string') out[fields.coze_programme.name] = cozeData.programme;
  if (typeof cozeData.report === 'string') out[fields.coze_report.name] = cozeData.report;
  return out;
}

function isValidHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

async function createApp() {
  const app = express();
  app.use(bodyParser.json({ limit: '1mb' }));
  // 简易 CORS 支持，便于前端本地开发联调
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  });

  app.post('/api/submissions', async (req, res) => {
    try {
      const env = loadEnv();
      const mapping = readFieldMapping();
      const submissionId = req.body?.submission_id || generateUUID();
      const inputRaw = req.body?._input || req.body || {};
      const input = normalizeInput(inputRaw);
      const submittedAt = Date.now();

      // 基础校验（可扩展）：分数范围与枚举
      const requiredKeys = ['nickname'];
      for (const k of requiredKeys) {
        if (!input[k]) return res.status(400).json({ error: `缺少必填项: ${k}` });
      }

      // 鉴权
      const tenantToken = await getTenantAccessToken();

      // 初始写入：问卷字段 + 元数据
      const baseFields = mapInputToFields(input, mapping);
      baseFields[mapping.fields.submission_id.name] = submissionId;
      baseFields[mapping.fields.submitted_at.name] = submittedAt;

      const recordId = await createRecord(tenantToken, baseFields);

      // 判断 Coze 凭据是否存在；缺失时安全降级（返回空字段并跳过更新）
      const cozePat = process.env.COZE_PAT || env.COZE_PAT;
      const cozeWorkflowId = process.env.COZE_WORKFLOW_ID || env.COZE_WORKFLOW_ID;
      let cozeData = null;
      let summary = null;
      if (cozePat && cozeWorkflowId) {
        // 调用 Coze 工作流（最长 300s）
        const r = await runWorkflow(input, 300_000);
        cozeData = r.data;
        summary = r.summary;
      }

      // 更新记录：写入 Coze 四字段
      const cozeFields = mapCozeToFields(cozeData, mapping);
      if (Object.keys(cozeFields).length > 0) {
        await updateRecord(tenantToken, recordId, cozeFields);
      }

      // 返回给前端用于展示
      res.json({
        submission_id: submissionId,
        record_id: recordId,
        coze_easyprogramme: cozeData?.easyprogramme || null,
        coze_image: cozeData?.image || null,
        coze_programme: cozeData?.programme || null,
        coze_report: cozeData?.report || null,
        debug_url: summary?.debug_url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  return app;
}

if (require.main === module) {
  (async () => {
    const app = await createApp();
    const port = Number(process.env.FAAS_LISTEN_PORT || process.env.PORT || 8000);
    const host = process.env.HOST || '0.0.0.0';
    app.listen(port, host, () => console.log(`[server] listening on ${host}:${port}`));
  })();
}

module.exports = { createApp };