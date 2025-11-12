// Feishu Bitable 客户端：鉴权、创建记录、更新记录
// 用法：
//   const { getTenantAccessToken, createRecord, updateRecord } = require('./bitable_client');
//   const token = await getTenantAccessToken();
//   const recordId = await createRecord(token, fields);
//   await updateRecord(token, recordId, fieldsToUpdate);

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

async function getTenantAccessToken() {
  const env = loadEnv();
  const appId = process.env.FEISHU_APP_ID || env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET || env.FEISHU_APP_SECRET;
  if (!appId || !appSecret) throw new Error('缺少 FEISHU_APP_ID 或 FEISHU_APP_SECRET');
  const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error(`获取 tenant_access_token 失败: code=${data.code} msg=${data.msg}`);
  }
  return data.tenant_access_token;
}

function getBitableIds() {
  const env = loadEnv();
  const appToken = process.env.BITABLE_APP_TOKEN || env.BITABLE_APP_TOKEN;
  const tableId = process.env.BITABLE_TABLE_ID || env.BITABLE_TABLE_ID;
  if (!appToken || !tableId) throw new Error('缺少 BITABLE_APP_TOKEN 或 BITABLE_TABLE_ID');
  return { appToken, tableId };
}

async function createRecord(tenantToken, fields) {
  const { appToken, tableId } = getBitableIds();
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tenantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error(`创建记录失败: code=${data.code} msg=${data.msg}`);
  }
  return data?.data?.record?.record_id || data?.data?.record_id || data?.data?.recordId;
}

async function updateRecord(tenantToken, recordId, fields) {
  const { appToken, tableId } = getBitableIds();
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;
  const resp = await fetch(url, {
    method: 'PUT', // 有些版本支持 PATCH；此处采用 PUT 更新全部传入字段
    headers: {
      'Authorization': `Bearer ${tenantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error(`更新记录失败: code=${data.code} msg=${data.msg}`);
  }
  return true;
}

module.exports = {
  getTenantAccessToken,
  createRecord,
  updateRecord,
  loadEnv,
};