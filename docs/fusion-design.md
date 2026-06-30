# AI PM 融合设计蓝图

> 将 ai-pm2 的角色流水线系统与 pm-skills 的 PM 方法论技能库融合，创建一个**自进化的 AI 产品管理脚手架**。

## 一、核心设计理念

### 1.1 双系统优势对比

| 特性 | ai-pm2 (角色系统) | pm-skills (方法论库) | 融合后价值 |
|------|------------------|---------------------|-----------|
| **定位** | APP 全链路角色协作 | PM 专业方法论工具集 | 既懂流程又懂方法 |
| **架构** | 9个角色 Skill + 自进化引擎 | 68个技能 + 42个链式命令 | 角色为骨架，方法为肌肉 |
| **触发** | 关键词自动路由 | 斜杠命令显式调用 | 两者兼有：隐式路由 + 显式命令 |
| **进化** | 下游打分 → 自动修改 SKILL | 静态技能库，PR 改进 | 自进化 + 社区贡献双轮驱动 |
| **知识** | 角色工作方法 | Teresa Torres/Marty Cagan 方法论 | 角色承载方法论，越用越专业 |
| **粒度** | 团队级 Skill (6-15角色) | 单点技能 (OST/JTBD/SWOT) | 团队 + 单点两层架构 |

### 1.2 融合原则

1. **角色为骨架，方法为肌肉**: 保留角色 Skill 作为阶段入口，内部集成 pm-skills 的具体方法论
2. **两层触发机制**: 隐式路由（关键词） + 显式命令（/斜杠命令）
3. **自进化为核心**: 下游打分 + 使用数据 → 自动优化技能 + 推荐最佳实践
4. **知识沉淀机制**: 每次使用自动生成 observations，构建项目专属知识库
5. **插件化架构**: 支持第三方技能包、自定义角色、行业模板

## 二、新架构设计

### 2.1 目录结构

```
ai-pm-fusion/
├── .ai-pm/                     # 自进化引擎核心
│   ├── ENGINE.md               # 进化算法文档
│   ├── SCORING-RUBRIC.md       # 打分标准
│   ├── knowledge/              # 项目知识库
│   │   ├── observations/       # 使用记录 (JSONL)
│   │   ├── learnings/          # 成功模式提炼
│   │   └── recommendations/    # 智能推荐缓存
│   └── feedback/               # 反馈记录
│       ├── SCORE-LOG.md        # 打分日志
│       └── EVOLUTION-LOG.md    # 进化历史
│
├── .claude-plugin/             # Claude 插件市场配置
│   ├── marketplace.json
│   └── commands/               # 链式命令定义
│       ├── discover.json       # 产品发现全流程
│       ├── strategize.json     # 战略规划全流程
│       ├── ship.json           # 交付发布全流程
│       └── audit.json          # 质量审计全流程
│
├── core/                       # 核心角色 Skills
│   ├── pm-center/              # 产品中心
│   │   ├── SKILL.md            # 角色定义 + 流程
│   │   ├── methods/            # 集成 pm-skills 方法
│   │   │   ├── opportunity-solution-tree.md
│   │   │   ├── user-personas.md
│   │   │   ├── value-proposition.md
│   │   │   ├── write-prd.md
│   │   │   └── interview-script.md
│   │   └── tools/              # 角色专属工具
│   │       ├── prd-template.md
│   │       ├── metrics-dashboard.md
│   │       └──埋点-checklist.md
│   ├── design-studio/          # 设计中心
│   │   ├── SKILL.md
│   │   ├── methods/
│   │   │   ├── design-review.md
│   │   │   ├── design-shotgun.md
│   │   │   └── design-consultation.md
│   │   └── tools/
│   ├── dev-factory/            # 研发中心
│   │   ├── SKILL.md
│   │   ├── methods/
│   │   │   ├── architecture-review.md
│   │   │   ├── security-audit.md
│   │   │   └── performance-audit.md
│   │   └── tools/
│   ├── qa-gate/                # 测试中心
│   ├── ops-growth/             # 运营增长
│   │   ├── SKILL.md
│   │   ├── methods/
│   │   │   ├── north-star-metric.md
│   │   │   ├── growth-loops.md
│   │   │   ├── competitive-battlecard.md
│   │   │   └── marketing-ideas.md
│   ├── mgmt-office/            # 管理中枢
│   │   ├── SKILL.md
│   │   ├── methods/
│   │   │   ├── brainstorm-okrs.md
│   │   │   ├── stakeholder-map.md
│   │   │   ├── pre-mortem.md
│   │   │   └── sprint-plan.md
│   ├── chief-orchestrator/     # 总调度
│   ├── app-workflow/           # 全链路流水线
│   └── evolution-engine/       # 自进化引擎
│
├── methods/                    # 独立方法论技能库 (pm-skills 风格)
│   ├── strategy/               # 战略类
│   │   ├── opportunity-solution-tree/
│   │   ├── business-model-canvas/
│   │   ├── swot-analysis/
│   │   └── ansoff-matrix/
│   ├── discovery/              # 发现类
│   │   ├── user-interview/
│   │   ├── brainstorm-ideas/
│   │   ├── identify-assumptions/
│   │   └── prioritize-assumptions/
│   ├── execution/              # 执行类
│   │   ├── write-prd/
│   │   ├── user-stories/
│   │   ├── test-scenarios/
│   │   └── release-notes/
│   ├── analytics/              # 分析类
│   │   ├── cohort-analysis/
│   │   ├── ab-test-analysis/
│   │   └── sentiment-analysis/
│   └── shipping/               # 交付类
│       ├── security-audit/
│       ├── performance-audit/
│       └── shipping-artifacts/
│
├── templates/                  # 项目模板
│   ├── app-mobile/             # 移动 APP 模板
│   ├── app-web/                # Web APP 模板
│   ├── startup/                # 创业项目模板
│   └── enterprise/             # 企业内部工具模板
│
├── cli/                        # CLI 工具
│   ├── ai-pm.js                # 主入口
│   ├── commands/
│   │   ├── create.js           # 创建项目
│   │   ├── doctor.js           # 健康检查
│   │   ├── evolve.js           # 手动触发进化
│   │   ├── learn.js            # 查看学习曲线
│   │   ├── recommend.js        # 查看推荐
│   │   └── export.js           # 导出知识库
│   └── lib/
│       ├── router.js           # 智能路由引擎
│       ├── scorer.js           # 自动打分
│       ├── learner.js          # 知识沉淀
│       └── recommender.js      # 智能推荐
│
├── docs/
│   ├── getting-started.md
│   ├── architecture.md
│   ├── evolution-how-it-works.md
│   ├── methods-guide.md        # 方法论使用指南
│   └── best-practices.md
│
└── package.json
```

### 2.2 双层触发机制

#### 层级 1: 角色 Skill（隐式路由）

保留原有的关键词路由逻辑，但内部增强：

```
用户说：「帮我写个 PRD」
  → 路由到 pm-center SKILL
  → pm-center 检测上下文，决定调用哪个方法：
      - 需求明确 → 直接调用 write-prd 方法
      - 需求模糊 → 先调用 opportunity-solution-tree 澄清
      - 缺少用户洞察 → 先调用 user-interview 方法
```

#### 层级 2: 方法论技能（显式命令）

新增斜杠命令，直接调用具体方法论：

```bash
# 战略规划命令
/strategize → 调用 4 个技能链：
  business-model-canvas → swot-analysis → value-proposition → product-strategy

# 产品发现命令
/discover → 调用 5 个技能链：
  brainstorm-ideas → identify-assumptions → prioritize-assumptions → interview-script → brainstorm-experiments

# 交付发布命令
/ship → 调用 4 个技能链：
  write-prd → user-stories → test-scenarios → shipping-artifacts

# 质量审计命令
/audit → 调用 3 个技能链：
  security-audit → performance-audit → intended-vs-implemented
```

### 2.3 自进化引擎增强

#### 原有机制：下游打分

```
下游 Skill 接收上游交付物
  → 按 4 维度打分（完整性/清晰度/及时性/可用性）
  → 总分 < 7 → 调用 evolution-engine
  → evolution-engine 诊断问题 → 修改 SKILL.md → 记录进化日志
```

#### 新增机制：使用数据驱动

```
每次技能调用
  → 记录 observation (场景/输入/输出/耗时/效果)
  → learner 分析模式：
      - 哪些方法在什么场景下效果最好？
      - 哪些方法经常被组合使用？
      - 哪些方法的输出质量得分最高？
  → 生成 learnings (成功模式)
  → recommender 基于上下文推荐最佳方法

# 示例：智能推荐
PM 在写 PRD 时，系统提示：
  「根据本项目历史数据，以下方法组合效果最佳：
   1. opportunity-solution-tree (澄清需求) → 质量得分 9.2
   2. user-personas (定义用户) → 后续设计好评率 87%
   3. value-proposition (明确价值) → 商业化方案通过率提升 40%
   建议本次按此顺序执行。」
```

#### 新增机制：知识沉淀

```
项目运行一段时间后，自动生成：

knowledge/learnings/
  ├── prd-quality-patterns.md      # PRD 质量最佳实践
  ├── design-review-lessons.md     # 设计审核常见问题
  ├── sprint-velocity-trends.md    # 迭代速度趋势
  └── user-feedback-insights.md    # 用户反馈洞察

knowledge/recommendations/
  ├── next-sprint-methods.json     # 下迭代推荐方法
  ├── team-training-plan.md        # 团队能力提升建议
  └── tool-stack-upgrade.md        # 工具栈升级建议
```

### 2.4 角色与方法集成示例

以 pm-center 为例，展示角色 SKILL 如何集成方法论：

```markdown
---
name: pm-center
description: 产品中心——6个产品角色的集体工作输出
methods: [opportunity-solution-tree, user-personas, value-proposition, write-prd, interview-script, north-star-metric]
---

# 产品中心（PM Center）

## 目的
定方向——决定做什么、解决什么问题、为什么用户买单。

## 集成方法论

本 Skill 内部集成以下经过验证的 PM 方法论：

| 方法 | 来源 | 何时调用 | 效果 |
|------|------|---------|------|
| **Opportunity Solution Tree** | Teresa Torres | 需求模糊时 | 澄清机会空间，避免过早收敛 |
| **User Personas** | Indi Young | 缺少用户洞察时 | 建立可行动的用户画像 |
| **Value Proposition** | JTBD框架 | 价值不清晰时 | 明确「谁为什么在什么场景用什么解决什么」 |
| **Write PRD** | Marty Cagan | 需求明确后 | 输出结构化 PRD |
| **Interview Script** | The Mom Test | 需要用户验证时 | 避免误导性访谈 |
| **North Star Metric** | Amplitude | 指标不清晰时 | 定义北极星指标体系 |

## 智能推荐

根据本项目历史数据，系统会推荐最佳方法组合：

**新项目启动**（无历史数据）→ 默认流程：
1. opportunity-solution-tree（探索机会）
2. user-personas（定义用户）
3. value-proposition（明确价值）
4. write-prd（输出文档）

**有历史数据** → 系统推荐：
```
基于过去 12 个版本的打分数据：
- 省略 opportunity-solution-tree → PRD 被退回率 63%
- 先做 user-personas → 设计满意度提升 41%
- value-proposition + north-star-metric 组合 → 商业化通过率 89%

建议：先执行 user-personas，再 value-proposition，最后 write-prd。
```

## 进化接口

每次执行后自动：
1. 记录 observation（调用哪个方法、输入输出、耗时）
2. 等待下游打分
3. 如果打分 < 7 → 触发 evolution-engine 分析：
   - 是方法选错了？（该用 OST 却直接写 PRD）
   - 是方法执行质量差？（OST 只做了 2 层就停了）
   - 是角色协作不畅？（没等用户研究完成就写 PRD）
4. 修改 SKILL.md 或方法定义
```

## 三、实施路线图

### Phase 1: 核心架构升级（Week 1-2）

1. 重构目录结构，创建 methods/ 和 knowledge/ 目录
2. 实现双层路由引擎（router.js）
3. 集成 claude-mem 作为 observation 存储后端

### Phase 2: 方法论迁移（Week 3-4）

1. 从 pm-skills 迁移 68 个技能到 methods/
2. 为每个角色 Skill 配置 methods 集成
3. 创建 42 个链式命令定义

### Phase 3: 自进化增强（Week 5-6）

1. 实现 learner.js（模式分析）
2. 实现 recommender.js（智能推荐）
3. 创建 evolution-dashboard（进化可视化）

### Phase 4: 知识沉淀（Week 7-8）

1. 实现 knowledge 自动生成
2. 创建 learnings 提取算法
3. 支持 knowledge export/import

### Phase 5: 文档与生态（Week 9-10）

1. 编写完整文档
2. 创建示例项目
3. 发布到 Claude marketplace

## 四、成功指标

| 指标 | 当前 ai-pm2 | 融合后目标 |
|------|------------|-----------|
| 技能数量 | 9 个角色 Skill | 9 角色 + 68 方法 + 42 命令 |
| 自进化维度 | 4 维度打分 | 打分 + 使用数据 + 模式分析 |
| 知识沉淀 | 无 | 自动生成 learnings |
| 智能推荐 | 无 | 基于上下文推荐最佳方法 |
| 跨平台 | Claude/Codex/Cursor | + Gemini CLI + OpenCode |
| 社区贡献 | PR 改进 | PR + 自动进化双轮驱动 |