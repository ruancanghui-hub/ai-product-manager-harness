---
name: evolution-engine-v2
description: 增强版自进化引擎——结合下游打分、使用数据分析、知识沉淀三维度进化
version: 2.0.0
---

# 自进化引擎 V2

> 让整个角色系统越用越聪明

## 核心理念

传统的静态技能库需要人工维护和更新。本引擎通过三个维度实现自动进化：

1. **下游打分**：下游验收上游时按 4 维度打分，不及格自动诊断改进
2. **使用数据**：记录每次技能调用的上下文、输入输出、效果，提炼成功模式
3. **知识沉淀**：自动生成项目专属的最佳实践、推荐、警示

## 三维进化机制

### 维度 1: 下游打分驱动

**触发条件**: 下游 Skill 接收上游交付物时

**打分标准** (详见 `.ai-pm/SCORING-RUBRIC.md`):
- 完整性 (1-10): 该有的都有了吗？
- 清晰度 (1-10): 没有歧义吗？
- 及时性 (1-10): 按时交付了吗？
- 可用性 (1-10): 拿来就能用吗？

**进化流程**:
```
总分 < 7
  → 调用 evolution-engine
  → 诊断问题：
      - 是方法选错了？（该用 OST 却直接写 PRD）
      - 是方法执行质量差？（OST 只做了 2 层就停了）
      - 是角色协作不畅？（没等用户研究完成就写 PRD）
      - 是输入不完整？（上游没有提供足够信息）
  → 修改 SKILL.md 或方法定义：
      - 补充流程步骤
      - 添加检查项
      - 硬化停止条件
      - 添加推荐方法组合
  → 记录进化日志
  → 下次该上游交付时重新打分验证
```

**示例**:
```
dev-factory 接收 pm-center 的 PRD
  → 打分：完整性 6/10（缺少异常状态描述）
  → 总分 6.5 < 7
  → evolution-engine 诊断：
      问题：PRD 模板中「异常和边界条件」章节非必填
      改进：将「异常和边界条件」设为 P0 必填项，添加检查清单
  → 修改 pm-center/SKILL.md
  → 下次 pm-center 输出 PRD 时，dev-factory 重新打分验证
```

### 维度 2: 使用数据驱动

**触发条件**: 每次技能调用

**记录信息** (存储到 `knowledge/observations/`):
```json
{
  "id": "obs-2026-06-29-001",
  "timestamp": "2026-06-29T15:30:00Z",
  "sessionId": "session-abc123",
  "skill": "pm-center",
  "method": "opportunity-solution-tree",
  "context": {
    "productType": "mobile-app",
    "teamSize": 5,
    "phase": "discovery",
    "userInput": "我想做一个社交APP"
  },
  "input": {
    "outcome": "3个月内获得10万用户",
    "teamMembers": 5,
    "timeSpent": "2 hours"
  },
  "output": {
    "opportunitiesCount": 12,
    "solutionsCount": 35,
    "topOpportunities": 3,
    "topSolutions": 5,
    "artifacts": ["OST-2026-06-29.md"]
  },
  "metrics": {
    "breadthScore": 0.8,
    "depthScore": 0.6,
    "alignmentScore": 0.9
  },
  "score": null,  // 等待下游打分
  "feedback": null
}
```

**学习流程**:
```
learner.js 分析 observations
  → 提取模式：
      - 哪些方法在什么场景下效果最好？
      - 哪些方法经常被组合使用？
      - 哪些方法的输出质量得分最高？
      - 哪些方法经常导致低分？
  → 生成 learnings:
      - prd-quality-patterns.md
      - design-review-lessons.md
      - sprint-velocity-trends.md
  → 生成 recommendations:
      - next-sprint-methods.json
      - team-training-plan.md
```

**示例**:
```
分析过去 30 天的 observations：
  - opportunity-solution-tree 使用 15 次，平均得分 9.2
  - write-prd 使用 12 次，平均得分 7.8
  - 组合 "OST → user-personas → write-prd" 使用 5 次，平均得分 9.0
  - 组合 "直接 write-prd（跳过 OST）" 使用 4 次，平均得分 6.5

生成 learning:
  「在需求模糊场景下，先执行 OST 再写 PRD，质量得分提升 38%」

生成 recommendation:
  「下次启动新功能时，建议先执行 opportunity-solution-tree」
```

### 维度 3: 知识沉淀驱动

**触发条件**: 定期（每周/每月）或手动触发

**生成内容**:

1. **项目专属最佳实践** (`knowledge/learnings/`)
   - PRD 质量最佳实践
   - 设计审核常见问题
   - 迭代速度趋势分析
   - 用户反馈洞察

2. **智能推荐** (`knowledge/recommendations/`)
   - 下迭代推荐方法
   - 团队能力提升建议
   - 工具栈升级建议
   - 风险预警

3. **进化可视化** (`.ai-pm/evolution-dashboard/`)
   - 各 Skill 质量趋势图
   - 方法使用热力图
   - 进化历史时间线
   - 推荐准确率追踪

## 进化接口规范

每个 Skill 和方法都必须包含以下接口：

### Skill 级别接口

```markdown
## 进化接口

### 上游交付物评分
本 Skill 接收上游交付物时执行打分...

### 使用记录
本 Skill 执行后自动记录 observation...

### 学习与推荐
本 Skill 的推荐方法基于历史数据...
```

### 方法级别接口

```markdown
## 进化接口

本方法执行后，记录以下信息供进化引擎使用：

```json
{
  "method": "opportunity-solution-tree",
  "timestamp": "...",
  "context": {...},
  "input": {...},
  "output": {...},
  "metrics": {...}
}
```
```

## 进化效果追踪

### 追踪指标

| 指标 | 定义 | 目标 |
|------|------|------|
| **进化频率** | 每月修改 SKILL.md 的次数 | 2-5 次/月 |
| **改进验证率** | 进化后重新打分，分数提升的比例 | ≥ 80% |
| **推荐采纳率** | 系统推荐的方法被用户采纳的比例 | ≥ 60% |
| **质量得分趋势** | 所有交付物的平均得分趋势 | 逐月上升 |
| **返工率** | 下游退回上游要求返工的比例 | 逐月下降 |

### 追踪方式

```bash
# 查看进化历史
ai-pm evolve --history

# 查看学习曲线
ai-pm learn --trend

# 查看推荐准确率
ai-pm recommend --accuracy
```

## 手动触发进化

除了自动进化，还支持手动触发：

```bash
# 触发特定 Skill 进化
ai-pm evolve pm-center --diagnose "PRD质量不稳定"

# 触发全局学习
ai-pm learn --analyze

# 生成推荐报告
ai-pm recommend --for-context "新功能启动"

# 导出知识库
ai-pm export knowledge --format markdown

# 导入外部知识
ai-pm import knowledge --from best-practices.md
```

## 进化算法

### 诊断算法

```python
def diagnose(low_score_delivery):
    issues = []

    # 检查方法选择
    if wrong_method_used(context):
        issues.append({
            "type": "method-selection",
            "problem": f"使用了 {method}，但更适合 {better_method}",
            "solution": f"在 {context} 场景下优先使用 {better_method}"
        })

    # 检查执行质量
    if poor_execution_quality(output):
        issues.append({
            "type": "execution-quality",
            "problem": f"{method} 执行不完整，只完成了 {completion_rate}%",
            "solution": f"添加检查项：{missing_steps}"
        })

    # 检查协作流程
    if collaboration_issue(upstream, downstream):
        issues.append({
            "type": "collaboration",
            "problem": f"{upstream} 和 {downstream} 协作不畅",
            "solution": f"添加依赖检查：{dependency}"
        })

    return issues
```

### 改进算法

```python
def improve(skill, issues):
    modifications = []

    for issue in issues:
        if issue.type == "method-selection":
            modifications.append({
                "file": f"{skill}/SKILL.md",
                "action": "add_recommendation",
                "content": f"在 {issue.context} 场景下优先使用 {issue.better_method}"
            })

        elif issue.type == "execution-quality":
            modifications.append({
                "file": f"methods/{issue.method}/SKILL.md",
                "action": "add_checklist",
                "content": issue.missing_steps
            })

        elif issue.type == "collaboration":
            modifications.append({
                "file": f"{skill}/SKILL.md",
                "action": "add_dependency_check",
                "content": issue.dependency
            })

    return modifications
```

## 进化日志格式

存储在 `.ai-pm/feedback/EVOLUTION-LOG.md`:

```markdown
# 进化日志

## 2026-06-29: pm-center 进化

**触发原因**: dev-factory 给 PRD 打分 6.5（不及格）

**诊断结果**:
- 问题类型: 执行质量
- 具体问题: PRD 缺少「异常和边界条件」章节
- 影响范围: 导致开发团队需要多次追问

**改进措施**:
- 修改文件: pm-center/SKILL.md
- 改进内容: 将「异常和边界条件」设为 P0 必填项
- 添加检查清单: 空态、加载中、错误、无网络、权限不足

**验证结果**:
- 验证日期: 2026-07-02
- 新分数: 8.5 ✅
- 改进效果: PRD 完整性从 6 分提升到 9 分
```

## 与 claude-mem 集成

本系统可与 claude-mem 插件集成，实现跨会话记忆：

```javascript
// 记录 observation 到 claude-mem
await mcp__plugin_claude_mem_observation_add({
  content: JSON.stringify(observation),
  projectId: 'my-app',
  kind: 'skill-execution',
  metadata: {
    skill: 'pm-center',
    method: 'opportunity-solution-tree',
    score: 9.2
  }
});

// 从 claude-mem 查询历史模式
const patterns = await mcp__plugin_claude_mem_search({
  query: 'opportunity-solution-tree best practices',
  projectId: 'my-app'
});
```

## 最佳实践

### 1. 让进化自然发生

不要为了进化而进化。让下游真实打分，让问题自然暴露，系统会自动改进。

### 2. 信任但要验证

进化后的 Skill 需要重新打分验证。如果改进无效，系统会回滚并尝试其他方案。

### 3. 定期回顾进化历史

每月查看进化日志，了解系统在哪些方面改进了，哪些方面还需要优化。

### 4. 分享优秀实践

如果某个方法组合在本项目中效果显著，可以通过 PR 贡献回社区。

## 禁止行为

- ❌ 人情分（「给个面子打高分」）—— 下游放水 = 系统退化
- ❌ 打完分不记录 —— 同样的问题下次还会出现
- ❌ 不及格但不开 evolution —— 问题被掩盖
- ❌ 无证据打分 —— 必须指明具体哪里不好
- ❌ 频繁手动触发进化 —— 让数据自然积累
