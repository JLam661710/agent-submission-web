# 智能体开发选题灵感大师 · 项目综述（Workspace）

本文对当前项目进行系统性综述，聚焦产品设计理念、问题意识、技术链路（技术选型与设计理念的匹配）、核心功能与价值、错误处理与可靠性、测试验收，以及后续迭代方向与边界。

## 一、核心理念与问题意识
- 目标与动机：从“自身与附近”出发，帮助填写者将个人技能、烦恼与身边/社区挑战建立映射，快速形成可落地的 Coze 智能体/工作流选题与学习路径（见 `purpose_of_development.md`).
- 问题意识：现实中常见“方向不清晰、信息噪音高、学习无闭环”的困境；本项目以轻量问卷+LLM分析，将零散想法转为“选题—MVP—挑战—学习—评价”的闭环认知。
- 使用边界：不采集行为数据；仅保存问卷与分析文本；无登录与复杂权限（MVP）。

## 二、产品设计理念
- 轻量化与移动端优先：页面容器与组件统一规范（`max-w-md mx-auto px-4`、粘性 AppBar/底部 CTA、控件最小触控 44px），保证移动端可读与易用（见 `prd.md`, `ui_flow.md`).
- 结构化问卷（13题）：分四部分（欢迎与热身、日常场景挖掘、身边世界观察、梦想与行动蓝图），引导具体场景与群体观察，避免抽象化（见 `questionnaire.md`).
- 结果页仅展示分析：提交后不回显原始答案，只展示 Coze 工作流生成的四字段；强调“相关性话题报告”和“多维价值选题方案”的认知增量（见 `ui_flow.md`, `prd.md`).
- 草稿与重复提交：本地草稿自动保存/恢复；同会话锁定提交但允许再次提交（新 `submission_id`）。

## 三、技术链路与选型匹配
### 1) 前端（React + TypeScript + Vite + Tailwind）
- 框架与构建：`React 18` + `TypeScript` + `Vite`，轻量开发体验、快速构建（`frontend/package.json`).
- 样式与可读性：`tailwindcss` + `@tailwindcss/forms/typography/line-clamp/aspect-ratio`，统一组件语义与移动端体验（`frontend/tailwind.config.cjs`, `frontend/src/index.css`).
- Markdown 渲染：`react-markdown` + `rehype-sanitize`（安全渲染），结果/方案页支持结构化文本（`frontend/src/pages/Result.tsx`, `frontend/src/pages/Programme.tsx`).
- 典型页面：
  - `frontend/src/pages/Home.tsx` 首屏与引导；
  - `frontend/src/pages/q/*` 多步问卷（`Warmup.tsx`、`Daily.tsx`、`Nearby.tsx`、`Blueprint.tsx`）；
  - `frontend/src/pages/Result.tsx` 展示 `coze_report` 与 `coze_image`；
  - `frontend/src/pages/Programme.tsx` 展示 `coze_easyprogramme` 并展开 `coze_programme`。
- 前端 API 契约：统一 `Input`/`SubmissionResponse` 类型，与后端/Coze 字段一致；默认 `API_BASE` 可通过 `VITE_API_BASE_URL` 配置（`frontend/src/lib/api.ts`).

### 2) 后端与外部集成（Node.js + Hono/Express，Cloudflare Workers）
- 服务形态：建议使用 Cloudflare Workers 托管 API（轻量/Serverless 友好）；也可用 Express 传统形态（`tech_selection.md`).
- 外部服务：
  - 飞书多维表（Bitable）：创建记录并填充问卷与 Coze 四字段；鉴权与字段映射见 `integration/bitable_client.js`, `integration/bitable_field_mapping.json`。
  - Coze 工作流 API：以统一 `_input` JSON 调用，返回 `data` 字段（字符串）需二次 `JSON.parse` 得到 `easyprogramme/image/programme/report`（见 `coze_workflow_related/call_api_method.md`, `coze_input_examples.md`).
- 数据契约（统一）：
  - 请求：`POST /api/submissions`，载荷示例见 `tech_selection.md` 与 `e2e/payloads/sample_submission.json`（包含 `submission_id`、`_input`、`submitted_at`）。
  - 响应：`{ submission_id, coze_easyprogramme, coze_image, coze_programme, coze_report, debug_url? }`（见 `frontend/src/lib/api.ts`）。
- 流程（时序，MVP）：
  1) 前端校验通过后生成 `submission_id` 并提交；
  2) 后端写入 Bitable（含 `submitted_at` 与问卷映射字段）；
  3) 后端调用 Coze 工作流，解析四字段；
  4) 更新 Bitable 的四字段；
  5) 返回前端用于 `/result` 与 `/programme` 展示（见 `prd.md`, `tech_selection.md`).
- 安全与配置：密钥仅后端使用（Bitable/Coze）；Cloudflare Secrets 管理；CORS 限制来源；日志记录 `detail.logid` 与必要快照（不含行为数据）。

### 3) 设计理念与选型匹配评述
- 轻量化与一致性：React + Tailwind 满足移动端优先与统一组件规范；`react-markdown` 贴合“LLM文本为主”的呈现需求。
- Serverless 与外部 API：Workers+Bitable+Coze 的组合降低维护成本，契合“无后台复杂系统”的MVP边界。
- 数据契约统一：`snake_case` 英文 key（`_input` 包裹）贯穿前后端与 Coze，避免粘合层不一致导致的出错。

## 四、核心功能与用户价值
- 完整问卷流：13题覆盖“烦恼—技能—兴趣—身边—合作—构想—信心—挑战—学习目标”，并提供进度指示与草稿保存（`ProgressBar` 与本地存储）。
- 结果页：
  - `/result` 展示 `coze_report`（可 Markdown）与 `coze_image`；提供复制文本按钮；缺省与图片加载失败有占位与提示（`frontend/src/pages/Result.tsx`).
  - CTA 跳转 `/programme`。
- 选题方案页：
  - `/programme` 顶部展示 `coze_easyprogramme`（摘要）；折叠区“查看详细方案”展开 `coze_programme`；返回 `/result` 操作（`frontend/src/pages/Programme.tsx`).
- 用户价值：
  - 降噪与定向：将零散输入转为“相关性话题报告/价值轴选题方案”，减少“无目的学习”。
  - 结构化沉淀：Bitable 长期存储，便于社群复盘与再利用。
  - 低门槛：仅昵称识别，无登录；移动端流畅。

## 五、体验规范与可访问性
- 视觉与组件标准：统一品牌色 `indigo-600`、中性色 `gray-*`；表单状态（聚焦/错误）与按钮状态一致（见 `prd.md`, `ui_flow.md`).
- 可访问性：显式 `label`、`aria-live` 错误提示、折叠 `aria-expanded`；对比度与键盘可用性达标（`ui_flow.md`).
- 容错与回退：文本缺省使用占位卡片；图片失败显示占位；Markdown 安全渲染或退化为纯文本。

## 六、错误处理与可靠性
- 前端：就近校验与统一错误区；提交期间控件禁用；同会话锁定防重复（`prd.md`).
- 后端：Coze/ Bitable 调用加超时与指数退避重试；以 `submission_id` 做幂等键；错误码与文案映射（`tech_selection.md`).
- 数据约束：分值范围 1–5；`collaboration_prefer ∈ {A,B,C,D}`；`challenges` 1–3 项且每项 `score ∈ [1..5]`（`prd.md`, `coze_llm_node.md`).

## 七、测试与验收
- E2E 样例：`e2e/results/*` 展示一次端到端提交的请求、响应与 Bitable 记录；可用于联调和回归。
- 验收标准：
  - 功能：问卷完整；草稿可保存/恢复；提交后不可编辑且可重新提交；页面按路由展示四字段。
  - 数据：Bitable 字段与问卷映射完整；四字段成功写入；ID与时间有效。
  - 体验：移动端正常；错误提示清晰；防重复机制有效（见 `prd.md` 第9节）。

## 八、后续迭代方向（建议）
- 短期（MVP增强）：
  - 表单动态性增强：挑战雷达（1–3项）交互优化与折叠卡片；滚动至首个错误项与聚焦提示；草稿节流写入。
  - 可靠性：Coze 结果结构校验与缺字段回退；Bitable 幂等与失败重试策略固化。
  - 性能：路由级代码分割；Markdown渲染按需引入；图片 `loading="lazy"`。
- 中期（不改变核心边界）：
  - 问卷内容后台化配置（JSON 驱动）；
  - 轻量统计与监控（仅服务端错误/调用统计，不涉用户行为）；
  - 速率限制与提示（IP/会话级限速与友好文案）。
- 远期（可能）：
  - 登录与权限（如确有社群治理需要）；
  - 内部分析看板（优先使用 Bitable 的原生视图与多维看板）。

## 九、风险与边界
- 外部依赖风险：飞书/Coze 平台的鉴权与配额、网络波动；需超时与重试策略与可回退提示。
- 输出稳定性：LLM 输出结构与长度波动；需校验与降级路径（例如退化为纯文本、空状态占位）。
- 隐私与合规：不采集行为数据；前端不暴露任何密钥；仅存储问卷与分析文本。

## 十、成功度量（试点建议）
- 时间节省：从填写到得到方向建议的平均时长（对照工作坊/社群活动）。
- 信息一致性：个人—团队—社区口径的一致性反馈（定性与轻量量化）。
- 复用率：Bitable 记录被复盘与再利用的次数（如派生行动/PoC比例）。

## 现状快照（部分文件引用）
- 前端页面与组件：`frontend/src/pages/Home.tsx`, `frontend/src/pages/q/*.tsx`, `frontend/src/pages/Result.tsx`, `frontend/src/pages/Programme.tsx`。
- 前端 API 类型与配置：`frontend/src/lib/api.ts`。
- 设计/产品文档：`prd.md`, `ui_flow.md`, `questionnaire.md`, `original_idea_info.md`, `purpose_of_development.md`, `tech_selection.md`。
- 集成与示例：`integration/*`, `coze_workflow_related/*`, `e2e/*`。

—— 本综述与现有 PRD/技术选型/流程文档保持一致，作为 Workspace 层面的统一认知底稿，供后续实现与迭代参考。