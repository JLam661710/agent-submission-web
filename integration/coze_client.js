// Coze API 客户端：运行工作流并统一解析 data 字段
// 用法：
//   const { runWorkflow } = require('./coze_client');
//   const { data, summary } = await runWorkflow(parameters, 300_000);

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

async function runWorkflow(parameters, maxWaitMs = 300_000) {
  const env = loadEnv();
  const COZE_PAT = process.env.COZE_PAT || env.COZE_PAT;
  const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID || env.COZE_WORKFLOW_ID;
  if (!COZE_PAT || !COZE_WORKFLOW_ID) throw new Error('缺少 COZE_PAT 或 COZE_WORKFLOW_ID');
  const endpoint = 'https://api.coze.cn/v1/workflow/run';

  const payload = { workflow_id: COZE_WORKFLOW_ID, parameters };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), maxWaitMs);
  const start = Date.now();
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COZE_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await resp.text();
    let raw;
    try { raw = JSON.parse(text); } catch (e) { raw = { parse_error: String(e), raw_text: text }; }
    const summary = {
      http_status: resp.status,
      code: raw?.code,
      msg: raw?.msg,
      usage: raw?.usage,
      detail: raw?.detail,
      debug_url: raw?.debug_url,
      elapsed_ms: Date.now() - start,
    };
    let parsedData = null;
    if (raw && typeof raw.data === 'string') {
      try { parsedData = JSON.parse(raw.data); } catch (e) { parsedData = { parse_error: String(e), raw_data: raw.data }; }
    } else {
      parsedData = raw?.data || null;
    }
    return { data: parsedData, summary, raw };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { runWorkflow };