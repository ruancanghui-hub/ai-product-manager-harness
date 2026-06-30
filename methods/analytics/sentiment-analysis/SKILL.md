---
name: sentiment-analysis
description: 用户反馈情感分析——从大规模用户反馈中提取情感倾向、主题和洞察
source: NLP分析方法
category: analytics
---

# 用户反馈情感分析 (Sentiment Analysis)

## 目的

从大规模用户反馈（App Store评论、客服工单、社交媒体）中自动提取情感倾向、主题分类和关键洞察。

## 核心概念

**情感分类**:
- 正面（Positive）: 满意、赞扬、推荐
- 负面（Negative）: 不满、抱怨、批评
- 中性（Neutral）: 提问、建议、事实陈述

**主题提取**:
- 从反馈中识别高频主题
- 例如：性能问题、功能缺失、价格抱怨、体验问题

**洞察生成**:
- 识别优先改进项
- 发现用户真实需求
- 追踪口碑趋势

## 何时使用

- ✅ 分析大量用户评论（≥100条）
- ✅ 版本上线后快速了解用户反馈
- ✅ 识别用户痛点优先级
- ✅ 追踪口碑变化趋势
- ❌ 反馈量太少（<50条）
- ❌ 需要深度理解单个用户

## 使用步骤

### Step 1: 数据收集

**数据来源**:
```
App Store / Google Play 评论
- 评分（1-5星）
- 评论内容
- 评论时间
- 版本号

客服工单
- 工单内容
- 工单分类
- 处理结果

社交媒体
- 微博、小红书、Twitter
- 提及品牌的内容
```

**数据清洗**:
```python
import re

def clean_text(text):
    # 去除特殊字符
    text = re.sub(r'[^\w\s]', '', text)
    # 去除多余空格
    text = re.sub(r'\s+', ' ', text)
    # 转小写
    text = text.lower()
    return text
```

### Step 2: 情感分类

**使用预训练模型**:
```python
from transformers import pipeline

# 加载情感分析模型
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest"
)

# 分析单条反馈
result = sentiment_analyzer("这个APP太好用了，推荐！")
# {'label': 'POSITIVE', 'score': 0.98}

# 批量分析
feedbacks = ["很好用", "太卡了", "还行"]
results = sentiment_analyzer(feedbacks)
```

**结合评分分析**:
```python
def analyze_with_rating(text, rating):
    """
    结合评分和文本情感
    - 评分1-2星：负面倾向
    - 评分3星：中性
    - 评分4-5星：正面倾向
    """
    sentiment = sentiment_analyzer(text)[0]

    # 评分与文本情感冲突时，以评分为准
    if rating <= 2 and sentiment['label'] == 'POSITIVE':
        return 'NEGATIVE'  # 用户可能反讽
    elif rating >= 4 and sentiment['label'] == 'NEGATIVE':
        return 'NEUTRAL'  # 用户可能只是提小问题

    return sentiment['label']
```

### Step 3: 主题提取

**关键词提取**:
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation

# TF-IDF 提取关键词
vectorizer = TfidfVectorizer(max_features=100)
tfidf_matrix = vectorizer.fit_transform(feedbacks)
feature_names = vectorizer.get_feature_names_out()

# LDA 主题模型
lda = LatentDirichletAllocation(n_components=5)
lda.fit(tfidf_matrix)

# 输出每个主题的关键词
for topic_idx, topic in enumerate(lda.components_):
    top_words = [feature_names[i] for i in topic.argsort()[-10:]]
    print(f"主题 {topic_idx}: {', '.join(top_words)}")
```

**常见主题分类**:
```
性能问题：卡顿、闪退、慢、耗电
功能缺失：没有XX功能、希望能加XX
体验问题：难用、找不到、操作复杂
价格抱怨：太贵、不值、收费
正面反馈：好用、推荐、喜欢
```

### Step 4: 洞察生成

**优先级矩阵**:
```
        高频
         │
   重要  │   紧急
  (规划) │  (立即处理)
         │
─────────┼───────── 低频
         │
   次要  │   机会
  (观察) │  (探索)
         │
        低影响
       高影响
```

**洞察模板**:
```markdown
## 关键洞察

### 紧急问题（高频+高影响）
1. **性能问题** - 提及率 35%
   - 具体问题：卡顿（18%）、闪退（12%）、耗电（5%）
   - 用户原声：「打开要5秒，太卡了」
   - 建议：优先优化启动速度

### 重要问题（高频+低影响）
2. **功能缺失** - 提及率 20%
   - 缺失功能：深色模式（8%）、iPad适配（7%）、小组件（5%）
   - 建议：纳入下季度规划

### 正面亮点
3. **用户喜爱** - 正面率 45%
   - 喜欢点：界面简洁（15%）、功能实用（12%）、速度快（10%）
   - 建议：在营销中突出这些优势
```

### Step 5: 趋势追踪

**情感趋势图**:
```
正面率趋势（按周）

100% │
 80% │     ████
 60% │ ████ ████ ████
 40% │ ████ ████ ████ ████
 20% │ ████ ████ ████ ████ ████
  0% └─────────────────────────
     W1   W2   W3   W4   W5

     ↑              ↑
   上线前        上线后
   正面率60%    正面率75%
```

## 输出模板

```markdown
# 用户反馈情感分析报告

## 分析概览
- 分析周期: 2026-06-01 至 2026-06-30
- 反馈总数: 1,234 条
- 数据来源: App Store 评论 (80%) + 客服工单 (20%)

## 情感分布

| 情感 | 数量 | 占比 | 环比变化 |
|------|------|------|---------|
| 正面 | 555 | 45% | +5% ↗️ |
| 中性 | 370 | 30% | -2% → |
| 负面 | 309 | 25% | -3% ↘️ |

**总体评分**: 4.2/5.0 (环比 +0.2)

## 主题分析

### 负面主题 TOP 5
| 主题 | 提及率 | 典型反馈 | 优先级 |
|------|--------|---------|--------|
| 性能问题 | 15% | 「太卡了，打开要5秒」 | 🔴 紧急 |
| 价格抱怨 | 8% | 「会员太贵了」 | 🟡 重要 |
| 功能缺失 | 6% | 「希望能有深色模式」 | 🟡 重要 |
| 登录问题 | 4% | 「验证码收不到」 | 🔴 紧急 |
| 广告太多 | 3% | 「广告太烦人」 | 🟢 次要 |

### 正面主题 TOP 5
| 主题 | 提及率 | 典型反馈 |
|------|--------|---------|
| 界面简洁 | 12% | 「UI很清爽，用着舒服」 |
| 功能实用 | 10% | 「解决了我的大问题」 |
| 速度快 | 8% | 「比之前快多了」 |
| 推荐意愿 | 6% | 「推荐给朋友了」 |
| 客服好 | 4% | 「客服响应很快」 |

## 行动建议

### 立即处理 (P0)
1. **性能优化** - 15% 用户抱怨卡顿
   - 优化启动速度
   - 减少内存占用
   - 目标：启动时间 < 2秒

2. **登录问题修复** - 4% 用户无法登录
   - 排查验证码发送失败原因
   - 增加备用登录方式

### 规划中 (P1)
1. **深色模式** - 6% 用户需求
   - 纳入 Q3 规划
   - 预计提升正面率 5%

2. **价格策略调整** - 8% 用户抱怨贵
   - AB测试不同定价方案
   - 增加免费功能

### 观察中 (P2)
1. **广告体验优化** - 3% 用户抱怨
   - 优化广告频次
   - 提升广告相关性

## 趋势分析

### 情感趋势
- 正面率从 40% 提升到 45%（+5%）
- 负面率从 28% 降低到 25%（-3%）
- 主要改善：性能问题抱怨减少 8%

### 版本对比
| 版本 | 正面率 | 主要改善 | 主要抱怨 |
|------|--------|---------|---------|
| v2.0 | 40% | 界面简洁 | 性能问题 |
| v2.1 | 45% | 速度提升 | 价格 |
```

## 常见错误

- ❌ 样本量太少就下结论
- ❌ 忽略评分只看文本（或反之）
- ❌ 过度依赖自动化，不读原始反馈
- ❌ 只看负面，忽略正面亮点
- ❌ 不追踪趋势，只看单点数据

## 进化接口

```json
{
  "method": "sentiment-analysis",
  "timestamp": "2026-06-29T...",
  "context": {
    "productType": "mobile-app",
    "feedbackSource": "app-store"
  },
  "input": {
    "feedbackCount": 1234,
    "dateRange": "2026-06-01 to 2026-06-30",
    "sources": ["app-store", "customer-service"]
  },
  "output": {
    "positiveRate": 0.45,
    "negativeRate": 0.25,
    "neutralRate": 0.30,
    "topNegativeThemes": ["performance", "price", "missing-features"],
    "topPositiveThemes": ["ui", "utility", "speed"],
    "actionableInsights": 5
  },
  "metrics": {
    "modelAccuracy": 0.87,
    "coverageRate": 0.92
  }
}
```

## 参考资料

- 《Natural Language Processing with Python》
- Hugging Face Transformers Documentation
