const AGENTS = ['claude', 'codex', 'cursor'];

export const HELP_TEXT = `ai-pm - initialize cross-agent APP development skills

Usage:
  ai-pm create <directory> [options]
  ai-pm doctor [directory]
  ai-pm --help
  ai-pm --version

Options:
  --agents <list>  claude,codex,cursor or all (default: all)
  --link           Link skills instead of copying them
  --force          Replace conflicting AI PM-managed files
  --no-git         Do not initialize a Git repository

Examples:
  ai-pm create my-app --agents claude,codex,cursor
  ai-pm create my-app --agents codex,cursor --link
  ai-pm create . --agents all
`;

function parseAgents(value) {
  if (!value) throw new Error('--agents requires a value');
  if (value === 'all') return [...AGENTS];

  const result = [];
  for (const agent of value.split(',').filter(Boolean)) {
    if (!AGENTS.includes(agent)) throw new Error(`Unknown agent: ${agent}`);
    if (!result.includes(agent)) result.push(agent);
  }
  if (result.length === 0) throw new Error('--agents requires at least one agent');
  return result;
}

export function parseArgs(argv) {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h' || argv[0] === 'help') {
    return { command: 'help' };
  }
  if (argv[0] === '--version' || argv[0] === '-v' || argv[0] === 'version') {
    return { command: 'version' };
  }
  if (argv[0] === 'doctor') {
    if (argv.length > 2) throw new Error(`Unknown option: ${argv[2]}`);
    return { command: 'doctor', directory: argv[1] ?? '.' };
  }
  if (argv[0] !== 'create') throw new Error(`Unknown command: ${argv[0]}`);
  if (!argv[1] || argv[1].startsWith('-')) throw new Error('create requires a directory');

  const parsed = {
    command: 'create',
    directory: argv[1],
    agents: [...AGENTS],
    link: false,
    force: false,
    git: true,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '--agents') {
      parsed.agents = parseAgents(argv[index + 1]);
      index += 1;
    } else if (option === '--link') {
      parsed.link = true;
    } else if (option === '--force') {
      parsed.force = true;
    } else if (option === '--no-git') {
      parsed.git = false;
    } else {
      throw new Error(`Unknown option: ${option}`);
    }
  }
  return parsed;
}
