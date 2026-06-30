# AI PM 快速使用指南

> 5分钟上手自进化的AI产品管理脚手架

## 🚀 快速开始（3步）

### 1. 安装
```bash
npm install -g ai-pm
```

### 2. 创建项目
```bash
ai-pm create my-app --agents all
cd my-app
```

### 3. 开始使用
在 Claude Code 中：
```
"我想做一个XX产品"
```

系统会自动：
- 路由到正确的角色Skill
- 推荐最佳方法组合
- 执行完整方法论流程
- 记录使用数据供进化

---

## 💡 核心使用方式

### 方式1: 自然语言（推荐）

直接描述需求，系统自动识别：

| 你说什么 | 系统做什么 |
|---------|-----------|
| "帮我写个PRD" | → pm-center → opportunity-solution-tree + user-personas + write-prd |
| "设计这个页面" | → design-studio → design-review + design-consultation |
| "开始开发" | → dev-factory → architecture-review + security-audit |
| "测试一下" | → qa-gate → test-scenarios |
| "准备上线" | → chief-orchestrator → shipping-artifacts |

### 方式2: 链式命令（高级）

直接调用完整流程：

```
/strategize  # 战略规划（商业模式→SWOT→价值主张→产品战略）
/discover    # 产品发现（创意→假设→验证→访谈→实验）
/ship        # 交付发布（PRD→用户故事→测试→交付）
/audit       # 质量审计（安全→性能→对比）
```

---

## 🔧 CLI 常用命令

### 查看可用资源
```bash
ai-pm list methods     # 查看所有方法论
ai-pm list skills      # 查看所有角色
ai-pm list commands    # 查看所有链式命令
```

### 获取智能推荐
```bash
ai-pm recommend --context "新功能开发"
```

### 自进化分析
```bash
ai-pm learn            # 查看学习结果
ai-pm evolve           # 触发进化分析
```

---

## 📚 30个核心方法论速查

### 战略类（启动时用）
- **business-model-canvas** - 商业模式画布
- **swot-analysis** - SWOT分析
- **value-proposition** - 价值主张（JTBD）
- **product-strategy** - 产品战略（9段式）

### 发现类（验证需求时用）
- **opportunity-solution-tree** - 机会解决方案树 ⭐
- **user-personas** - 用户画像
- **interview-script** - 用户访谈脚本
- **identify-assumptions** - 假设识别
- **brainstorm-experiments** - 实验设计

### 执行类（落地时用）
- **write-prd** - 编写PRD ⭐
- **user-stories** - 用户故事
- **sprint-plan** - 迭代规划
- **test-scenarios** - 测试场景

### 分析类（数据驱动时用）
- **cohort-analysis** - 群组分析
- **ab-test-analysis** - A/B测试分析
- **sentiment-analysis** - 用户反馈分析

### 交付类（上线时用）
- **security-audit-static** - 安全审计
- **performance-audit-static** - 性能审计
- **shipping-artifacts** - 交付物料生成

---

## 🎯 最佳实践场景

### 场景1: 新产品启动
```
步骤：
1. /strategize → 确定战略
2. /discover → 验证假设
3. /ship → 交付开发

关键方法论：
- business-model-canvas（商业模式）
- opportunity-solution-tree（需求澄清）
- write-prd（输出文档）
```

### 场景2: 功能迭代
```
步骤：
1. identify-assumptions → 识别风险
2. interview-script → 用户验证
3. write-prd → 更新需求

关键方法论：
- user-personas（明确用户）
- test-scenarios（验收标准）
```

### 场景3: 质量改进
```
步骤：
1. sentiment-analysis → 分析反馈
2. security-audit → 安全检查
3. performance-audit → 性能优化

关键方法论：
- cohort-analysis（留存分析）
- ab-test-analysis（效果验证）
```

---

## ⚡ 进阶技巧

### 1. 智能推荐
系统会根据你的使用历史推荐最佳方法：
- 使用前：推荐行业最佳实践
- 使用后：推荐本项目高效方法

查看推荐：
```bash
ai-pm recommend
```

### 2. 自进化追踪
每月查看学习结果：
```bash
ai-pm learn --trend
```

了解：
- 哪些方法效果最好
- 哪些方法组合最优
- 哪些方面需要改进

### 3. 自定义流程
根据推荐创建自己的流程：
```
我的标准流程：
user-personas → opportunity-solution-tree → write-prd

（基于数据分析，这个组合在我项目中效果最佳）
```

---

## 🆘 常见问题

### Q: 如何知道用哪个方法？
**A**: 不需要知道！直接描述需求，系统会自动推荐。

### Q: 方法太多记不住？
**A**: 记住3个核心方法：
- opportunity-solution-tree（需求澄清）
- write-prd（输出文档）
- user-personas（定义用户）

其他按需调用。

### Q: 如何让系统进化？
**A**: 正常使用即可！每次使用系统都会记录数据，自动分析优化。

### Q: 进化效果如何验证？
**A**: 定期查看：
```bash
ai-pm learn --trend
```
看到质量得分上升就是进化成功。

---

## 🎊 开始你的第一次

### 建议的第一个项目

```bash
# 1. 创建项目
ai-pm create my-first-app --agents all
cd my-first-app

# 2. 在Claude Code中说：
"我想做一个待办事项APP"

# 3. 系统会自动：
- 路由到 pm-center
- 执行 business-model-canvas → user-personas → write-prd
- 输出完整PRD

# 4. 查看学习结果：
ai-pm learn

# 5. 下次使用更智能！
```

---

**记住：AI PM 会越用越聪明，让它成为你的产品管理助手！**