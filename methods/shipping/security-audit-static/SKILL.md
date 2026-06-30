---
name: security-audit-static
description: 静态安全审计——在代码层面识别安全风险，包括注入、认证、授权、敏感数据等问题
source: OWASP Top 10, 安全最佳实践
category: shipping
---

# 静态安全审计 (Static Security Audit)

## 目的

在代码层面识别安全漏洞，确保产品在上线前不存在常见安全问题。

## 核心概念

**OWASP Top 10 (2021)**:
1. 访问控制失效 (Broken Access Control)
2. 加密失败 (Cryptographic Failures)
3. 注入攻击 (Injection)
4. 不安全设计 (Insecure Design)
5. 安全配置错误 (Security Misconfiguration)
6. 易受攻击和过时的组件 (Vulnerable and Outdated Components)
7. 认证和会话失败 (Identification and Authentication Failures)
8. 软件和数据完整性失败 (Software and Data Integrity Failures)
9. 安全日志和监控失败 (Security Logging and Monitoring Failures)
10. 服务器端请求伪造 (SSRF)

## 何时使用

- ✅ 代码上线前
- ✅ 引入第三方库时
- ✅ 功能变更后
- ✅ 定期安全扫描

## 审计清单

### 1. 注入攻击防护

```javascript
// ❌ 错误：SQL注入风险
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 正确：使用参数化查询
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// ❌ 错误：XSS风险
element.innerHTML = userInput;

// ✅ 正确：使用textContent或框架自动转义
element.textContent = userInput;
```

**检查项**:
- [ ] 所有数据库查询使用参数化
- [ ] 用户输入经过验证和转义
- [ ] 不使用eval()、Function()等危险函数
- [ ] HTML输出使用安全渲染方法

### 2. 认证与会话安全

```javascript
// ❌ 错误：弱密码策略
if (password.length >= 6) { /* 允许 */ }

// ✅ 正确：强密码策略
if (password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)) {
  /* 允许 */
}

// ❌ 错误：明文存储密码
await db.query('INSERT INTO users (password) VALUES (?)', [password]);

// ✅ 正确：使用bcrypt
const hashedPassword = await bcrypt.hash(password, 12);
await db.query('INSERT INTO users (password) VALUES (?)', [hashedPassword]);
```

**检查项**:
- [ ] 密码强度要求（长度、复杂度）
- [ ] 密码加密存储（bcrypt/argon2）
- [ ] 登录失败限制（防暴力破解）
- [ ] 会话超时机制
- [ ] HTTPS传输
- [ ] 多因素认证（敏感操作）

### 3. 访问控制

```javascript
// ❌ 错误：前端权限控制
if (userRole === 'admin') {
  showAdminPanel();
}

// ✅ 正确：后端权限验证
app.delete('/api/users/:id', authenticate, authorize('admin'), async (req, res) => {
  await deleteUser(req.params.id);
  res.json({ success: true });
});

// ❌ 错误：IDOR风险
app.get('/api/orders/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  res.json(order);
});

// ✅ 正确：验证资源归属
app.get('/api/orders/:id', authenticate, async (req, res) => {
  const order = await getOrder(req.params.id);
  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: '无权访问' });
  }
  res.json(order);
});
```

**检查项**:
- [ ] 权限验证在后端执行
- [ ] 敏感操作需要二次验证
- [ ] 避免IDOR（不安全的直接对象引用）
- [ ] 最小权限原则

### 4. 敏感数据保护

```javascript
// ❌ 错误：敏感信息明文存储
localStorage.setItem('token', token);
localStorage.setItem('creditCard', cardNumber);

// ✅ 正确：使用httpOnly cookie存储token
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// ❌ 错误：敏感信息记录到日志
console.log('User login:', email, password);

// ✅ 正确：脱敏处理
console.log('User login:', email.substring(0, 3) + '***');
```

**检查项**:
- [ ] 敏感数据加密存储
- [ ] 敏感数据加密传输
- [ ] 日志脱敏处理
- [ ] 不在前端存储敏感信息

### 5. API安全

```javascript
// ❌ 错误：无速率限制
app.post('/api/login', async (req, res) => { ... });

// ✅ 正确：添加速率限制
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5 // 最多5次请求
});
app.post('/api/login', rateLimiter, async (req, res) => { ... });

// ❌ 错误：CORS配置过宽
app.use(cors({ origin: '*' }));

// ✅ 正确：限制CORS来源
app.use(cors({
  origin: ['https://example.com'],
  credentials: true
}));
```

**检查项**:
- [ ] API速率限制
- [ ] CORS配置正确
- [ ] 输入验证
- [ ] 错误信息不泄露敏感信息

## 输出模板

```markdown
# 安全审计报告

## 审计概览
- 审计日期: 2026-06-29
- 审计范围: v2.1.0 代码库
- 审计工具: SonarQube + 人工审查
- 风险等级: 🔴 高危 2 | 🟠 中危 5 | 🟡 低危 12

## 发现问题

### 🔴 高危问题

#### 1. SQL注入风险
- 位置: `src/api/users.js:45`
- 代码: `db.query(\`SELECT * FROM users WHERE id = \${id}\`)`
- 风险: 攻击者可通过构造恶意ID获取任意数据
- 修复: 使用参数化查询
- 优先级: P0 - 立即修复

#### 2. 认证绕过
- 位置: `src/middleware/auth.js:23`
- 代码: 缺少token有效性验证
- 风险: 已注销token仍可使用
- 修复: 添加token黑名单验证
- 优先级: P0 - 立即修复

### 🟠 中危问题

#### 3. XSS风险
- 位置: `src/components/Comment.js:12`
- 代码: `dangerouslySetInnerHTML={{ __html: comment }}`
- 修复: 使用DOMPurify净化HTML
- 优先级: P1 - 本周修复

...

## 修复优先级

| 优先级 | 问题数 | 建议完成时间 |
|--------|--------|-------------|
| P0 | 2 | 立即 |
| P1 | 5 | 3天内 |
| P2 | 12 | 发布前 |

## 合规检查

- [x] OWASP Top 10
- [ ] GDPR（需补充隐私政策）
- [ ] 等保2.0（需补充审计日志）

## 建议

1. **立即修复P0问题**，否则不应上线
2. **补充安全测试用例**，集成到CI/CD
3. **定期安全培训**，提升团队安全意识
```

## 常见错误

- ❌ 只依赖自动化工具，不人工审查
- ❌ 只检查代码，忽略配置和依赖
- ❌ 修复后不复测
- ❌ 不追踪漏洞修复进度

## 进化接口

```json
{
  "method": "security-audit-static",
  "timestamp": "2026-06-29T...",
  "context": {
    "productType": "web-api",
    "language": "javascript"
  },
  "input": {
    "codebase": "v2.1.0",
    "scanScope": "full"
  },
  "output": {
    "criticalIssues": 2,
    "highIssues": 5,
    "mediumIssues": 8,
    "lowIssues": 12,
    "coverageRate": 0.95,
    "complianceScore": 0.78
  },
  "metrics": {
    "scanDuration": "45min",
    "filesScanned": 1234
  }
}
```

## 参考资料

- OWASP Top 10 - https://owasp.org/Top10/
- OWASP Cheat Sheet Series
