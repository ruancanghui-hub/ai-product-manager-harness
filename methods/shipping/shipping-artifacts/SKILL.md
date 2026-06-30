---
name: shipping-artifacts
description: 交付物料生成——自动生成发布说明、API文档、部署清单等交付所需文档
source: DevOps最佳实践
category: shipping
---

# 交付物料生成 (Shipping Artifacts)

## 目的

确保产品发布时所有必要的文档和物料齐全，降低沟通成本和上线风险。

## 核心概念

**交付物料清单**:
1. 发布说明 (Release Notes)
2. API文档 (API Documentation)
3. 部署清单 (Deployment Checklist)
4. 回滚方案 (Rollback Plan)
5. 监控配置 (Monitoring Setup)

## 何时使用

- ✅ 版本发布前
- ✅ 功能上线前
- ✅ API变更时
- ✅ 基础设施变更时

## 使用步骤

### Step 1: 生成发布说明

**自动提取变更**:
```bash
# 从git commits提取变更
git log v2.0.0..HEAD --oneline --no-merges

# 从PR提取变更
gh pr list --state merged --base main --json title,number,labels
```

**发布说明模板**:
```markdown
# Release Notes - v2.1.0

发布日期: 2026-06-29

## 🎉 新功能

### 1. 深色模式支持 (#123)
- 支持系统级深色模式自动切换
- 提供手动切换开关
- 影响: 全应用主题

### 2. 批量导出功能 (#145)
- 支持导出CSV/Excel格式
- 单次最多导出10000条数据
- 影响: 数据报表模块

## 🐛 Bug修复

### 1. 修复登录页面验证码无法显示 (#167)
- 问题: 验证码接口超时导致
- 影响: 约5%用户无法登录
- 修复: 增加接口重试机制

### 2. 修复订单列表分页错误 (#178)
- 问题: 第10页后数据重复
- 影响: 订单管理模块
- 修复: 修正分页查询逻辑

## 🔧 性能优化

- 首页加载时间从3.2s优化到1.8s (#156)
- API响应时间平均减少25% (#160)

## 🔒 安全更新

- 升级lodash到4.17.21，修复原型污染漏洞 (#180)

## ⚠️ 破坏性变更

### API变更
- `GET /api/users` 响应格式变更
  - 旧: `{ users: [...] }`
  - 新: `{ data: [...], total: 100, page: 1 }`
  - 迁移: 更新分页参数

### 配置变更
- 新增环境变量: `DARK_MODE_ENABLED=true`
- 废弃环境变量: `OLD_THEME_CONFIG`

## 📦 升级指南

### 前端
```bash
npm install @myapp/ui@2.1.0
```

### 后端
```bash
# 更新配置
export DARK_MODE_ENABLED=true

# 运行迁移
npm run migrate

# 重启服务
pm2 restart myapp
```

## 👥 贡献者

感谢以下贡献者: @alice, @bob, @charlie
```

### Step 2: 生成API文档

**从代码自动生成**:
```javascript
/**
 * @api {get} /api/users 获取用户列表
 * @apiName GetUsers
 * @apiGroup User
 * @apiVersion 2.1.0
 *
 * @apiParam (Query) {Number} [page=1] 页码
 * @apiParam (Query) {Number} [limit=20] 每页数量
 * @apiParam (Query) {String} [search] 搜索关键词
 *
 * @apiSuccess {Object[]} data 用户列表
 * @apiSuccess {String} data.id 用户ID
 * @apiSuccess {String} data.name 用户名
 * @apiSuccess {String} data.email 邮箱
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Number} page 当前页码
 *
 * @apiSuccessExample {json} 成功响应:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *     { "id": "u1", "name": "Alice", "email": "alice@example.com" }
 *   ],
 *   "total": 100,
 *   "page": 1
 * }
 *
 * @apiError (Error 400) BadRequest 参数错误
 * @apiError (Error 401) Unauthorized 未授权
 */
app.get('/api/users', getUsers);
```

**API文档结构**:
```markdown
# API文档 v2.1.0

## 基础信息

- Base URL: `https://api.example.com/v2`
- 认证方式: Bearer Token
- 响应格式: JSON

## 认证

### 获取Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

## 用户接口

### 获取用户列表
```http
GET /users?page=1&limit=20&search=alice
Authorization: Bearer <token>
```

...

## 错误码

| 错误码 | 含义 | 处理建议 |
|--------|------|---------|
| 400 | 参数错误 | 检查请求参数 |
| 401 | 未授权 | 重新登录 |
| 403 | 无权限 | 联系管理员 |
| 404 | 资源不存在 | 检查资源ID |
| 500 | 服务器错误 | 联系技术支持 |
```

### Step 3: 部署清单

**部署检查清单**:
```markdown
# 部署清单 - v2.1.0

## 发布前检查 (Release -1 day)

### 代码检查
- [ ] 所有PR已合并到release分支
- [ ] 单元测试通过率100%
- [ ] 集成测试通过率100%
- [ ] 代码审查完成

### 环境检查
- [ ] 测试环境验证通过
- [ ] 预发布环境验证通过
- [ ] 数据库迁移脚本准备就绪
- [ ] 环境变量配置完成

### 文档检查
- [ ] 发布说明已撰写
- [ ] API文档已更新
- [ ] 操作手册已更新
- [ ] 回滚方案已准备

## 发布当天 (Release Day)

### 发布前 (T-30分钟)
- [ ] 通知相关团队即将发布
- [ ] 确认监控系统正常
- [ ] 确认值班人员在线
- [ ] 备份当前数据库

### 发布中 (T-0)
- [ ] 停止旧版本服务
- [ ] 执行数据库迁移
- [ ] 部署新版本代码
- [ ] 启动新版本服务
- [ ] 执行烟雾测试

### 发布后 (T+30分钟)
- [ ] 验证核心功能正常
- [ ] 检查错误日志
- [ ] 监控性能指标
- [ ] 通知团队发布完成

## 回滚方案

### 触发条件
- 错误率 > 5%
- 响应时间 > 5s
- 核心功能不可用

### 回滚步骤
```bash
# 1. 切换到旧版本代码
git checkout v2.0.0

# 2. 回滚数据库（如需要）
npm run migrate:rollback

# 3. 重启服务
pm2 restart myapp

# 4. 验证服务正常
curl https://api.example.com/health
```

### 回滚联系人
- 技术负责人: @alice (电话: 138xxxx)
- 运维负责人: @bob (电话: 139xxxx)
```

### Step 4: 监控配置

**监控告警配置**:
```yaml
# prometheus-alerts.yml
groups:
  - name: myapp-alerts
    rules:
      # 错误率告警
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误率超过5%"
          description: "过去5分钟错误率为 {{ $value }}"

      # 响应时间告警
      - alert: SlowResponse
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95响应时间超过2秒"
          description: "P95响应时间为 {{ $value }}秒"

      # 可用性告警
      - alert: ServiceDown
        expr: up{job="myapp"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务不可用"
          description: "服务已下线超过1分钟"
```

**监控看板配置**:
```markdown
# 监控看板配置

## 核心指标

### 可用性
- 目标: 99.9%
- 告警阈值: < 99.5%

### 响应时间
- P50目标: < 200ms
- P95目标: < 500ms
- P99目标: < 1s

### 错误率
- 目标: < 0.1%
- 告警阈值: > 1%

### QPS
- 峰值: 1000/s
- 平均: 500/s

## 监控工具
- 应用监控: Datadog / New Relic
- 日志分析: ELK Stack
- 错误追踪: Sentry
- 性能分析: Jaeger
```

## 输出模板

```markdown
# 交付物料清单 - v2.1.0

## 已生成物料

### 1. 发布说明
- 文件: `docs/release-notes/v2.1.0.md`
- 状态: ✅ 已完成
- 审核人: @alice

### 2. API文档
- 文件: `docs/api/v2.1.0.md`
- 状态: ✅ 已完成
- 在线地址: https://docs.example.com/api/v2.1.0

### 3. 部署清单
- 文件: `docs/deployment/v2.1.0-checklist.md`
- 状态: ✅ 已完成
- 负责人: @bob

### 4. 回滚方案
- 文件: `docs/deployment/v2.1.0-rollback.md`
- 状态: ✅ 已完成
- 验证人: @charlie

### 5. 监控配置
- 文件: `config/prometheus-alerts-v2.1.0.yml`
- 状态: ✅ 已部署
- 验证: 监控看板已更新

## 待办事项

- [ ] 发布说明发送到全员邮件
- [ ] API文档同步到开发者门户
- [ ] 部署清单打印并分发给值班人员
- [ ] 监控告警测试

## 发布审批

- [ ] 技术负责人审批: @alice
- [ ] 产品负责人审批: @david
- [ ] 运维负责人审批: @bob

发布时间: 2026-06-30 10:00
```

## 常见错误

- ❌ 发布说明过于简单，用户不知道变了什么
- ❌ API文档未同步更新
- ❌ 没有回滚方案
- ❌ 监控告警未配置或配置错误

## 进化接口

```json
{
  "method": "shipping-artifacts",
  "timestamp": "2026-06-29T...",
  "context": {
    "productType": "web-api",
    "version": "2.1.0"
  },
  "input": {
    "version": "2.1.0",
    "previousVersion": "2.0.0",
    "changes": {
      "features": 2,
      "bugfixes": 5,
      "breaking": 1
    }
  },
  "output": {
    "artifactsGenerated": 5,
    "artifactsVerified": 5,
    "approvalStatus": "pending"
  },
  "metrics": {
    "documentationCoverage": 1.0,
    "readinessScore": 0.95
  }
}
```
