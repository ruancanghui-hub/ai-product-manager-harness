---
name: cohort-analysis
description: 群组分析——追踪不同用户群随时间变化的行为模式，分析留存、转化、活跃度趋势
source: 数据分析方法
category: analytics
---

# 群组分析 (Cohort Analysis)

## 目的

追踪不同用户群（群组）随时间变化的行为模式，回答「用户在注册后第 N 天/周/月还在活跃吗？」这类问题。

## 核心概念

**群组 (Cohort)**: 在同一时间段内完成某个动作的用户集合

- 注册群组：2026年1月注册的用户
- 行为群组：首次购买发生在2026年1月的用户
- 属性群组：来自同一渠道的用户

**群组分析表**:
```
        Day 0  Day 1  Day 3  Day 7  Day 14  Day 30
Jan    100%    45%    32%    25%     18%      12%
Feb    100%    48%    35%    28%     20%      15%
Mar    100%    52%    38%    31%     23%      18%  ← 改善趋势
```

## 何时使用

- ✅ 分析用户留存趋势
- ✅ 对比不同版本/功能的效果
- ✅ 评估运营活动长期影响
- ✅ 识别用户流失时间点
- ✅ 预测用户生命周期价值

## 使用步骤

### Step 1: 定义群组

**问题**: 如何划分用户群？

**常见群组定义**:
```
时间群组：
- 按注册月份：2026-01、2026-02、2026-03...
- 按首次购买月份
- 按首次使用某功能的月份

行为群组：
- 完成核心动作的用户
- 使用某功能的用户
- 付费用户

属性群组：
- 来源渠道（自然流量、广告、推荐）
- 设备类型（iOS、Android）
- 地区
```

**选择原则**:
- 群组内用户应有相似起点
- 群组间应有可比性
- 群组大小足够（建议 ≥ 100）

### Step 2: 确定观察指标

**问题**: 观察什么行为？

**常见指标**:
```
留存指标：
- 次日留存、7日留存、30日留存
- 自定义周期：周留存、月留存

活跃指标：
- 登录次数
- 使用时长
- 核心功能使用次数

业务指标：
- 消费金额
- 订单数
- 分享次数
```

### Step 3: 确定时间窗口

**问题**: 观察多久？

**时间窗口选择**:
```
产品类型 → 推荐窗口

高频产品（社交、资讯）→ 30天
中频产品（电商、工具）→ 90天
低频产品（旅游、房产）→ 365天
```

### Step 4: 执行分析

**SQL示例**:
```sql
-- 按注册月份分群，计算各群组的留存率
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('month', created_at) AS cohort_month,
    DATE_TRUNC('day', created_at) AS signup_date
  FROM users
  WHERE created_at >= '2026-01-01'
),
user_activity AS (
  SELECT DISTINCT
    user_id,
    DATE_TRUNC('day', activity_time) AS activity_date
  FROM user_events
  WHERE event_name = 'login'
),
cohort_retention AS (
  SELECT
    c.cohort_month,
    DATEDIFF('day', c.signup_date, a.activity_date) AS day_number,
    COUNT(DISTINCT c.user_id) AS active_users
  FROM cohorts c
  LEFT JOIN user_activity a ON c.user_id = a.user_id
  GROUP BY 1, 2
)
SELECT
  cohort_month,
  day_number,
  active_users,
  active_users * 1.0 / FIRST_VALUE(active_users) OVER (
    PARTITION BY cohort_month ORDER BY day_number
  ) AS retention_rate
FROM cohort_retention
ORDER BY 1, 2;
```

### Step 5: 可视化与解读

**热力图可视化**:
```
群组留存热力图（颜色越深 = 留存越高）

        D0   D1   D3   D7   D14  D30
Jan    ████ ███  ██   ██   █    █
Feb    ████ ███  ███  ██   ██   █
Mar    ████ ████ ███  ███  ██   ██
Apr    ████ ████ ████ ███  ███  ███
       ↑                 ↑
    100%              改善趋势
```

**解读要点**:
1. **纵向对比**: 同一群组随时间的留存曲线
2. **横向对比**: 不同群组在相同时间点的表现
3. **趋势识别**: 是改善还是恶化？
4. **异常识别**: 某个群组为什么表现不同？

## 输出模板

```markdown
# 群组分析报告 - [产品名称]

## 分析配置
- 群组定义: 按注册月份
- 观察指标: 登录活跃
- 时间窗口: 30天
- 分析周期: 2026-01 至 2026-06

## 群组留存表

| 群组 | 用户数 | D0 | D1 | D3 | D7 | D14 | D30 |
|------|--------|----|----|----|----|-----|-----|
| 2026-01 | 5,000 | 100% | 45% | 32% | 25% | 18% | 12% |
| 2026-02 | 5,500 | 100% | 48% | 35% | 28% | 20% | 15% |
| 2026-03 | 6,000 | 100% | 52% | 38% | 31% | 23% | 18% |

## 关键发现

### 1. 整体趋势
- 30日留存率从 12% 提升到 18%，改善 50%
- 改善主要发生在 D1-D7 阶段

### 2. 流失分析
- 最大流失发生在 D0→D1（约 50%）
- D7 之后流失趋于平缓

### 3. 异常群组
- 2026-03 群组表现显著优于之前
- 可能原因：3月上线了新手引导功能

## 建议

1. **短期**: 优化首次体验，提升 D1 留存
2. **中期**: 在 D7 前加强用户激活
3. **长期**: 持续追踪新功能对留存的影响
```

## 常见错误

- ❌ 混淆群组和整体平均值（用平均值掩盖了群组差异）
- ❌ 群组太小，不具备统计意义
- ❌ 时间窗口选择不当（太短看不出趋势，太长数据不完整）
- ❌ 忽略外部因素（季节性、节假日、市场变化）
- ❌ 只看留存，不看其他指标（活跃度、消费等）

## 进化接口

```json
{
  "method": "cohort-analysis",
  "timestamp": "2026-06-29T...",
  "context": {
    "productType": "mobile-app",
    "analysisType": "retention"
  },
  "input": {
    "cohortDefinition": "registration-month",
    "metric": "login",
    "timeWindow": "30-days",
    "dateRange": "2026-01-01 to 2026-06-30"
  },
  "output": {
    "cohortsAnalyzed": 6,
    "avgRetentionD30": 0.16,
    "trend": "improving",
    "keyFindings": 3
  },
  "metrics": {
    "dataQualityScore": 0.95,
    "statisticalSignificance": 0.98
  }
}
```

## 参考资料

- 《Lean Analytics》- Alistair Croll & Benjamin Yoskovitz
- Amplitude Cohort Analysis Guide
