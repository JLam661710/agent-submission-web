/**
 * 端到端测试脚本：
 * - 从本地模拟“互联网用户”向云端网关 POST /api/submissions
 * - 保存请求与响应到 e2e/results/
 * - 如配置了飞书凭据，进一步拉取该 record_id 对应的记录详情保存
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function nowTs() {
  const d = new Date();
  const ts = d.toISOString().replace(/[:.]/g, '-');
  return ts;
}

function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadIntegrationEnv() {
  const envPath = path.resolve(__dirname, '../integration/.env');
  const examplePath = path.resolve(__dirname, '../integration/.env.example');
  const result = {};
  const srcPath = fs.existsSync(envPath) ? envPath : (fs.existsSync(examplePath) ? examplePath : null);
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

async function fetchJson(url, options = {}) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { parse_error: String(e), raw_text: text }; }
  return { status: resp.status, headers: Object.fromEntries(resp.headers.entries()), data };
}

async function main() {
  const apiBase = process.env.API_BASE_URL || 'https://sd49i69772iht9fagok20.apigateway-cn-guangzhou.volceapi.com';
  const resultsDir = path.resolve(__dirname, 'results');
  ensureDir(resultsDir);

  // 构造请求体（读取示例并包装 submission_id 与 _input）
  const samplePath = path.resolve(__dirname, 'payloads/sample_submission.json');
  const sample = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
  const submission_id = generateUUID();
  const payload = { submission_id, _input: sample, submitted_at: new Date().toISOString() };

  // 保存请求体
  const ts = nowTs();
  fs.writeFileSync(path.join(resultsDir, `${ts}_request.json`), JSON.stringify(payload, null, 2));

  console.log(`[e2e] POST ${apiBase}/api/submissions`);
  const postRes = await fetchJson(`${apiBase}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // 保存响应
  const respFile = path.join(resultsDir, `${ts}_response.json`);
  fs.writeFileSync(respFile, JSON.stringify(postRes, null, 2));
  console.log(`[e2e] 响应已保存: ${respFile}`);

  const recordId = postRes?.data?.record_id;
  if (!recordId) {
    console.warn('[e2e] 未返回 record_id，可能是后端暂未创建或发生错误。');
    if (postRes?.data?.debug_url) console.log(`[e2e] debug_url: ${postRes.data.debug_url}`);
    return;
  }

  // 如有飞书凭据，进一步查询记录详情
  const env = loadIntegrationEnv();
  const FEISHU_APP_ID = process.env.FEISHU_APP_ID || env.FEISHU_APP_ID;
  const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || env.FEISHU_APP_SECRET;
  const BITABLE_APP_TOKEN = process.env.BITABLE_APP_TOKEN || env.BITABLE_APP_TOKEN;
  const BITABLE_TABLE_ID = process.env.BITABLE_TABLE_ID || env.BITABLE_TABLE_ID;

  if (FEISHU_APP_ID && FEISHU_APP_SECRET && BITABLE_APP_TOKEN && BITABLE_TABLE_ID) {
    console.log('[e2e] 检索飞书多维表格记录详情...');
    // 获取 tenant_access_token
    const tokenRes = await fetchJson('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
    });
    if (tokenRes.data.code !== 0) {
      console.warn(`[e2e] 获取 tenant_access_token 失败: code=${tokenRes.data.code} msg=${tokenRes.data.msg}`);
      return;
    }
    const tenantToken = tokenRes.data.tenant_access_token;

    const recordUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE_APP_TOKEN}/tables/${BITABLE_TABLE_ID}/records/${recordId}`;
    const recordRes = await fetchJson(recordUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tenantToken}` },
    });

    const recordFile = path.join(resultsDir, `${ts}_bitable_record.json`);
    fs.writeFileSync(recordFile, JSON.stringify(recordRes, null, 2));
    console.log(`[e2e] 飞书记录详情已保存: ${recordFile}`);
  } else {
    console.log('[e2e] 未配置飞书凭据，跳过记录详情校验。');
  }
}

main().catch(err => {
  console.error('[e2e] 发生错误:', err);
  process.exitCode = 1;
});