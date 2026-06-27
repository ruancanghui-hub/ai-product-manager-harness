# AI PM

一套可同时用于 Claude Code、Codex 和 Cursor 的 APP 全链路角色技能系统。

## 安装

需要 Node.js 20 或更高版本。

```bash
npm install -g ai-pm
```

> 当前仓库已具备 npm 包结构；只有实际发布到 npm 后，全局安装命令才会从公共 registry 生效。

## 创建项目

```bash
ai-pm create my-app --agents claude,codex,cursor
cd my-app
```

默认安装所有代理，也可以按需选择：

```bash
ai-pm create my-app --agents codex,cursor
ai-pm create . --agents all
```

CLI 只安装产品、设计、研发、测试、运营与项目管理技能，不替你预选 Flutter、React Native 或原生技术栈。技术方案由项目中的 `app-workflow` 根据产品需求确定。

## 复制与链接

默认复制技能到项目中，项目可以独立提交和迁移：

```bash
ai-pm create my-app
```

本地开发时可使用链接模式，让项目立即读取当前安装包中的技能：

```bash
ai-pm create my-app --link
```

Windows 创建链接可能需要开发者模式或额外权限；失败时去掉 `--link` 即可。

## 生成内容

选择全部代理时生成：

```text
.agents/skills/       Codex 与 Cursor 共用的开放标准技能
.claude/skills/       Claude Code 技能
.claude/hooks/        Claude Code 原生 hooks
.ai-pm/               跨平台评分规则与反馈目录
AGENTS.md              Codex/Cursor 项目指令
CLAUDE.md              Claude Code 项目指令
PROJECT-PHASE.md       项目阶段状态
```

包内 `package/skills/` 是唯一技能源，所有平台目录都由它生成。

## 冲突处理

已有文件不会被静默覆盖。CLI 会先列出全部冲突并停止：

```bash
ai-pm create . --force
```

`--force` 仅替换 AI PM 管理的目标文件，不删除其他项目文件。覆盖前请自行保存需要保留的技能修改。

使用 `--no-git` 可跳过自动执行 `git init`。

## 健康检查

```bash
ai-pm doctor
ai-pm doctor ./my-app
```

`doctor` 检查技能缺失、内容漂移、失效链接和机器相关绝对路径。健康时退出码为 0，发现问题时返回非 0 并给出修复建议。

