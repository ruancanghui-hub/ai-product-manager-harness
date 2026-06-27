import { readFile } from 'node:fs/promises';

import { HELP_TEXT, parseArgs } from './args.js';
import { diagnoseProject } from './doctor.js';
import { installProject } from './install.js';

const packageJsonUrl = new URL('../package.json', import.meta.url);

function defaultIo() {
  return {
    out: (message) => console.log(message),
    error: (message) => console.error(message),
  };
}

export async function main(argv, io = defaultIo()) {
  const args = parseArgs(argv);
  if (args.command === 'help') {
    io.out(HELP_TEXT.trimEnd());
    return 0;
  }
  if (args.command === 'version') {
    const metadata = JSON.parse(await readFile(packageJsonUrl, 'utf8'));
    io.out(metadata.version);
    return 0;
  }
  if (args.command === 'create') {
    const result = await installProject({ ...args, root: args.directory });
    io.out([
      '✓ AI PM project initialized',
      `Root: ${result.root}`,
      `Installed agents: ${result.agents.join(', ')}`,
      `Mode: ${result.mode}`,
      ...result.warnings.map((warning) => `! ${warning}`),
      `Next: cd ${result.root}`,
    ].join('\n'));
    return 0;
  }

  const report = await diagnoseProject(args.directory);
  for (const item of report.checks) {
    const symbol = item.status === 'pass' ? '✓' : '✗';
    io.out(`${symbol} [${item.code}] ${item.path}: ${item.message}`);
    if (item.status !== 'pass' && item.suggestion) io.out(`  Suggestion: ${item.suggestion}`);
  }
  io.out(report.healthy ? `✓ ${report.root} is healthy` : `✗ ${report.root} has problems`);
  return report.healthy ? 0 : 1;
}
