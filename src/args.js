const ALL_AGENTS = ['claude', 'codex', 'cursor'];
const KNOWN_AGENTS = new Set(ALL_AGENTS);

export const HELP_TEXT = `
Usage:
  ai-pm create <directory> [options]
  ai-pm doctor [directory]
  ai-pm --help
  ai-pm --version

Examples:
  ai-pm create my-app --agents claude,codex,cursor
  ai-pm create my-app --agents codex,cursor
  ai-pm create . --agents all
  ai-pm create my-app --link
  ai-pm create . --force
  ai-pm doctor
  ai-pm doctor ./my-app

Options:
  --agents <list>   Comma-separated agents or "all" (default: all)
  --link            Link skills instead of copying
  --force           Replace managed conflicts
  --no-git          Skip git init
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

  if (command === 'doctor') {
    return {
      command: 'doctor',
      directory: rest[0] ?? '.',
    };
  }

  if (command === 'create') {
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

  throw new Error(`Unknown command: ${command}`);
}
