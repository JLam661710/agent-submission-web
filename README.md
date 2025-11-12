# 项目总览与使用

本仓库包含两个子项目：

- `frontend`：React + Vite 前端问卷与结果展示
- `integration`：Node.js/Express 后端提交接口（写入 Bitable，调用 Coze 工作流）

详细的产品设计与技术综述请见 `workspace_overview.md`。

## 快速开始

前端（本地开发）：

```bash
cd frontend
npm install
npm run dev
```

后端（本地开发，需配置 `.env` 或使用 `integration/.env.example`）：

```bash
cd integration
npm install
node server.js
```

默认前端将调用 `http://localhost:8000/api/submissions`，可在前端通过 `VITE_API_BASE_URL` 指定后端地址。

## 环境变量（后端）

在 `integration/.env` 设置：

- `FEISHU_APP_ID`、`FEISHU_APP_SECRET`
- `BITABLE_APP_TOKEN`、`BITABLE_TABLE_ID`、`BITABLE_VIEW_ID`
- `COZE_PAT`、`COZE_WORKFLOW_ID`

示例参考 `integration/.env.example`。

## CI

推送到 `main` 分支时，GitHub Actions 将：

- 构建前端并执行 lint
- 安装后端依赖并进行语法加载检查（不启动服务）

## 代码结构

- `frontend/src`：页面、组件与表单逻辑
- `integration/server.js`：提交 API 路由与业务流程
- `integration/bitable_client.js` / `coze_client.js`：第三方 API 客户端
- `integration/coze_test.js`：独立的 Coze 测试脚本

## 其他

- `.gitignore` 已在根级配置，避免敏感信息与构建产物入库
- `.gitattributes` 统一 LF 行尾，保证跨平台一致