# PRD：智能体开发选题灵感大师（MVP）

版本：v0.1（依据 info.md 整理，不改变原意）

## 1. 项目概述
- 目标：社群互动与信息收集，通过更生动、有趣的问卷设计，帮助用户从自身与“附近”出发，挖掘智能体/工作流学习与应用的方向，并在提交后由 Coze LLM 生成“相关性话题报告”。
- 前端形态：网页界面；支持进度指示器、草稿暂存；提交后不可修改，允许重新提交；结果页仅展示 LLM 分析反馈，不回显问卷答案。
- 后端联动：提交后写入飞书多维表（Bitable）并调用 Coze API，返回分析文本写入 Bitable 同时展示给用户。
- 身份输入：仅需“昵称”，不做真实注册与登录。

## 2. 范围与非范围
- MVP范围：13问的问卷流程、数据存储到 Bitable、调用 Coze 生成分析、基础错误提示、移动端适配、重复提交机制。
- 非范围：后台问卷内容在线配置（后续迭代）；登录系统与前端数据看板（可用 Bitable 自身看板代替）；行为数据采集（不记录）。

## 3. 用户体验与交互
- 进度指示：多步表单，实时显示完成度。
- 草稿暂存：本地存储自动保存草稿，用户可中断后返回继续填写。
- 提交规则：
  - 提交后当前填写内容不可编辑；支持“重新提交”（新建一次提交记录）。
  - 结果页不回显问卷答案，仅显示 Coze 分析反馈文本；提示用户可复制或截图。
- 重复提交防范：
  - 同会话：提交后锁定该次提交；重新提交会生成新的 `submission_id`。
  - 跨会话：可再次填写；可提示“可能重复”但不强制拦截（依据昵称与时间窗口）。
- 错误提示：字段就近提示+统一错误区，文案简洁明确。

### 结果页交互与路由（新增）
- 初始结果页（`/result`）：
  - 展示 `coze_report` 文本与 `coze_image` 预览图（缺省时显示占位提示）。
  - 按钮“查看选题方案”→ 跳转到选题方案页（`/programme`）。
- 选题方案页（`/programme`）：
  - 顶部展示 `coze_easyprogramme`（选题方案·易读版）。
  - 下方按钮“查看详细方案”→ 展开下拉栏，展示 `coze_programme`（选题方案·详细版）。
  - 提供“返回结果页”按钮返回 `/result`。
- 内容渲染：
  - `coze_easyprogramme`/`coze_programme`/`coze_report` 若含 Markdown 标题/列表，前端以安全 Markdown 渲染（或转为纯文本）保证可读性；`coze_image` 按 URL 展示图片。
  - 字段缺省时给出轻量占位与提示，不阻断页面流程。

#### 视觉与组件标准（移动端优先，Tailwind CSS）
- 设计原则：移动端优先、组件复用、一致性与可读性；控件最小触控尺寸 44px。
- 容器与布局：`max-w-md mx-auto px-4`；顶部 `sticky` AppBar，底部 `sticky` CTA 操作栏。
- 色彩与版式：主色 `indigo-600`，中性色 `gray-*`；正文 `text-base leading-relaxed`，主标题 `text-2xl`。
- 组件规范：
  - Button（Primary/Secondary/Ghost）：统一高度 `h-10`、圆角 `rounded-lg`、状态（hover/active/disabled）。
  - Input/Textarea：`rounded-md border-gray-300`；聚焦 `focus:ring-2 ring-indigo-500`；错误态 `border-rose-400`+就近错误文案。
  - Select（合作风格偏好）：`h-10 rounded-md border`；移动端可使用原生下拉。
  - RadioGroup（1–5 打分）：圆形选项，选中态 `bg-indigo-600 text-white`；附加分值文案。
  - Card：`rounded-lg border p-4 shadow-sm`；用于题目与结果区块。
  - Expandable：用于 `/programme` 详细方案，折叠/展开带过渡。
  - Markdown 渲染区：优先 `react-markdown` + `rehype-sanitize`；无依赖退化为纯文本样式。
  - 图片：`w-full h-48 object-cover`；失败显示占位卡片与提示。
- 状态与容错：提交加载禁用；错误区统一提示；所有 Coze 字段缺省显示占位，流程不阻断。
- 可访问性：表单 `label` 显式关联；错误文案 `aria-live`；折叠面板 `aria-expanded`；对比度与键盘可用性达标。


## 4. 问卷结构（13题，按4部分组织）
第一部分：欢迎与热身（2题）
- Q1 昵称识别：单行文本（必填）。
- Q2 角色标签：单行文本，1–3个关键词（必填）。

第二部分：日常场景挖掘（4题）
- Q3 最近的小烦恼：多行文本（必填）。
- Q4 技能超能力：多行文本（必填）。
- Q5 兴趣热度计：
  - 打分：单选 1–5（必填）。
  - 说明：单行文本（必填）。
- Q6 学习新事物态度：单选 1–5（必填）。

第三部分：身边世界观察（3题）
- Q7 身边人的日常挑战：多行文本（必填）。
- Q8 社区共同声音：多行文本（必填）。
- Q9 合作风格偏好：下拉单选（A/B/C/D，必填）；若选 D 出现“其他说明”文本输入（可填）。

第四部分：梦想与行动蓝图（4题）
- Q10 智能工具构想：多行文本（必填）。
- Q11 落地信心指数：单选 1–5（必填）。
- Q12 挑战雷达：
  - 障碍列表：1–3项，多行文本（至少1项必填）。
  - 每项难度打分：单选 1–5。
- Q13 学习指南针：单行文本（必填）。

## 5. 数据契约与存储映射
英文 key（前端/后端/Coze 统一）与 Bitable 中文列一一对应，遵循 `snake_case`。

- 元数据
  - 提交时间 → `submitted_at`（日期时间，后端填充）
  - 唯一提交ID → `submission_id`（文本，UUID，防重复）

- 问卷字段映射（核心）
  - 昵称 → `nickname`（文本，Q1）
  - 角色标签 → `role_tags`（文本，Q2）
  - 最近的小烦恼 → `recent_annoyance`（文本，Q3，多行）
  - 技能超能力 → `skills`（文本，Q4，多行）
  - 兴趣热度分数 → `interest_score`（数字，Q5）
  - 兴趣热度说明 → `interest_description`（文本，Q5）
  - 学习新事物态度分数 → `learning_attitude_sc`（数字，Q6）
  - 身边人的日常挑战 → `people_around_challe`（文本，Q7）
  - 社区共同声音 → `community_voices`（文本，Q8）
  - 合作风格偏好 → `collaboration_prefer`（单选 A/B/C/D，Q9）
  - 智能工具构想 → `tool_idea`（文本，Q10）
  - 落地信心指数分数 → `confidence_score`（数字，Q11）
  - 挑战障碍1 → `challenge_1`（文本，Q12 可选）
  - 挑战障碍1分数 → `challenge_1_score`（数字，Q12 可选）
  - 挑战障碍2 → `challenge_2`（文本，Q12 可选）
  - 挑战障碍2分数 → `challenge_2_score`（数字，Q12 可选）
  - 挑战障碍3 → `challenge_3`（文本，Q12 可选）
  - 挑战障碍3分数 → `challenge_3_score`（数字，Q12 可选）
  - 学习指南针 → `learning_goal`（文本，Q13）
  
 - Coze 输出字段映射（新增，四个字段）
   - Coze 易读方案 → `coze_easyprogramme`（文本，多行；对应输出 `easyprogramme`）
   - Coze 配图 URL → `coze_image`（URL；对应输出 `image`）
   - Coze 多维价值选题方案 → `coze_programme`（文本，多行；对应输出 `programme`）
   - Coze 相关性话题报告 → `coze_report`（文本，多行；对应输出 `report`）

  注：受 Coze 参数限制，“合作风格偏好其他说明”不作为 LLM 输入；如需存储仅写入 Bitable 中文列（不纳入统一英文 key）。
  注：为统一命名规范，内部采用 `snake_case` 英文 key；与 Coze 实际返回的字段名（`easyprogramme`/`image`/`programme`/`report`）一一映射。

- Coze 输入 JSON（与 info.md 一致，采用 `_input` 包裹与截断参数名）
```
{
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
  }
}
```

- Coze 输出 JSON（用于后端解析并写入 Bitable）
```
{
  "data": {
    "easyprogramme": "string",
    "image": "https://...",
    "programme": "string",
    "report": "string"
  }
}
```

## 6. 约束与规则
- 枚举与范围：
  - `interest_score`/`learning_attitude_sc`/`confidence_score` ∈ [1..5]
  - `collaboration_prefer` ∈ {A,B,C,D}
  - `challenges` 长度 1–3；每个 `score` ∈ [1..5]
- 隐私与数据：不采集行为数据；仅存储问卷与分析文本。
- 兼容性：适配移动端；页面加载速度优化。

## 7. 提交流程（时序）
1) 用户填写表单（草稿自动保存）
2) 前端校验通过 → 生成 `submission_id` → 发送到后端
3) 后端写入 Bitable（含 `submitted_at`）
4) 后端根据 `_input` JSON 调用 Coze API → 返回分析文本
5) 后端解析 Coze 输出，更新 Bitable 的 `coze_easyprogramme`、`coze_image`、`coze_programme`、`coze_report` 字段
6) 前端展示结果页（仅 Coze 分析），不回显问卷答案

异常流程：Bitable 写入失败或 Coze 失败 → 前端统一错误区提示“提交失败/分析失败”，提供重试与草稿保留。

## 8. 错误处理与提示
- 字段校验错误：就近提示（红框+简短文案）。
- 网络/服务错误：统一错误区，提供“重试提交/导出草稿”。
- 重复提交提示：同会话锁定；跨会话可提示可能重复。

## 9. 验收标准
- 功能：13题完整可填；草稿可保存与恢复；提交后不可编辑且可重新提交；结果页按交互要求展示。
- 数据：Bitable 记录字段与问卷映射完整；Coze 输出四字段（`coze_easyprogramme`、`coze_image`、`coze_programme`、`coze_report`）成功写入；时间与ID有效。
- 体验：移动端正常；首屏加载优化；错误提示清晰；防重复机制生效。
- UI交互：
  - `/result` 展示 `coze_report` 与 `coze_image`；存在“查看选题方案”按钮并可跳转 `/programme`。
  - `/programme` 展示 `coze_easyprogramme`；存在“查看详细方案”按钮并可展开 `coze_programme`；提供返回 `/result` 的操作。
 - 视觉与组件规范（新增）：
   - 页面容器、顶部/底部粘性栏、按钮/输入/选择/打分/卡片/折叠面板按规范实现；
   - Markdown 渲染安全并可回退；图片加载失败显示占位；
   - 可访问性（标签、对比度、ARIA）与触控尺寸达标；
   - 空状态/错误/加载态均有一致视觉反馈。

## 10. 风险与依赖
- 飞书开放平台：鉴权与配额、网络波动。
- Coze API：模型输出波动与延迟。
- 前端存储：用户关闭浏览器导致草稿丢失（通过自动保存缓解）。

## 11. 迭代方向（不纳入MVP）
- 后台化问卷配置；登录系统；内部数据看板（暂用 Bitable）。