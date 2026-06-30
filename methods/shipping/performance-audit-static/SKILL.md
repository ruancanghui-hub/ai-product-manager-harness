---
name: performance-audit-static
description: 静态性能审计——在代码层面识别性能问题，包括N+1查询、内存泄漏、过度渲染等
source: Web性能最佳实践
category: shipping
---

# 静态性能审计 (Static Performance Audit)

## 目的

在代码层面识别性能瓶颈，避免上线后影响用户体验。

## 核心概念

**性能指标**:
- LCP (Largest Contentful Paint): 最大内容绘制时间
- FID (First Input Delay): 首次输入延迟
- CLS (Cumulative Layout Shift): 累积布局偏移
- TTI (Time to Interactive): 可交互时间

**性能预算**:
- 资源大小限制
- 加载时间限制
- 执行时间限制

## 何时使用

- ✅ 代码上线前
- ✅ 性能优化时
- ✅ 引入新依赖时
- ✅ 定期性能检查

## 审计清单

### 1. 数据库查询优化

```javascript
// ❌ 错误：N+1查询
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  user.orders = await db.query(`SELECT * FROM orders WHERE user_id = ${user.id}`);
}

// ✅ 正确：使用JOIN或批量查询
const users = await db.query(`
  SELECT u.*, o.id as order_id, o.amount
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
`);

// 或使用批量查询
const userIds = users.map(u => u.id);
const orders = await db.query(`
  SELECT * FROM orders WHERE user_id IN (?)
`, [userIds]);
```

**检查项**:
- [ ] 避免N+1查询
- [ ] 使用索引
- [ ] 限制查询结果数量
- [ ] 使用分页

### 2. 内存泄漏检查

```javascript
// ❌ 错误：未清理定时器
useEffect(() => {
  setInterval(() => {
    fetchData();
  }, 1000);
}, []);

// ✅ 正确：清理定时器
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ❌ 错误：未取消订阅
useEffect(() => {
  socket.on('message', handleMessage);
}, []);

// ✅ 正确：取消订阅
useEffect(() => {
  socket.on('message', handleMessage);
  return () => socket.off('message', handleMessage);
}, []);
```

**检查项**:
- [ ] 定时器清理
- [ ] 事件监听器移除
- [ ] 订阅取消
- [ ] 大对象释放

### 3. 前端渲染优化

```javascript
// ❌ 错误：过度渲染
function UserList({ users }) {
  return users.map(user => (
    <UserCard
      key={user.id}
      user={user}
      onClick={() => console.log(user.id)} // 每次渲染创建新函数
    />
  ));
}

// ✅ 正确：使用useCallback
function UserList({ users }) {
  const handleClick = useCallback((userId) => {
    console.log(userId);
  }, []);

  return users.map(user => (
    <UserCard
      key={user.id}
      user={user}
      onClick={handleClick}
    />
  ));
}

// ❌ 错误：在渲染中计算
function ExpensiveList({ items }) {
  return items.map(item => (
    <div key={item.id}>{expensiveCalculation(item)}</div>
  ));
}

// ✅ 正确：使用useMemo
function ExpensiveList({ items }) {
  const processedItems = useMemo(
    () => items.map(item => expensiveCalculation(item)),
    [items]
  );

  return processedItems.map(item => (
    <div key={item.id}>{item}</div>
  ));
}
```

**检查项**:
- [ ] 避免不必要的重渲染
- [ ] 使用React.memo/useMemo/useCallback
- [ ] 虚拟列表（大数据量）
- [ ] 懒加载组件

### 4. 资源优化

```javascript
// ❌ 错误：同步加载大文件
import heavyLibrary from 'heavy-library';

// ✅ 正确：动态导入
const heavyLibrary = await import('heavy-library');

// ❌ 错误：未压缩图片
<img src="large-image.png" />

// ✅ 正确：使用WebP格式和懒加载
<img
  src="image.webp"
  loading="lazy"
  alt="..."
/>
```

**检查项**:
- [ ] 代码分割
- [ ] 懒加载
- [ ] 图片压缩
- [ ] 使用CDN

### 5. API性能

```javascript
// ❌ 错误：无缓存
app.get('/api/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});

// ✅ 正确：使用缓存
app.get('/api/users', cacheMiddleware(300), async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});

// ❌ 错误：响应数据过大
app.get('/api/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users); // 返回所有字段
});

// ✅ 正确：只返回需要的字段
app.get('/api/users', async (req, res) => {
  const users = await db.query('SELECT id, name, avatar FROM users');
  res.json(users);
});
```

**检查项**:
- [ ] 使用缓存
- [ ] 响应数据精简
- [ ] 压缩响应（gzip/brotli）
- [ ] 使用HTTP/2

## 输出模板

```markdown
# 性能审计报告

## 审计概览
- 审计日期: 2026-06-29
- 审计范围: v2.1.0 代码库
- 性能预算: LCP < 2.5s, FID < 100ms, CLS < 0.1
- 风险等级: 🔴 严重 1 | 🟠 警告 4 | 🟡 建议 15

## 发现问题

### 🔴 严重问题

#### 1. N+1查询导致性能瓶颈
- 位置: `src/api/orders.js:67-72`
- 问题: 查询100个用户执行101次SQL
- 影响: 响应时间从200ms增加到2.5s
- 修复: 使用JOIN或批量查询
- 预期改善: 响应时间降低80%

### 🟠 警告问题

#### 2. 内存泄漏风险
- 位置: `src/components/Dashboard.js:23`
- 问题: 未清理setInterval
- 影响: 页面停留时间过长时内存占用持续增长
- 修复: 在useEffect清理函数中清除定时器

...

## 性能预算检查

| 指标 | 预算 | 实际 | 状态 |
|------|------|------|------|
| LCP | < 2.5s | 3.2s | ❌ 超出 |
| FID | < 100ms | 85ms | ✅ 通过 |
| CLS | < 0.1 | 0.05 | ✅ 通过 |
| JS包大小 | < 500KB | 680KB | ❌ 超出 |

## 优化建议

### 立即修复 (P0)
1. N+1查询 → 预期提升响应速度80%
2. JS包体积优化 → 预期减少加载时间1.2s

### 短期优化 (P1)
1. 图片懒加载 → 预期减少首屏加载时间0.5s
2. API缓存 → 预期减少服务器负载40%

### 长期优化 (P2)
1. 数据库索引优化
2. CDN部署
```

## 常见错误

- ❌ 只看加载时间，不关注交互性能
- ❌ 优化过度，增加代码复杂度
- ❌ 不设置性能预算
- ❌ 优化后不测量效果

## 进化接口

```json
{
  "method": "performance-audit-static",
  "timestamp": "2026-06-29T...",
  "context": {
    "productType": "web-app",
    "framework": "react"
  },
  "input": {
    "codebase": "v2.1.0",
    "budget": {
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1,
      "bundleSize": 500000
    }
  },
  "output": {
    "criticalIssues": 1,
    "warnings": 4,
    "suggestions": 15,
    "budgetPassRate": 0.5,
    "estimatedImprovement": "response-time -80%"
  }
}
```

## 参考资料

- Web Vitals - https://web.dev/vitals/
- React Performance Optimization
