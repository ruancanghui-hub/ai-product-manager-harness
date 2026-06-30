const ALL_AGENTS = ['claude', 'codex', 'cursor'];
const KNOWN_AGENTS = new Set(ALL_AGENTS);

export const HELP_TEXT = `
AI PM - 自进化的AI产品管理脚手架

Usage:
  ai-pm <command> [options]

Commands:
  create <directory>       创建新项目
  doctor [directory]       健康检查
  evolve                   触发自进化分析
  learn                    查看学习结果
  recommend                获取智能推荐
  list <type>              列出可用资源
  route --input <text>     测试智能路由
  execute --method <name>  执行方法论
  help                     显示帮助
  version                  显示版本

Examples:
  # 创建项目
  ai-pm create my-app --agents all
  ai-pm create my-app --agents claude,codex
  ai-pm create . --link --force

  # 健康检查
  ai-pm doctor
  ai-pm doctor ./my-app

  # 查看可用资源
  ai-pm list methods       # 列出所有方法论
  ai-pm list skills        # 列出所有角色技能
  ai-pm list commands      # 列出所有链式命令

  # 智能推荐
  ai-pm recommend --context "新功能开发"
  ai-pm recommend --save   # 保存推荐报告

  # 自进化
  ai-pm evolve             # 分析使用模式
  ai-pm evolve --save      # 保存学习结果
  ai-pm learn --trend      # 查看学习曲线

  # 智能路由测试
  ai-pm route --input "帮我写个PRD"

  # 执行方法论
  ai-pm execute --method opportunity-solution-tree

Options:
  --agents <list>   指定代理平台 (claude,codex,cursor 或 all)
  --link            使用符号链接代替复制
  --force           强制覆盖冲突文件
  --no-git          跳过git初始化
  --context <text>  上下文描述
  --method <name>   方法名称
  --input <text>    输入文本
  --type <type>     资源类型 (methods/skills/commands)
  --save            保存结果
  --trend           显示趋势
`;

function parseAgentList(value) {
  if (value === 'all') {
    return [...ALL_AGENTS];
  }

  const agents = [];
  const seen = new Set();
  for (const raw of value.split(',')) {
    const agent = raw.trim();
    if (!agent) continue;
    if (!KNOWN_AGENTS.has(agent)) {
      throw new Error(`Unknown agent: ${agent}`);
    }
    if (!seen.has(agent)) {
      seen.add(agent);
      agents.push(agent);
    }
  }

  return agents.length > 0 ? agents : [...ALL_AGENTS];
}

export function parseArgs(argv) {
  if (argv.length === 0 || argv.includes('--help') || argv[0] === 'help') {
    return { command: 'help' };
  }
  if (argv.includes('--version') || argv[0] === 'version') {
    return { command: 'version' };
  }

  const command = argv[0];
  const rest = argv.slice(1);

  // 简单命令（无参数）
  if (command === 'evolve' || command === 'learn' || command === 'recommend') {
    return parseSimpleCommand(command, rest);
  }

  // doctor 命令
  if (command === 'doctor') {
    return {
      command: 'doctor',
      directory: rest[0] && !rest[0].startsWith('-') ? rest[0] : '.',
    };
  }

  // create 命令
  if (command === 'create') {
    return parseCreateCommand(rest);
  }

  // list 命令
  if (command === 'list') {
    return parseListCommand(rest);
  }

  // route 命令
  if (command === 'route') {
    return parseRouteCommand(rest);
  }

  // execute 命令
  if (command === 'execute') {
    return parseExecuteCommand(rest);
  }

  throw new Error(`Unknown command: ${command}. Run "ai-pm help" for usage.`);
}

function parseSimpleCommand(command, rest) {
  const result = { command };

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--save') {
      result.save = true;
    } else if (arg === '--trend') {
      result.trend = true;
    } else if (arg === '--context') {
      if (i + 1 >= rest.length || rest[i + 1].startsWith('-')) {
        throw new Error('--context requires a value');
      }
      result.context = rest[i + 1];
      i += 1;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return result;
}

function parseCreateCommand(rest) {
  if (rest.length === 0 || rest[0].startsWith('-')) {
    throw new Error('create requires a directory');
  }

  let directory = rest[0];
  let agents = [...ALL_AGENTS];
  let link = false;
  let force = false;
  let git = true;

  for (let i = 1; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--link') {
      link = true;
    } else if (arg === '--force') {
      force = true;
    } else if (arg === '--no-git') {
      git = false;
    } else if (arg === '--agents') {
      if (i + 1 >= rest.length || rest[i + 1].startsWith('-')) {
        throw new Error('--agents requires a value');
      }
      agents = parseAgentList(rest[i + 1]);
      i += 1;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { command: 'create', directory, agents, link, force, git };
}

function parseListCommand(rest) {
  if (rest.length === 0 || rest[0].startsWith('-')) {
    throw new Error('list requires a type: methods, skills, or commands');
  }

  const type = rest[0];
  if (!['methods', 'skills', 'commands'].includes(type)) {
    throw new Error(`Unknown type: ${type}. Must be methods, skills, or commands.`);
  }

  return { command: 'list', type };
}

function parseRouteCommand(rest) {
  const result = { command: 'route' };

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--input') {
      if (i + 1 >= rest.length || rest[i + 1].startsWith('-')) {
        throw new Error('--input requires a value');
      }
      result.input = rest[i + 1];
      i += 1;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!result.input) {
    throw new Error('--input is required for route command');
  }

  return result;
}

function parseExecuteCommand(rest) {
  const result = { command: 'execute' };

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--method') {
      if (i + 1 >= rest.length || rest[i + 1].startsWith('-')) {
        throw new Error('--method requires a value');
      }
      result.method = rest[i + 1];
      i += 1;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!result.method) {
    throw new Error('--method is required for execute command');
  }

  return result;
}
