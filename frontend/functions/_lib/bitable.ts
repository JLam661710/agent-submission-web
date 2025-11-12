export type Env = {
  FEISHU_APP_ID: string
  FEISHU_APP_SECRET: string
  BITABLE_APP_TOKEN: string
  BITABLE_TABLE_ID: string
}

type CommonResp = { code: number; msg?: string }
type TenantTokenResp = CommonResp & { tenant_access_token?: string }
type RecordInfo = { record?: { record_id?: string }; record_id?: string; recordId?: string }
type CreateRecordResp = CommonResp & { data?: RecordInfo }
type UpdateRecordResp = CommonResp

export async function getTenantAccessToken(env: Env): Promise<string> {
  const { FEISHU_APP_ID, FEISHU_APP_SECRET } = env
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) throw new Error('缺少 FEISHU_APP_ID 或 FEISHU_APP_SECRET')
  const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
  })
  const data = await resp.json() as TenantTokenResp
  if (data.code !== 0) throw new Error(`获取 tenant_access_token 失败: code=${data.code} msg=${data.msg}`)
  const token = data.tenant_access_token
  if (!token || typeof token !== 'string') {
    throw new Error('响应缺少 tenant_access_token')
  }
  return token
}

function getBitableIds(env: Env) {
  const { BITABLE_APP_TOKEN, BITABLE_TABLE_ID } = env
  if (!BITABLE_APP_TOKEN || !BITABLE_TABLE_ID) throw new Error('缺少 BITABLE_APP_TOKEN 或 BITABLE_TABLE_ID')
  return { appToken: BITABLE_APP_TOKEN, tableId: BITABLE_TABLE_ID }
}

export async function createRecord(env: Env, tenantToken: string, fields: Record<string, any>): Promise<string> {
  const { appToken, tableId } = getBitableIds(env)
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  const data = await resp.json() as CreateRecordResp
  if (data.code !== 0) throw new Error(`创建记录失败: code=${data.code} msg=${data.msg}`)
  const d = data.data || {}
  return (d.record && d.record.record_id) || d.record_id || d.recordId || ''
}

export async function updateRecord(env: Env, tenantToken: string, recordId: string, fields: Record<string, any>) {
  const { appToken, tableId } = getBitableIds(env)
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`
  const resp = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  const data = await resp.json() as UpdateRecordResp
  if (data.code !== 0) throw new Error(`更新记录失败: code=${data.code} msg=${data.msg}`)
  return true
}