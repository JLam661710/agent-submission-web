import mapping from '../_lib/bitable_field_mapping.json'
import { getTenantAccessToken, createRecord, updateRecord } from '../_lib/bitable'
import { runWorkflow } from '../_lib/coze'
import { normalizeInput, mapInputToFields, mapCozeToFields, isValidHttpUrl } from '../_lib/utils'
// 注：移除 Cloudflare 类型依赖，避免与前端 DOM Response 类型冲突

export const onRequestOptions = async (_context: any) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}

export const onRequestPost = async (context: any) => {
  try {
    const { env, request } = context as any
    const body: any = await request.json().catch(() => ({} as any))
    const submissionId = body?.submission_id || crypto.randomUUID?.() || Math.random().toString(36).slice(2)
    const inputRaw = body?._input || body || {}
    const input = normalizeInput(inputRaw)
    const submittedAt = Date.now()

    if (!input.nickname) {
      return json({ error: '缺少必填项: nickname' }, 400)
    }

    // 飞书鉴权
    const tenantToken = await getTenantAccessToken(env as any)

    // 初始写入：问卷字段 + 元数据
    const baseFields = mapInputToFields(input, mapping as any)
    ;(baseFields as any)[(mapping as any).fields.submission_id.name] = submissionId
    ;(baseFields as any)[(mapping as any).fields.submitted_at.name] = submittedAt

    const recordId = await createRecord(env as any, tenantToken, baseFields)

    // Coze 工作流（凭据存在时才调用）
    let cozeData: any = null
    let summary: any = null
    const hasCoze = Boolean((env as any).COZE_PAT && (env as any).COZE_WORKFLOW_ID)
    if (hasCoze) {
      const r = await runWorkflow(env as any, input, 300_000)
      cozeData = r.data
      summary = r.summary
    }

    const cozeFields = mapCozeToFields(cozeData, mapping as any)
    if (Object.keys(cozeFields).length > 0) {
      await updateRecord(env as any, tenantToken, recordId, cozeFields)
    }

    return json({
      submission_id: submissionId,
      record_id: recordId,
      coze_easyprogramme: cozeData?.easyprogramme || null,
      coze_image: cozeData?.image || null,
      coze_programme: cozeData?.programme || null,
      coze_report: cozeData?.report || null,
      debug_url: summary?.debug_url,
    })
  } catch (err: any) {
    return json({ error: String(err) }, 500)
  }
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}