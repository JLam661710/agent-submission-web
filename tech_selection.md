# 技术选型方案：智能体开发选题灵感大师（MVP）

版本：v0.1（依据 info.md 设计，不改变原意）

## 1. 选型原则
- 对齐产品目标：快速、易维护地实现问卷表单、Bitable 写入、Coze API 调用与移动端适配。
- 安全与合规：不在前端暴露任何后端密钥；仅存储问卷与分析文本，不记录行为数据。
- 性能优先：轻量打包、良好交互性能与移动端体验。

## 2. 前端技术栈
- 框架：React + TypeScript（主流生态、类型安全、组件化便于多步表单）
- 构建：Vite（开发体验与构建速度优异）
- 表单与校验：React Hook Form + Zod（高性能与声明式校验，易于多步/条件字段）
- UI与样式：
  - Tailwind CSS（快速响应式布局与移动端适配）或 Ant Design（如更偏好现成组件，含表单与进度条）
  - 进度指示器：基于路由或状态，使用 Progress/Steps 组件
- 本地存储：`localStorage` 自动草稿保存与恢复
- 状态管理：轻量方案（React 状态），不引入全局复杂状态工具；如需跨页共享可用 Zustand/Jotai

### Tailwind CSS 设计规范与插件（新增）
- 设计原则：移动端优先、一致性、轻量复用；最小触控尺寸 44px。
- 推荐插件：
  - `@tailwindcss/forms`（更佳表单样式基础，便于一致化控件）
  - `@tailwindcss/typography`（Markdown/长文档的可读性增强，用 `prose` 类）
  - `@tailwindcss/line-clamp`（摘要文本收纳，避免溢出）
  - `@tailwindcss/aspect-ratio`（图片与媒体的固定比例容器）
- 样式约定：
  - 容器：`max-w-md mx-auto px-4`；顶部/底部粘性栏 `sticky top-0 / bottom-0`。
  - 组件：按钮 `h-10 px-4 rounded-lg`；输入框 `rounded-md border-gray-300 focus:ring-indigo-500`；卡片 `rounded-lg border p-4 shadow-sm`。
  - 语义色：主色 `indigo-600`，中性色 `gray-*`；成功/警告/错误分别使用 `emerald/amber/rose`。
  - 动效：`transition-colors opacity duration-200 ease-out`；折叠面板 `transition-all`。


### UI 路由与页面（新增）
- 路由：
  - `/result`：展示 `report` 文本与 `image` 图片，按钮“查看选题方案”导航到 `/programme`。
  - `/programme`：展示 `easyprogramme`；按钮“查看详细方案”展开下拉显示 `programme`；提供返回 `/result`。
- 内容渲染：
  - 文本可能包含 Markdown（根据 Coze 输出样例），建议使用 `react-markdown` + `rehype-sanitize` 安全渲染；无依赖时退化为纯文本。
  - 图片以 `image` URL 加载，缺省时显示占位。

### 组件与页面实现建议（新增）
- 通用组件：Button（主/次/幽灵）、Input/Textarea、Select、RadioGroup（1–5）、Card、Expandable、Progress/Steps、Toast/Alert、Skeleton。
- 页面骨架：
  - 问卷页：顶部显示进度，问题卡片分组，底部 CTA（上一题/下一题/保存草稿/提交）；提交后禁用控件并保留再次提交入口。
  - 结果页 `/result`：上方 `report` 文本区（Markdown/纯文本），下方 `image`；空值显示占位卡片；CTA 跳转 `/programme`。
  - 选题页 `/programme`：摘要 `easyprogramme`；折叠面板展开 `programme`；底部返回 `/result`。
- 可访问性：显式 `label` 关联、错误文案 `aria-live`、折叠面板 `aria-expanded`；对比度与键盘导航达标。
- 性能与体验：草稿节流写入、图片懒加载、路由层代码分割。

## 3. 后端技术栈
- 语言与运行时：Node.js + TypeScript
- 框架：Hono（优先，轻量、Cloudflare Workers 友好）或 Express（替代）
- 部署形态：Cloudflare Pages（前端静态托管）+ Cloudflare Workers（后端 API）；如需传统服务器可选 PM2/Nginx
- 配置与密钥：
  - 环境变量管理：`.env`（本地）与 Cloudflare Secrets（生产），包括 `BITABLE_APP_TOKEN`、`BITABLE_TABLE_ID`、`COZE_PAT`、`COZE_WORKFLOW_ID` 等
  - 密钥仅在后端使用；前端通过后端 API 进行数据提交与分析请求
  - 工具链：Wrangler（本地/CI 部署 Workers），`wrangler.toml` 管理路由与环境变量

## 4. 外部服务与集成
- 飞书多维表（Bitable）
  - 能力：创建记录、填充字段、更新 Coze 四输出字段
  - 鉴权：企业/自建应用获取 `tenant_access_token` → 使用 Bitable OpenAPI
  - 字段映射：严格遵循 PRD 中英文 key ↔ 中文列名映射（含 `coze_easyprogramme`、`coze_image`、`coze_programme`、`coze_report`）
- Coze API
  - 作用：根据统一 JSON 输入返回四字段（`easyprogramme`、`image`、`programme`、`report`）
  - 调用方式：后端携带密钥调用；注意响应 `data` 为字符串需二次 `JSON.parse`；将四字段写回 Bitable 并返回前端显示

## 5. 数据契约（统一）
前端提交 → 后端存储/转发 → Coze 输入，采用 `_input` 包裹的截断参数名（与 PRD 保持一致）：
```
{
  "submission_id": "uuid-v4",
  "_input": {
    "nickname": "string",
    "role_tags": "string",
    "recent_annoyance": "string",
    "skills": "string",
    "interest_score": 1,
    "interest_description": "string",
    "learning_attitude_sc": 1,
    "people_around_challe": "string",
    "community_voices": "string",
    "collaboration_prefer": "A|B|C|D",
    "tool_idea": "string",
    "confidence_score": 1,
    "challenges": [{"description": "string", "score": 1}],
    "learning_goal": "string"
  },
  "submitted_at": "ISO-8601"
}
```
约束：打分 ∈ [1..5]；`challenges` 1–3 项；枚举值 {A,B,C,D}；`learning_attitude_sc` 采用截断命名。

## 6. 接口设计（后端）
- `POST /api/submissions`
  - 入参：上方统一 JSON（前端校验后提交）
  - 行为：
    1) 写入 Bitable（含 `submitted_at` 与所有问卷字段）
    2) 调用 Coze API 获取输出（四字段）
    3) 更新 Bitable 字段 `coze_easyprogramme`、`coze_image`、`coze_programme`、`coze_report`
    4) 返回 `{ submission_id, coze_easyprogramme, coze_image, coze_programme, coze_report }`
- 前端显示逻辑（新增）：
  - 首屏 `/result` 仅消费 `{ coze_report, coze_image }` 两字段。
  - 点击按钮后进入 `/programme`，展示 `{ coze_easyprogramme }`；展开后显示 `{ coze_programme }`。
- 防重复：
  - 生成 `submission_id`（UUID）；同会话提交后锁定；跨会话由前端提示可能重复即可，不做硬拦截
 - 其他接口（可选）：
   - `GET /api/submissions/:id` 返回提交与四字段结果
   - `GET /api/health` 健康检查（Workers 环境探针）

## 7. 鉴权与安全
- 前端不携带任何平台密钥；所有外部 API 由后端调用
- 限速与防刷：
  - 简易速率限制（IP 或会话级）；
  - 后端对 `nickname + 时间窗口` 做轻提示，不作为阻断依据
- CORS：仅允许前端域名；禁止公共跨域

## 8. 性能与体验
- 前端：
  - 代码分割与懒加载（多步表单分段加载）
  - Tailwind/组件库按需加载；资源压缩
  - 本地草稿节流写入，避免频繁 IO
- 后端：
  - 调用 Coze 时增加超时与重试（退避策略）
  - Bitable 请求失败重试与幂等写入（以 `submission_id` 作为幂等键）

## 9. 错误处理
- 前端：就近校验提示；统一错误区显示“提交失败/分析失败”，提供重试与草稿保留
- 后端：
  - 统一错误码与文案映射（如 `BITABLE_WRITE_FAILED`, `COZE_TIMEOUT`）
  - 仅记录服务端错误日志（不采集用户行为）

## 10. 测试与质量保障
- 单元测试：数据映射（英文 key ↔ 中文列名）、枚举与范围校验
- 集成测试：`/api/submissions` 成功与异常路径（Bitable/Coze失败重试）
- 端到端测试：多步表单、草稿保存与恢复、提交锁定与重新提交、结果页展示

## 11. 部署与环境
- 开发：macOS 本地（Node 18+、pnpm/ npm、Vite 开发服务器）
- 测试/生产：
  - Cloudflare Pages：连接 GitHub 仓库，自动构建前端（Vite）；支持 Preview 与 Production 环境
  - Cloudflare Workers：使用 Wrangler 部署后端 API；路由形如 `/api/*` 指向 Workers
  - 传统：Node + PM2 + Nginx（可选，不推荐于本 MVP）
- 环境变量：通过 Cloudflare Pages 环境变量与 Workers Secrets 配置；本地使用 `.env`（不提交到仓库）
- GitHub 仓库与分支策略：
  - 主分支 `main`（生产）；开发分支 `develop`；功能分支 `feature/*`
  - Pull Request 触发 Pages 预览部署；合并 `main` 触发生产部署
- Cloudflare 配置要点：
  - Wrangler：`wrangler.toml` 定义 `name`、`main`、`routes`、`compatibility_date`
  - Secrets：`wrangler secret put BITABLE_APP_TOKEN`、`BITABLE_TABLE_ID`、`COZE_PAT`、`COZE_WORKFLOW_ID`
  - CORS：Workers 中限制允许来源为 Pages 域名
  - 日志：使用 Workers Logs；必要时记录 `detail.logid` 与原始 `data` 快照（不含用户行为）

## 12. 可选替代与权衡
- 前端替代：Next.js（如需同构与内置 API 路由），代价是框架复杂度提升
- UI替代：Ant Design（成熟组件丰富）vs. Tailwind（极简、灵活）；移动端可选 Ant Design Mobile
- 后端替代：Express（生态庞大）vs. Hono（轻量/Serverless友好）

## 13. CI/CD 与运维（新增）
- GitHub Actions（可选）：在 PR 上运行类型检查与单元测试；合并后触发 Wrangler 部署 Workers
- Cloudflare Pages：
  - Build 命令：`pnpm install && pnpm build`
  - 输出目录：`dist`
  - 环境变量：仅前端非敏感配置（如前端站点标题）；后端密钥全部置于 Workers Secrets
- 回滚策略：Pages 支持回滚到上一个构建；Workers 使用 `wrangler rollback`（或重新部署指定版本）

## 13. 迭代建议（超出MVP）
- 问卷内容后台化配置（JSON 驱动表单）
- 登录系统与权限控制（若未来需要）
- 监控面板（仅服务端错误与调用统计，不涉及用户行为）