# 端到端测试（E2E）

目标：从“互联网前端客户端”视角，向云端函数网关 `POST /api/submissions`，并核验云端返回与飞书多维表格记录是否创建成功。测试结果会保存在 `e2e/results/`。

## 一次性准备

- 将云端 API 网关地址设置为默认：`https://sd49i69772iht9fagok20.apigateway-cn-guangzhou.volceapi.com`
- 如需校验飞书记录详情，请在 `integration/.env`（或部署平台环境变量）中配置：
  - `FEISHU_APP_ID`
  - `FEISHU_APP_SECRET`
  - `BITABLE_APP_TOKEN`
  - `BITABLE_TABLE_ID`

## 运行步骤

1. 直接运行脚本：
   - `node e2e/run_e2e_test.js`
   - 或自定义：`API_BASE_URL=https://<你的网关域名> node e2e/run_e2e_test.js`

2. 查看结果文件：
   - `e2e/results/<timestamp>_request.json`（请求体）
   - `e2e/results/<timestamp>_response.json`（云端返回）
   - 若配置了飞书凭据：`e2e/results/<timestamp>_bitable_record.json`（飞书记录详情）

## 前端联调（可选，不改代码）

- 在 `frontend` 目录创建（或使用现有）环境文件，设置：
  - `VITE_API_BASE_URL=https://sd49i69772iht9fagok20.apigateway-cn-guangzhou.volceapi.com`
- 运行前端：
  - `cd frontend && npm install && npm run dev`
  - 在页面中触发提交逻辑，会直接请求云端网关。

## 注意事项

- 云端网关路由超时需设为 `600000 ms`（600 秒）；函数运行超时建议 `600 秒`。
- 如返回的 Coze 四字段为 `null`，可通过返回的 `debug_url` 查看工作流详情，并完善输入。