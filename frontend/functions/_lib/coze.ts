export type Env = {
  COZE_PAT?: string
  COZE_WORKFLOW_ID?: string
}

export async function runWorkflow(env: Env, parameters: any, maxWaitMs = 300_000) {
  const { COZE_PAT, COZE_WORKFLOW_ID } = env
  if (!COZE_PAT || !COZE_WORKFLOW_ID) throw new Error('缺少 COZE_PAT 或 COZE_WORKFLOW_ID')
  const endpoint = 'https://api.coze.cn/v1/workflow/run'

  const payload = { workflow_id: COZE_WORKFLOW_ID, parameters }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), maxWaitMs)
  const start = Date.now()
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${COZE_PAT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const text = await resp.text()
    let raw: any
    try { raw = JSON.parse(text) } catch (e) { raw = { parse_error: String(e), raw_text: text } }
    const summary = {
      http_status: resp.status,
      code: raw?.code,
      msg: raw?.msg,
      usage: raw?.usage,
      detail: raw?.detail,
      debug_url: raw?.debug_url,
      elapsed_ms: Date.now() - start,
    }
    let parsedData: any = null
    if (raw && typeof raw.data === 'string') {
      try { parsedData = JSON.parse(raw.data) } catch (e) { parsedData = { parse_error: String(e), raw_data: raw.data } }
    } else {
      parsedData = raw?.data || null
    }
    return { data: parsedData, summary, raw }
  } finally {
    clearTimeout(timeoutId)
  }
}