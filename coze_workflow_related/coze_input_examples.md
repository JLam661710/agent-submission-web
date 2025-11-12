# Coze 工作流输入案例集（v1）

说明：
- 字段使用截断英文 key：`nickname`、`role_tags`、`recent_annoyance`、`skills`、`interest_score`、`interest_description`、`learning_attitude_sc`、`people_around_challe`、`community_voices`、`collaboration_prefer`、`tool_idea`、`confidence_score`、`challenges`（数组，元素含 `description` 与 `score`）、`learning_goal`。
- 分数范围建议为 1–5；`collaboration_prefer` 为 `A/B/C/D`。
- 覆盖常见与边界场景（字段缺省、数组为空、长文本、双语、挑战项较多等）。

示例 01 — 学生/创作者，效率与信息管理
```json
{
  "nickname": "小林",
  "role_tags": "学生,创作者",
  "recent_annoyance": "资料分散，每次找文件都很耗时",
  "skills": "擅长结构化整理和会议纪要",
  "interest_score": 4,
  "interest_description": "对自动化和信息组织特别感兴趣",
  "learning_attitude_sc": 5,
  "people_around_challe": "同学们常为作业资料混乱而焦虑",
  "community_voices": "大家觉得信息太碎，缺统一入口",
  "collaboration_prefer": "B",
  "tool_idea": "一个自动聚合资料并归档的助手",
  "confidence_score": 3,
  "challenges": [
    {"description": "时间不足", "score": 4},
    {"description": "工具太多难以选择", "score": 3}
  ],
  "learning_goal": "学会用自动化规则统一归档"
}
```

示例 02 — 自由职业者/家长，知识整理与复用
```json
{
  "nickname": "玥",
  "role_tags": "自由职业者,家长",
  "recent_annoyance": "上下文切换频繁，工作与育儿之间难以平衡",
  "skills": "流程拆解与任务分配",
  "interest_score": 5,
  "interest_description": "希望建立可复用的知识摘要",
  "learning_attitude_sc": 3,
  "people_around_challe": "小店老板们缺少数字化工具",
  "community_voices": "不信任网上教程，质量参差不齐",
  "collaboration_prefer": "A",
  "tool_idea": "知识摘要聚合与共享",
  "confidence_score": 2,
  "challenges": [
    {"description": "信息噪音高", "score": 5},
    {"description": "缺乏可信知识总结", "score": 4},
    {"description": "缺少协作伙伴", "score": 3}
  ],
  "learning_goal": "快速搭建知识库"
}
```

示例 03 — 工程师/创客，模板化原型构建
```json
{
  "nickname": "东",
  "role_tags": "工程师,创客",
  "recent_annoyance": "调研周期长，原型迭代跟不上",
  "skills": "系统设计与原型搭建",
  "interest_score": 3,
  "interest_description": "对开源工具好奇但担心维护成本",
  "learning_attitude_sc": 5,
  "people_around_challe": "团队不熟悉模板化方法",
  "community_voices": "缺少可复用的原型模板",
  "collaboration_prefer": "C",
  "tool_idea": "我提供框架，他们完成实现",
  "confidence_score": 4,
  "challenges": [
    {"description": "调研时间长", "score": 4},
    {"description": "技能边界不清晰", "score": 3}
  ],
  "learning_goal": "学会用模板加速原型构建"
}
```

示例 04 — 研究生/志愿者，跨项目资料对齐
```json
{
  "nickname": "阿洛",
  "role_tags": "研究生,志愿者",
  "recent_annoyance": "不同文档版本混用",
  "skills": "资料整理与版本管理",
  "interest_score": 2,
  "interest_description": "偏向稳定、易维护的轻量工具",
  "learning_attitude_sc": 4,
  "people_around_challe": "项目之间缺少统一资料口径",
  "community_voices": "社区缺少跨项目协作规范",
  "collaboration_prefer": "B",
  "tool_idea": "跨项目资料对齐工具",
  "confidence_score": 1,
  "challenges": [
    {"description": "数据来源不一致", "score": 5},
    {"description": "沟通成本高", "score": 4}
  ],
  "learning_goal": "建立跨项目资料口径"
}
```

示例 05 — 字段部分缺省（空字符串），指标梳理
```json
{
  "nickname": "阿慧",
  "role_tags": "运营",
  "recent_annoyance": "",
  "skills": "数据看板搭建",
  "interest_score": 3,
  "interest_description": "",
  "learning_attitude_sc": 4,
  "people_around_challe": "",
  "community_voices": "团队指标不统一",
  "collaboration_prefer": "B",
  "tool_idea": "",
  "confidence_score": 3,
  "challenges": [
    {"description": "目标不清晰", "score": 3}
  ],
  "learning_goal": "学会梳理指标口径"
}
```

示例 06 — 双语与跨平台同步
```json
{
  "nickname": "Leo",
  "role_tags": "产品经理,创作者",
  "recent_annoyance": "会议纪要难以追踪，Follow-up容易遗漏",
  "skills": "OKR拆解与需求分析",
  "interest_score": 5,
  "interest_description": "Interested in automation and knowledge graphs for productivity",
  "learning_attitude_sc": 4,
  "people_around_challe": "团队协同工具碎片化",
  "community_voices": "希望有一体化的协作入口",
  "collaboration_prefer": "A",
  "tool_idea": "自动同步会议纪要到任务看板",
  "confidence_score": 4,
  "challenges": [
    {"description": "跨工具数据同步困难", "score": 4},
    {"description": "权限管理复杂", "score": 3}
  ],
  "learning_goal": "掌握跨平台自动化"
}
```

示例 07 — 设计师，素材库与标签体系（合作偏好 D）
```json
{
  "nickname": "七七",
  "role_tags": "设计师",
  "recent_annoyance": "素材管理零散，找图很费劲",
  "skills": "视觉风格系统化",
  "interest_score": 4,
  "interest_description": "偏好轻量工具，注重审美一致性",
  "learning_attitude_sc": 3,
  "people_around_challe": "团队对素材命名不统一",
  "community_voices": "缺少共享素材库",
  "collaboration_prefer": "D",
  "tool_idea": "灵感聚合白板与自动标签",
  "confidence_score": 2,
  "challenges": [
    {"description": "规范难以落地", "score": 4},
    {"description": "历史素材太多", "score": 3}
  ],
  "learning_goal": "学会建立共享标签体系"
}
```

示例 08 — 教师/研究者，挑战项较多（5项）
```json
{
  "nickname": "老张",
  "role_tags": "教师,研究者",
  "recent_annoyance": "备课资料分散，重复整理",
  "skills": "知识结构化与讲解",
  "interest_score": 1,
  "interest_description": "对新工具不排斥，但不想耗费时间",
  "learning_attitude_sc": 5,
  "people_around_challe": "同行缺少统一教材库",
  "community_voices": "期待共享与复用",
  "collaboration_prefer": "B",
  "tool_idea": "课程资料自动归档与更新",
  "confidence_score": 5,
  "challenges": [
    {"description": "重复劳动", "score": 5},
    {"description": "命名混乱", "score": 4},
    {"description": "迁移成本高", "score": 3},
    {"description": "团队共识不足", "score": 3},
    {"description": "版权顾虑", "score": 2}
  ],
  "learning_goal": "快速构建课程知识库"
}
```

示例 09 — 创业者，流程模板与追踪（合作偏好 C）
```json
{
  "nickname": "舟",
  "role_tags": "创业者",
  "recent_annoyance": "团队沟通不顺畅，决策滞后",
  "skills": "目标设定与里程碑管理",
  "interest_score": 5,
  "interest_description": "关注效率工具和透明协作",
  "learning_attitude_sc": 2,
  "people_around_challe": "伙伴难以统一流程",
  "community_voices": "流程不透明导致摩擦",
  "collaboration_prefer": "C",
  "tool_idea": "我出框架，他们执行落地",
  "confidence_score": 2,
  "challenges": [
    {"description": "流程设计复杂", "score": 4},
    {"description": "执行跟踪困难", "score": 3}
  ],
  "learning_goal": "掌握流程模板与追踪"
}
```

示例 10 — 学生，数组为空与部分空字段
```json
{
  "nickname": "无名",
  "role_tags": "学生",
  "recent_annoyance": "",
  "skills": "基础信息整理",
  "interest_score": 3,
  "interest_description": "",
  "learning_attitude_sc": 3,
  "people_around_challe": "",
  "community_voices": "",
  "collaboration_prefer": "B",
  "tool_idea": "",
  "confidence_score": 3,
  "challenges": [],
  "learning_goal": "尝试用自动化减少重复操作"
}
```

示例 11 — 数据分析师，数据质量与口径对齐
```json
{
  "nickname": "Mina",
  "role_tags": "数据分析师",
  "recent_annoyance": "拉取数据后清洗很耗时",
  "skills": "SQL与数据可视化",
  "interest_score": 4,
  "interest_description": "希望用自动化减少清洗工作量",
  "learning_attitude_sc": 4,
  "people_around_challe": "团队数据口径不一致",
  "community_voices": "报告重复修改，误差频出",
  "collaboration_prefer": "B",
  "tool_idea": "自动校验与口径对齐",
  "confidence_score": 3,
  "challenges": [
    {"description": "数据源多且不稳定", "score": 4},
    {"description": "口径定义不统一", "score": 5}
  ],
  "learning_goal": "搭建数据质量监控"
}
```

示例 12 — 文档管理员，版本规则与命名规范（合作偏好 A）
```json
{
  "nickname": "阿宁",
  "role_tags": "文档管理员",
  "recent_annoyance": "文件版本混乱，难以追溯",
  "skills": "规范制定与流程维护",
  "interest_score": 2,
  "interest_description": "愿意尝试轻量化规则引擎",
  "learning_attitude_sc": 5,
  "people_around_challe": "同事文件随意命名",
  "community_voices": "没有统一版本规则",
  "collaboration_prefer": "A",
  "tool_idea": "自动版本管理与命名规范助手",
  "confidence_score": 2,
  "challenges": [
    {"description": "历史包袱大", "score": 4},
    {"description": "推行成本高", "score": 3}
  ],
  "learning_goal": "形成渐进式命名与版本策略"
}
```

使用建议：将任一示例粘贴到工作流的启动输入（或后端触发请求体）进行运行；检查输出是否：
- 字数控制在 300–400（推荐≤380）。
- 四个小标题齐全，且不出现“# ”前缀。
- 至少点名两项 `challenges`（括号标注分数也可）。
- 语气中立，无行动建议或商业化引导。