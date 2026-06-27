# AI PM 跨代理 CLI 设计

## 目标

将现有 APP 全链路角色技能系统发布为 npm CLI，使用户通过以下命令创建可被 Claude Code、Codex 和 Cursor 使用的项目：

```bash
npm install -g ai-pm
ai-pm create my-app --agents claude,codex,cursor
```

CLI 只初始化 AI 项目管理环境，不预先选择 React Native、Flutter、iOS、Android 等技术栈。具体技术方案由项目中的 `app-workflow` 后续确定。

## 核心原则

1. npm 包内的标准技能目录是唯一事实源，禁止手工维护三套技能副本。
2. 默认复制技能，使新项目独立、可提交 Git、可跨机器使用。
3. 可选 `--link` 模式，供本地开发时共享和即时更新技能。
4. 使用各代理公开支持的原生目录，不伪造平台不支持的 hooks。
5. 已有文件不得被静默覆盖。

## 生成结构

选择全部代理时，新项目结构如下：

```text
my-app/
├── .agents/
│   └── skills/             # Codex 与 Cursor 共用
├── .claude/
│   ├── skills/             # Claude Code
│   ├── hooks/
│   ├── settings.json
│   └── SCORING-RUBRIC.md
├── AGENTS.md                # Codex/Cursor 项目指令
├── CLAUDE.md                # Claude 项目指令
├── PROJECT-PHASE.md         # 初始项目阶段状态
└── .gitignore               # 仅在需要且无冲突时补充
```

`.agents/skills` 和 `.claude/skills` 均由包内同一份 `skills/` 生成。复制模式产生实体文件；链接模式产生指向包内事实源的目录链接。

## CLI 接口

### 创建项目

```bash
ai-pm create <directory> [options]
```

选项：

| 选项 | 含义 | 默认值 |
|---|---|---|
| `--agents <list>` | `claude,codex,cursor` 或 `all` | `all` |
| `--link` | 以符号链接安装技能 | `false` |
| `--force` | 覆盖由 AI PM 管理的冲突文件 | `false` |
| `--no-git` | 不初始化 Git 仓库 | `false` |
| `--help` | 显示帮助 | — |
| `--version` | 显示版本 | — |

支持 `ai-pm create . --agents all` 初始化当前目录。`codex,cursor` 同时选择时只生成一份 `.agents/skills`。

### 环境诊断

```bash
ai-pm doctor [directory]
```

检查：

- 项目指令文件是否存在；
- 所选平台的技能目录是否存在；
- 九个标准技能及其 `SKILL.md` 是否完整；
- 符号链接是否失效；
- 多平台技能内容是否与包内事实源一致；
- 配置中是否残留本机绝对路径。

诊断只读，成功返回退出码 0；发现问题返回非 0，并提供修复建议。

## 组件边界

### 命令入口

负责参数解析、帮助信息、退出码与错误展示，不处理文件复制细节。

### 项目规划器

将 `agents` 选择转换成目标文件计划。它负责去重共享目录，并在写入前完整检测冲突。

### 安装器

执行目录创建、模板渲染、复制或链接。写入过程中失败时，清理由本次命令新建且尚未完成的内容，尽量不留下半初始化项目。

### 模板与技能源

包内保留一套平台无关技能正文，以及 Claude、AGENTS 两类平台入口模板。平台路径只在安装器映射中出现，技能正文不写死 `.claude`、`.codex` 或本机绝对路径。

### 诊断器

只读取项目文件并输出结构化检查结果，供终端格式化展示，也便于测试。

## 数据流

```text
CLI 参数
  → 参数校验
  → 生成目标文件计划
  → 一次性冲突预检
  → 创建目标目录
  → 渲染入口文件
  → 复制或链接技能
  → 初始化 Git（可选）
  → 运行轻量完整性检查
  → 输出下一步命令
```

## 错误处理

- 未知代理名：列出合法值并退出，不创建目录。
- 目标目录存在：允许向空目录或无冲突目录安装；冲突时停止并列出全部冲突。
- `--force`：只覆盖本工具声明管理的文件，不删除其他用户文件。
- 链接创建失败：说明系统权限或文件系统限制，并建议去掉 `--link`。
- Git 不可用：项目仍可创建，但输出警告；显式 `--no-git` 时不警告。
- 任一步骤异常：保留原有文件，清理本次新建的未完成内容。

## 跨平台兼容

- 使用 Node.js 文件 API 和 `path`，不依赖 Bash、`cp`、`ln` 等 Unix 命令。
- 支持 macOS、Linux 与 Windows 当前维护中的 Node.js LTS。
- 模板不得包含开发机绝对路径。
- Claude hooks 使用相对项目路径和跨平台 Node 脚本；Codex/Cursor 的关键行为通过 `AGENTS.md` 与技能协议实现。

## 测试策略

采用测试先行：

1. 参数测试：默认值、代理列表、非法值、`.` 目录。
2. 规划器测试：Claude、Codex、Cursor 单选与组合去重。
3. 文件系统集成测试：复制、链接、冲突、`--force`、失败清理。
4. 模板测试：无绝对路径、技能数量正确、入口文件引用正确。
5. doctor 测试：完整项目、缺文件、漂移、失效链接。
6. CLI 冒烟测试：帮助、版本、创建临时项目、诊断退出码。
7. 打包测试：对 `npm pack` 产物运行创建与诊断，避免只在源码仓库可用。

## 第一版范围外

- 自动选择或生成 APP 技术栈；
- 发布 Claude、Cursor 或 Codex 专属市场插件；
- 自动在线升级已创建项目；
- 遥测、账号系统和云端服务；
- 将平台专属 hooks 强行模拟到其他代理。

这些能力可在 CLI 稳定后分别演进，不影响当前文件格式和命令接口。
