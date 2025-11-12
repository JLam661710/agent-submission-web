集成信息与标注

用途
- 保存当前已确认的对接信息与字段映射，供后续 Cloudflare/后端开发使用。

Bitable 表信息
- 应用 token（app_token）：Q7WibVCQHaFFDosqhB0cWqSnnVe
- 表 ID（table_id）：tbl4PcJtRVxb1BbC
- 视图 ID（view_id）：vew1rO1ufX
- 字段映射文件：coze_workflow_related/bitable_field_mapping.json（包含 field_id 与中文列名）
- 写入规则：统一使用 field_id 写入，类型保持与表列一致；Coze 的 data 需二次 JSON.parse，取 easyprogramme/image/programme/report 四键。

Feishu 应用凭证
- App ID：cli_a99b78ab63bdd00e
- App Secret：oW77eJVOBYW1J8TuIvHZHhbeD7LqYzPw
- Token 获取：调用 /auth/v3/tenant_access_token/internal 获取 tenant_access_token（有效期 7200 秒，运行时刷新）。

Coze 工作流
- 输出键：easyprogramme（多行文本）、image（URL）、programme（多行文本）、report（多行文本）。
- 网关与 PAT：后续补充 COZE_PAT、workflow_id 后对接；当前仅完成 Bitable 映射准备。

Cloudflare 对接（待办）
- 前端：Pages；后端：Workers（或 Cloudflare Functions）。
- Secrets 管理：Workers Secrets 保存 FEISHU_APP_ID/FEISHU_APP_SECRET/COZE_PAT 等。

环境变量约定（占位）
- FEISHU_APP_ID、FEISHU_APP_SECRET、BITABLE_APP_TOKEN、BITABLE_TABLE_ID、BITABLE_VIEW_ID。
- COZE_PAT、COZE_WORKFLOW_ID、CLOUDFLARE_ACCOUNT_ID、CLOUDFLARE_API_TOKEN。

安全与提交
- 密钥不入库；使用本地 .env 或 Workers Secrets。当前密钥另存于 secrets.local.md 供本机调试。