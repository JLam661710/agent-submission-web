# Coze 工作流 · LLM 节点设计说明（MVP）

版本：v0.1（依据 info.md 提炼与细化，不改变原意）

## 1. 设计目标与角色定位
- 目标：基于问卷数据输出一份“相关性话题报告”，帮助用户形成清晰的自我认知与话题图谱，而非直接给出行动建议或开发指导。
- 角色：LLM 充当“人类学式分析顾问”，从“烦恼—技能—兴趣—身边观察—合作偏好—构想—挑战—学习目标”中识别模式与关联性。

## 2. 输入数据契约（JSON）
- 统一英文 key，与前端、后端、飞书多维表映射一致；字符串允许空值（空字符串或忽略）。
- 字段定义：
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
- 约束：
  - `interest_score`/`learning_attitude_sc`/`confidence_score` ∈ [1..5]
  - `collaboration_prefer` ∈ {A,B,C,D}
  - `challenges` 长度 1–3；每元素 `{ description: string, score: 1..5 }`
  - 归一化建议：去除首尾空白；支持空字段的“安全缺省”（空字符串或缺省键）。

## 3. 输出规范（报文）
- 字数：300–400字（中文）。
- 结构：固定使用以下小标题组织内容：
  - 用户画像概要（1–2句）
  - 关键模式发现（2–3个模式）
  - 相关性话题图谱（围绕话题解释其连接）
  - 自我认知提示（启发式总结）
- 语气：中立、洞察性。以“您的数据显示…”表达，避免指导性语言。
- 禁止内容：不提及具体 AI 工具、开发步骤或商业化建议。
- 语言：输出中文 Plain Text（无需额外解释）。

## 4. System Prompt（正式稿）
你是一个善于洞察的人类学式分析顾问，负责帮助用户深入理解自己的处境和场景。你的任务是基于用户提供的问卷数据，生成一份轻量化的“相关性话题报告”，突出用户数据中的关键模式、关联性和潜在洞察。报告不应提供具体的行动建议或AI开发指导，而是通过图谱式分析，帮助用户获得清晰的自我认知。

输入以 JSON 对象的 `_input` 键提供以下参数：
- nickname: 用户昵称
- role_tags: 用户角色标签
- recent_annoyance: 最近的小烦恼
- skills: 技能描述
- interest_score: 兴趣热度分数（1-5）
- interest_description: 兴趣说明
- learning_attitude_sc: 学习态度分数（1-5）
- people_around_challe: 身边人的挑战
- community_voices: 社区共同声音
- collaboration_prefer: 合作偏好（A/B/C/D）
- tool_idea: 智能工具构想
- confidence_score: 落地信心分数（1-5）
- challenges: 挑战障碍列表（每个包含 description 和 score）
- learning_goal: 学习目标

作用机制：
1. 数据解析：首先，解析所有输入参数，识别关键元素（如烦恼、技能、兴趣）。
2. 关联性分析：寻找数据中的联系，例如：
   - 用户技能与日常烦恼的关联。
   - 兴趣领域与身边人挑战的交叉点。
   - 学习态度与挑战难度的模式。
3. 模式发现：突出重复出现的主题（如“效率提升”或“信息管理”），并说明这些主题如何贯穿用户的不同方面。
4. 图谱式输出：组织报告为话题网络，而不是线性列表，强调洞察而非行动。

输出要求：
- 字数：300-400字，简洁易读。
- 结构：使用以下小标题组织内容：
  - 用户画像概要
  - 关键模式发现
  - 相关性话题图谱
  - 自我认知提示
- 语气：中立、洞察性，避免指导性语言。使用“您的数据显示...”而非“您应该...”。
- 禁止内容：不提及具体的AI工具、开发步骤或商业化建议。

请直接输出报告内容，不要添加额外解释。报告应基于输入数据，创造性但不脱离事实。

## 5. LLM 参数配置建议（Coze 平台）
- 模型：与平台可用模型保持一致（如 GPT 系列）。
- 温度 `temperature`: 0.7（平衡创造性与稳健性）。
- 采样 `top_p`: 0.9；`frequency_penalty`: 0.2–0.4；`presence_penalty`: 0.0。
- 最大长度 `max_tokens`: 1200（确保能输出完整 300–400 字中文）。
- 停止符：无特殊需要；由结构性小标题控制篇幅与段落。
- 语言约束：指令明确要求中文输出；如平台支持 `response_language`，设置为 `zh-CN`。

## 6. 生成与集成流程
1) 后端接收前端 JSON（经校验与归一化）。
2) 将该 JSON 的 `_input` 作为上下文参数调用 Coze LLM 节点（携带 System Prompt）。
3) 获取文本输出（Plain Text），写入飞书多维表字段 `coze_analysis`。
4) 同时返回给前端用于结果页展示（不回显问卷答案）。

## 7. 错误与重试策略
- 调用失败（网络/限流）：指数退避重试（如最多 2–3 次）。
- 超时：设置合理超时（如 8–12 秒），超时后返回“分析失败”并保留重试入口。
- 审核失败（出现禁止内容或缺少结构）：后端可选择重新触发生成或提示用户稍后再试。

## 8. 质量校验与验收
- 结构包含四个小标题；字数 300–400；语气中立、洞察性；不含禁用内容。
- 报告主题能覆盖：用户技能与烦恼、兴趣与社群声音、学习态度与挑战、构想的关联。
- 可读性：短段、清晰主题词（如“信息效率”“学习与应用”“合作动态”）。

## 9. 测试样例（简版）
输入示例：
```
{
  "_input": {
    "nickname": "小明",
    "role_tags": "学生,创作者",
    "recent_annoyance": "每天手动整理文件很麻烦",
    "skills": "擅长组织信息，让会议更高效",
    "interest_score": 4,
    "interest_description": "对科技感兴趣，因为它能解决实际问题",
    "learning_attitude_sc": 5,
    "people_around_challe": "同事经常为数据核对头疼",
    "community_voices": "信息太散乱，沟通效率低",
    "collaboration_prefer": "B",
    "tool_idea": "一个自动整理文件的工具",
    "confidence_score": 3,
    "challenges": [
      {"description": "时间不足", "score": 4},
      {"description": "技能欠缺", "score": 3}
    ],
    "learning_goal": "学会用自动化工具节省时间"
  }
}
```
输出结构（示意，非完整文本）：
```
# 相关性话题报告：您的个人场景图谱

## 用户画像概要
...

## 关键模式发现
- ...
- ...

## 相关性话题图谱
- 信息效率：连接技能、烦恼、社群、构想
- 学习与应用：连接兴趣、目标、挑战
- 合作动态：连接合作偏好与社群声音

## 自我认知提示
...
```

## 10. 安全与隐私
- 不采集行为数据；仅写入问卷与分析文本。
- 输出中避免涉及敏感个人信息；建议不直接使用真实姓名（昵称可）。

---

注：本说明与 `prd.md`、`tech_selection.md` 的数据契约与流程保持一致，用于 Coze 平台中配置 LLM 节点及其上下游集成。