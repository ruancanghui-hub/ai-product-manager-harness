# AI PM - 自进化的 AI 产品管理脚手架

> 让你的产品管理系统越用越聪明

## 简介

AI PM 是一套融合了**角色流水线系统**与**PM 方法论技能库**的自进化脚手架。它将大厂 APP 开发的 35+ 专业角色与经过验证的产品方法论（Teresa Torres、Marty Cagan 等）结合，通过下游打分、使用数据分析、知识沉淀三维进化机制，让整个系统随着使用不断优化。

### 核心特性

- **9 个角色 Skill**: 产品中心、设计团队、研发团队、测试团队、运营增长、管理中枢、总调度、全链路流水线、自进化引擎
- **68 个方法论技能**: 机会解决方案树、用户画像、商业模式画布、SWOT 分析等
- **42 个链式命令**: /discover、/strategize、/ship、/audit 等
- **三维进化机制**: 下游打分 + 使用数据 + 知识沉淀
- **跨平台支持**: Claude Code、Codex、Cursor、Gemini CLI

## 快速开始

### 安装

```bash
npm install -g ai-pm
```

### 创建项目

```bash
# 创建新项目
ai-pm create my-app --agents all

# 或在现有项目中初始化
cd my-existing-project
ai-pm create . --agents claude,codex,cursor
```

### 使用方式

#### 方式 1: 隐式路由（关键词触发）

在 Claude Code、Codex 或 Cursor 中，直接描述你的需求：

```
用户: "帮我写个 PRD"
系统: 自动路由到 pm-center Skill，推荐方法组合：
      1. opportunity-solution-tree（澄清需求）
      2. user-personas（定义用户）
      3. write-prd（输出文档）
```

#### 方式 2: 显式命令（斜杠触发）

直接调用链式命令，执行完整的方法论流程：

```
/discover    # 产品发现全流程（5 个方法链）
/strategize  # 战略规划全流程（4 个方法链）
/ship        # 交付发布全流程（4 个方法链）
/audit       # 质量审计全流程（3 个方法链）
/plan        # 迭代规划全流程（3 个方法链）
/grow        # 增长规划全流程（3 个方法链）
```

### 示例：启动新产品

```
用户: "我想做一个社交 APP"

系统调用链:
1. /strategize
   → business-model-canvas（商业模式）
   → swot-analysis（SWOT 分析）
   → value-proposition（价值主张）
   → product-strategy（产品战略）

2. /discover
   → brainstorm-ideas（创意发散）
   → identify-assumptions（假设识别）
   → prioritize-assumptions（假设排序）
   → interview-script（访谈脚本）
   → brainstorm-experiments（实验设计）

3. /ship
   → write-prd（编写 PRD）
   → user-stories（用户故事）
   → test-scenarios（测试场景）
   → shipping-artifacts（交付物料）
```

## 核心概念

### 双层架构

```
角色 Skill (骨架)
  ├─ pm-center (产品中心)
  ├─ design-studio (设计团队)
  ├─ dev-factory (研发团队)
  ├─ qa-gate (测试团队)
  ├─ ops-growth (运营增长)
  ├─ mgmt-office (管理中枢)
  ├─ chief-orchestrator (总调度)
  ├─ app-workflow (全链路流水线)
  └─ evolution-engine (自进化引擎)

方法论技能 (肌肉)
  ├─ strategy/ (战略类 12 个)
  ├─ discovery/ (发现类 13 个)
  ├─ execution/ (执行类 16 个)
  ├─ analytics/ (分析类 3 个)
  └─ shipping/ (交付类 5 个)
```

### 三维进化

1. **下游打分驱动**: 下游验收上游时打分，不及格自动诊断改进
2. **使用数据驱动**: 记录每次技能调用，提炼成功模式
3. **知识沉淀驱动**: 自动生成项目专属最佳实践

### 智能推荐

系统会根据本项目的使用历史，推荐最佳方法组合：

```
基于过去 12 个版本的打分数据:
- 省略 opportunity-solution-tree → PRD 被退回率 63%
- 先做 user-personas → 设计满意度提升 41%
- value-proposition + north-star-metric 组合 → 商业化通过率 89%

建议: 先执行 user-personas，再 value-proposition，最后 write-prd
```

## 项目结构

```
my-app/
├── .ai-pm/                 # 自进化引擎核心
│   ├── ENGINE.md           # 进化算法文档
│   ├── SCORING-RUBRIC.md   # 打分标准
│   ├── knowledge/          # 项目知识库
│   │   ├── observations/   # 使用记录
│   │   ├── learnings/      # 成功模式提炼
│   │   └── recommendations/ # 智能推荐缓存
│   └── feedback/           # 反馈记录
│       ├── SCORE-LOG.md    # 打分日志
│       └── EVOLUTION-LOG.md # 进化历史
│
├── .claude/skills/         # Claude Code 技能
├── .agents/skills/         # Codex/Cursor 技能
│
├── AGENTS.md               # Codex/Cursor 项目指令
├── CLAUDE.md               # Claude Code 项目指令
└── PROJECT-PHASE.md        # 项目阶段状态
```

## CLI 命令

```bash
# 创建项目
ai-pm create my-app --agents all

# 健康检查
ai-pm doctor

# 触发进化
ai-pm evolve pm-center --diagnose "PRD质量不稳定"

# 查看学习曲线
ai-pm learn --trend

# 生成推荐
ai-pm recommend --for-context "新功能启动"

# 导出知识库
ai-pm export knowledge --format markdown
```

## 方法论来源

本系统集成了以下经过验证的产品方法论：

- **Teresa Torres** - Continuous Discovery Habits (机会解决方案树)
- **Marty Cagan** - Inspired / Empowered (产品战略、PRD)
- **Indi Young** - Mental Models (用户画像)
- **Amplitude** - North Star Metric (北极星指标)
- **Ash Maurya** - Running Lean (商业模式验证)
- **Steve Blank** - Customer Development (客户开发)
- **Eric Ries** - The Lean Startup (精益创业)

## 与 pm-skills 的关系

AI PM 融合了 [pm-skills](https://github.com/phuryn/pm-skills) 项目的 68 个方法论技能，并在此基础上：

1. **增加了角色流水线**: 将方法论按 APP 开发阶段组织成 9 个角色 Skill
2. **增加了自进化机制**: 通过三维进化让系统越用越聪明
3. **增加了智能推荐**: 基于项目历史数据推荐最佳方法组合
4. **增加了知识沉淀**: 自动生成项目专属最佳实践

## 最佳实践

### 1. 让系统自然进化

不要为了进化而进化。真实使用，让下游打分，让问题自然暴露，系统会自动改进。

### 2. 信任但要验证

进化后的 Skill 需要重新打分验证。如果改进无效，系统会回滚。

### 3. 定期查看学习结果

每月查看 `knowledge/learnings/` 目录，了解哪些方法在本项目中效果最好。

### 4. 分享优秀实践

如果某个方法组合效果显著，可以通过 PR 贡献回社区。

## 许可证

MIT

## 贡献

欢迎贡献方法论技能、角色定义、进化算法改进等。请先阅读 CONTRIBUTING.md。

## 致谢

- [pm-skills](https://github.com/phuryn/pm-skills) - PM 方法论技能库
- Teresa Torres, Marty Cagan, Indi Young 等产品思想领袖
- Anthropic Claude - 强大的 AI 助手
