// Coze API 测试脚本（等待上限 300 秒，使用 input example）
// 运行方式：
//   node coze_test.js
// 环境变量优先读取 .env；若不存在则回退使用 integration/.env.example 中的 COZE_PAT/COZE_WORKFLOW_ID。

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  const examplePath = path.resolve(__dirname, '.env.example');
  let srcPath = null;
  if (fs.existsSync(envPath)) srcPath = envPath; else if (fs.existsSync(examplePath)) srcPath = examplePath;
  const result = {};
  if (!srcPath) return result;
  const content = fs.readFileSync(srcPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    result[key] = value;
  }
  return result;
}

function pickInputExample() {
  // 选用 coze_workflow_related/coze_input_examples.md 中的“示例 06 — 双语与跨平台同步”
  // 如需切换示例，可替换为其他示例 JSON。
  return {
    nickname: 'Leo',
    role_tags: '产品经理,创作者',
    recent_annoyance: '会议纪要难以追踪，Follow-up容易遗漏',
    skills: 'OKR拆解与需求分析',
    interest_score: 5,
    interest_description:
      'Interested in automation and knowledge graphs for productivity',
    learning_attitude_sc: 4,
    people_around_challe: '团队协同工具碎片化',
    community_voices: '希望有一体化的协作入口',
    collaboration_prefer: 'A',
    tool_idea: '自动同步会议纪要到任务看板',
    confidence_score: 4,
    challenges: [
      { description: '跨工具数据同步困难', score: 4 },
      { description: '权限管理复杂', score: 3 },
    ],
    learning_goal: '掌握跨平台自动化',
  };
}

async function main() {
  const env = loadEnv();
  const COZE_PAT = process.env.COZE_PAT || env.COZE_PAT;
  const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID || env.COZE_WORKFLOW_ID;

  if (!COZE_PAT || !COZE_WORKFLOW_ID) {
    console.error('[错误] 未找到 COZE_PAT 或 COZE_WORKFLOW_ID。请在 integration/.env 设置，或确认 .env.example 可用。');
    process.exit(1);
  }

  const endpoint = 'https://api.coze.cn/v1/workflow/run';
  const parameters = pickInputExample();

  const payload = {
    workflow_id: COZE_WORKFLOW_ID,
    parameters,
  };

  // 300 秒最大等待时间（超过则主动取消）
  const MAX_WAIT_MS = 300_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MAX_WAIT_MS);

  const start = Date.now();
  let rawRespObj = null;
  let parsedData = null;

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await resp.text();
    try {
      rawRespObj = JSON.parse(text);
    } catch (e) {
      rawRespObj = { parse_error: String(e), raw_text: text };
    }

    // 写入原始响应
    fs.writeFileSync(
      path.resolve(__dirname, 'coze_raw_response.json'),
      JSON.stringify(rawRespObj, null, 2),
      'utf-8'
    );

    // data 字段可能是字符串（需二次 JSON.parse）
    if (rawRespObj && typeof rawRespObj.data === 'string') {
      try {
        parsedData = JSON.parse(rawRespObj.data);
      } catch (e) {
        parsedData = { parse_error: String(e), raw_data: rawRespObj.data };
      }
    } else if (rawRespObj && rawRespObj.data) {
      parsedData = rawRespObj.data;
    }

    if (parsedData) {
      fs.writeFileSync(
        path.resolve(__dirname, 'coze_parsed_response.json'),
        JSON.stringify(parsedData, null, 2),
        'utf-8'
      );
    }

    const end = Date.now();
    const elapsedMs = end - start;

    const summary = {
      http_status: resp.status,
      code: rawRespObj?.code,
      msg: rawRespObj?.msg,
      usage: rawRespObj?.usage,
      detail: rawRespObj?.detail,
      debug_url: rawRespObj?.debug_url,
      elapsed_ms: elapsedMs,
      elapsed_sec: Math.round(elapsedMs / 1000),
      has_parsed_data: Boolean(parsedData),
    };

    console.log('=== Coze 调用摘要 ===');
    console.log(JSON.stringify(summary, null, 2));
    if (parsedData) {
      console.log('\n=== 解析后的 data 预览（截断） ===');
      // 只展示关键字段，避免控制台过长
      console.log({
        easyprogramme: typeof parsedData.easyprogramme === 'string' ? parsedData.easyprogramme.slice(0, 120) + '…' : undefined,
        image: parsedData.image,
        programme: typeof parsedData.programme === 'string' ? parsedData.programme.slice(0, 120) + '…' : undefined,
        report: typeof parsedData.report === 'string' ? parsedData.report.slice(0, 120) + '…' : undefined,
      });
    }
  } catch (err) {
    const end = Date.now();
    const elapsedMs = end - start;
    const isAbort = err && String(err).includes('AbortError');
    console.error('[调用失败]', isAbort ? '超时(>300s)或主动取消' : err);
    fs.writeFileSync(
      path.resolve(__dirname, 'coze_error.log'),
      `[${new Date().toISOString()}] elapsed_ms=${elapsedMs} error=${String(err)}\n`,
      { flag: 'a' }
    );
    process.exit(2);
  } finally {
    clearTimeout(timeoutId);
  }
}

main();