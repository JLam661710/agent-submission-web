前端结果页与选题方案交互机制（正式版）

页面与路由
- `/result`：初始结果页，展示两项：
  - `report`（文本）：Coze 返回的相关性话题简报，支持 Markdown/纯文本渲染；缺省时显示占位提示。
  - `image`（图片）：Coze 返回的配图 URL；加载失败或缺省时显示占位图标。
  - 按钮“查看选题方案”→ 导航至 `/programme`。
- `/programme`：选题方案页，展示两层内容：
  - 顶部 `easyprogramme`（易读版）：结构化短句或 Markdown；作为“方案摘要”。
  - 下方按钮“查看详细方案”→ 展开下拉栏显示 `programme`（详细版）；再次点击可收起。
  - 提供“返回结果页”按钮回到 `/result`。

数据来源与解析
- 后端调用 Coze 工作流得到响应，其中 `data` 是 JSON 字符串：需二次 `JSON.parse` 后获得四字段：
  - `easyprogramme`（多行文本）
  - `image`（URL）
  - `programme`（多行文本）
  - `report`（多行文本）
- 前端消费后端返回的四字段，分别映射到页面显示。

渲染与容错
- 文本可能包含 Markdown（如 `###` 标题、列表）：建议使用安全 Markdown 渲染（如 `react-markdown` + `rehype-sanitize`）；无该依赖时退化为纯文本。
- 图片使用原始 URL 加载；不可用时显示占位组件与提示。
- 字段缺省：保持流程可用，显示轻量占位与解释文案，不阻断导航与展开。

交互与状态
- `/programme` 页“查看详细方案”按钮切换本地状态：`expanded=true/false` 控制下拉栏收起/展开。
- 支持移动端布局：`report` 文本区与图片区上下排列；按钮区固定底部或随内容滚动。

验收点（对应 PRD 第9节）
- `/result`：`report` 与 `image` 可见；“查看选题方案”跳转 `/programme` 成功。
- `/programme`：`easyprogramme` 可见；点击“查看详细方案”展开 `programme`；可返回 `/result`。

附录：视觉设计与组件标准（Tailwind CSS，移动端优先）

设计目标与原则
- 移动端优先：同一代码在手机上优先优化（单手操作、可点击区域≥44px）。
- 一致性与轻量：统一色彩与组件规范，尽量复用，减少自定义样式碎片。
- 清晰可读：正文 `text-base`、行距 `leading-relaxed`，卡片化信息分区，避免密集文本。

基础设计规范（Tailwind 推荐类）
- 版式与字体：`font-sans`（系统字体栈），正文 `text-base`，副标题 `text-lg`，页面主标题 `text-2xl`/`text-xl`；行距 `leading-relaxed`。
- 色彩（品牌与语义）：
  - 主色：`indigo-600`（按钮/高亮），悬停 `indigo-700`，活跃 `indigo-800`。
  - 中性色：`gray-50/100/200/300/700/900`（背景/边框/正文）。
  - 成功/警告/错误：`emerald-500` / `amber-500` / `rose-500`。
- 间距与容器：`max-w-md mx-auto px-4`；模块内 `space-y-4`；控件内边距 `h-10 px-4 py-2`。
- 圆角与阴影：卡片 `rounded-lg shadow-sm`；重点模块 `shadow-md`；输入框 `rounded-md`。
- 边框与分隔：`border border-gray-200`；卡片之间 `divide-y divide-gray-100`（按需）。
- 交互动效：`transition-colors transition-opacity duration-200 ease-out`；展开/收起 `transition-all`。

布局规范
- 顶部栏（AppBar）：`sticky top-0 z-30 bg-white/95 backdrop-blur border-b`，包含标题与进度。
- 页面容器：`max-w-md mx-auto px-4 py-4`；内容区 `flex flex-col gap-4`。
- 底部操作栏（CTA）：`sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t p-3`，主次按钮并排或纵排（窄屏时纵排）。

通用组件标准（类名与状态）
- 按钮 Button：
  - Primary：`h-10 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:pointer-events-none`。
  - Secondary：`h-10 px-4 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100`。
  - Ghost/Text：`h-10 px-2 text-indigo-600 hover:text-indigo-700`（用于次要操作）。
- 输入 Input / 文本域 Textarea：
  - 基本：`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400`。
  - 聚焦：`focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`。
  - 错误：`border-rose-400` + 错误文案 `text-rose-600 text-sm mt-1`。
  - 计数（可选）：底部 `text-xs text-gray-500` 显示字符数/上限。
- 单选 Select（合作风格偏好）：`w-full h-10 rounded-md border border-gray-300 pr-10`（右侧下拉箭头图标，移动端可省略）。
- 打分 RadioGroup（1–5）：圆形选项 `w-10 h-10 rounded-full flex items-center justify-center border`；选中态 `bg-indigo-600 text-white border-indigo-600`；提供数字+描述。
- 卡片 Card：`rounded-lg border border-gray-200 bg-white p-4 shadow-sm`；标题区 `text-lg font-medium text-gray-900`；内容区 `text-gray-700`。
- 进度 Progress/Steps：顶部条 `h-1 bg-gray-100`，进度 `bg-indigo-600`，或使用步骤条 `flex items-center gap-2` + 当前高亮。
- 折叠面板 Expandable：容器 `rounded-lg border p-0 overflow-hidden`；标题行 `p-4 flex items-center justify-between`；内容区 `p-4`；展开状态 `aria-expanded` 与图标旋转。
- Markdown 渲染区：容器 `prose prose-sm max-w-none`（如使用 typography 插件）；无插件时使用基础文本样式+列表缩进 `list-disc pl-5`。
- 图片展示区：容器 `rounded-lg border overflow-hidden`；图片 `w-full h-48 object-cover bg-gray-100`；加载失败显示占位 `flex items-center justify-center text-gray-400`。
- 提示与消息：
  - 空状态：`rounded-lg border border-dashed p-4 text-center text-gray-500`，含简短解释。
  - 成功条：`rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 p-3`。
  - 错误区：`rounded-md bg-rose-50 text-rose-700 border border-rose-200 p-3`，与控件就近错误并存。
- Skeleton（加载骨架）：`animate-pulse bg-gray-100 rounded`；用于图片与文本块。

页面规范（对齐问卷/结果/选题流程）
- 问卷页（13题，多步）：
  - 结构：每题一个卡片；顶部显示进度；底部显示“上一题/下一题/保存草稿/提交”。
  - 控件：文本题使用 `Textarea`；打分题使用 `RadioGroup`；选择题使用 `Select`；挑战雷达使用动态 1–3 组（卡片内折叠/增减）。
  - 草稿：本地保存提示条（轻量成功条），恢复时显示“已从草稿恢复”。
  - 提交锁定：提交完成后禁用控件（`disabled`），保留再次提交入口（新记录）。
- `/result` 结果页：
  - 排版：上方 `report` 文本（Markdown/纯文本）；下方 `image` 图片预览；按钮区包含“查看选题方案”。
  - 空值容错：文本缺省显示空状态卡片；图片缺省显示占位图标与提示文案。
  - 操作：提供复制文本按钮（可选，`navigator.clipboard`），或引导“截图保存”。
- `/programme` 选题方案页：
  - 摘要区：`easyprogramme`（Markdown/纯文本），置顶卡片；
  - 详细区：折叠面板“查看详细方案”，展开显示 `programme`；再次点击收起；
  - 返回操作：底部次要按钮“返回结果页”。

交互与状态
- 聚焦/悬停/按压：统一 `focus:ring-indigo-500`；悬停高亮仅在可用平台触发；按压降低亮度或缩放 0.98（可选）。
- 错误处理：就近错误+统一错误区；表单校验失败时滚动至首个错误项。
- 加载：提交按钮进入加载态 `disabled` + `animate-pulse` 或按钮内旋转图标（可后续引入）。
- 空值与回退：所有 Coze 字段缺省时提供占位，不阻断导航；图片加载失败回退到占位卡片。
- 草稿与重复提交：同会话锁定当前提交；跨会话允许重新提交并提示可能重复（依据昵称/时间窗口）。

可访问性与可读性
- 标签与关联：每个输入控件有显式 `<label>`；错误文本 `aria-live="polite"`；折叠面板使用 `aria-expanded`。
- 对比度：文字与背景对比度符合移动端可读性；避免仅用颜色表达状态（配合图标/文本）。
- 触控尺寸：交互元素最小尺寸 44px；列表项间距适中，避免误触。

性能与优化
- 代码分割与按需加载：问卷分段懒加载；Markdown 渲染按需引入。
- 节流与防抖：草稿写入本地存储节流；避免频繁 IO。
- 图片优化：`loading="lazy"`（前端实现时）；占位骨架提升感知速度。

验收清单（UI/交互）
- 问卷页：标题/进度/卡片/控件与错误提示完整；草稿保存与恢复提示正确。
- 结果页：`report` 与 `image` 正常展示；缺省显示占位；可跳转到 `/programme`。
- 选题页：`easyprogramme` 展示；折叠面板展开 `programme`；可返回 `/result`。
- 状态：加载/禁用/错误/空状态均可视化；移动端触控与可读性达标。