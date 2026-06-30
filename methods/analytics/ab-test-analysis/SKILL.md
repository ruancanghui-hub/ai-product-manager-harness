---
name: ab-test-analysis
description: A/B测试分析——设计实验、分析结果、给出统计显著性结论和行动建议
source: 数据分析方法
category: analytics
---

# A/B 测试分析 (A/B Test Analysis)

## 目的

科学验证产品改动效果，用数据驱动决策而非直觉。

## 核心概念

**A/B测试**: 将用户随机分为实验组（A）和对照组（B），对比两组在关键指标上的差异

**统计显著性**: 结果差异是真实存在的，而非随机波动

**关键指标**:
- 转化率
- 留存率
- 人均消费
- 点击率

## 何时使用

- ✅ 验证功能改动效果
- ✅ 对比不同设计方案
- ✅ 优化转化漏斗
- ✅ 评估算法改进
- ❌ 样本量不足时
- ❌ 改动风险极高时

## 使用步骤

### Step 1: 定义假设

**问题**: 我们想验证什么？

**假设格式**:
```
原假设 (H0): 改动对指标无影响
备择假设 (H1): 改动能提升指标 X%

示例：
H0: 新按钮颜色对点击率无影响
H1: 新按钮颜色能提升点击率 10%
```

### Step 2: 确定指标

**问题**: 观察什么指标？

**指标类型**:
```
核心指标（必选）:
- 直接反映改动效果的指标
- 例如：按钮点击率、页面转化率

护栏指标（必选）:
- 确保改动无负面影响
- 例如：页面加载时间、崩溃率

辅助指标（可选）:
- 帮助理解用户行为
- 例如：页面停留时长、滚动深度
```

### Step 3: 计算样本量

**问题**: 需要多少用户？

**样本量计算公式**:
```
n = (Z_α/2 + Z_β)² × 2 × p × (1-p) / δ²

其中：
- Z_α/2 = 1.96 (95%置信度)
- Z_β = 0.84 (80%统计功效)
- p = 基准转化率
- δ = 期望提升幅度

示例：
基准转化率 = 5%
期望提升 = 10% (从5%提升到5.5%)
n = (1.96 + 0.84)² × 2 × 0.05 × 0.95 / (0.005)²
n ≈ 15,000 每组
```

**在线计算器**: https://www.evanmiller.org/ab-testing/sample-size.html

### Step 4: 设计实验

**实验配置**:
```json
{
  "experimentName": "new-button-color",
  "hypothesis": "新按钮颜色能提升点击率10%",
  "variants": {
    "control": {
      "name": "原按钮（蓝色）",
      "traffic": 0.5
    },
    "treatment": {
      "name": "新按钮（绿色）",
      "traffic": 0.5
    }
  },
  "metrics": {
    "primary": "click_rate",
    "guardrails": ["page_load_time", "crash_rate"],
    "secondary": ["time_on_page", "scroll_depth"]
  },
  "sampleSize": 30000,
  "duration": "14 days",
  "significanceLevel": 0.05,
  "statisticalPower": 0.8
}
```

### Step 5: 执行与监控

**监控要点**:
```
每日检查：
1. 样本累积进度
2. 指标表现（但不提前下结论）
3. 护栏指标是否异常
4. 实验组用户体验是否正常

提前终止条件：
- 护栏指标严重恶化
- 实验组出现严重bug
- 样本量达到预期，结果显著
```

### Step 6: 分析结果

**统计分析**:
```python
import scipy.stats as stats

# 实验数据
control_visitors = 15000
control_conversions = 750
treatment_visitors = 15000
treatment_conversions = 825

# 转化率
control_rate = control_conversions / control_visitors  # 5.0%
treatment_rate = treatment_conversions / treatment_visitors  # 5.5%

# 标准误差
se = sqrt(
    control_rate * (1 - control_rate) / control_visitors +
    treatment_rate * (1 - treatment_rate) / treatment_visitors
)

# Z检验
z_score = (treatment_rate - control_rate) / se
p_value = 1 - stats.norm.cdf(z_score)

# 结果
if p_value < 0.05:
    print(f"结果显著！p值 = {p_value:.4f}")
    print(f"提升幅度 = {(treatment_rate/control_rate - 1)*100:.1f}%")
else:
    print(f"结果不显著，p值 = {p_value:.4f}")
```

**置信区间**:
```
提升幅度的95%置信区间：
[3.2%, 16.8%]

解读：
- 我们有95%的把握，真实提升在3.2%到16.8%之间
- 区间不包含0，说明提升是真实的
```

## 输出模板

```markdown
# A/B测试分析报告 - [实验名称]

## 实验配置
- 实验名称: new-button-color
- 实验假设: 新按钮颜色能提升点击率10%
- 实验周期: 2026-06-01 至 2026-06-14 (14天)
- 样本量: 30,000 (对照组15,000 / 实验组15,000)
- 显著性水平: α = 0.05
- 统计功效: 1-β = 0.8

## 实验结果

### 核心指标
| 指标 | 对照组 | 实验组 | 提升 | p值 | 显著性 |
|------|--------|--------|------|-----|--------|
| 点击率 | 5.0% | 5.5% | +10.0% | 0.023 | ✅ 显著 |
| 转化率 | 2.1% | 2.3% | +9.5% | 0.081 | ❌ 不显著 |

### 护栏指标
| 指标 | 对照组 | 实验组 | 变化 | 状态 |
|------|--------|--------|------|------|
| 页面加载时间 | 1.2s | 1.3s | +8.3% | ⚠️ 需关注 |
| 崩溃率 | 0.1% | 0.1% | 0% | ✅ 正常 |

### 置信区间
点击率提升的95%置信区间: [3.2%, 16.8%]

## 结论与建议

### 结论
✅ **建议上线**
- 核心指标（点击率）提升显著
- 提升幅度10%，符合预期
- 护栏指标基本正常

### 建议
1. **立即执行**: 全量上线新按钮颜色
2. **持续监控**: 上线后继续观察转化率变化
3. **性能优化**: 调查页面加载时间上升原因

### 后续实验
- 测试其他按钮颜色变体
- 测试按钮文案优化
```

## 常见错误

- ❌ 样本量不足就下结论
- ❌ 提前查看结果并停止实验
- ❌ 多次比较未做校正（Bonferroni校正）
- ❌ 辛普森悖论（群组差异被整体掩盖）
- ❌ 选择性报告（只报告显著指标）

## 进化接口

```json
{
  "method": "ab-test-analysis",
  "timestamp": "2026-06-29T...",
  "context": {
    "productType": "web",
    "featureArea": "conversion-funnel"
  },
  "input": {
    "experimentName": "new-button-color",
    "hypothesis": "提升点击率10%",
    "sampleSize": 30000,
    "duration": "14 days"
  },
  "output": {
    "primaryMetricResult": "significant",
    "lift": 0.10,
    "pValue": 0.023,
    "confidenceInterval": [0.032, 0.168],
    "recommendation": "ship"
  },
  "metrics": {
    "statisticalPower": 0.82,
    "dataQualityScore": 0.95
  }
}
```

## 参考资料

- 《Trustworthy Online Controlled Experiments》- Ron Kohavi
- https://www.evanmiller.org/ab-testing/
