import path from 'node:path';

const SHARED_TEMPLATES = [
  ['PROJECT-PHASE.md', 'PROJECT-PHASE.md'],
  ['.ai-pm/SCORING-RUBRIC.md', 'claude/SCORING-RUBRIC.md'],
];

const CLAUDE_TEMPLATES = [
  ['CLAUDE.md', 'CLAUDE.md'],
  ['.claude/settings.json', 'claude/settings.json'],
  ['.claude/hooks/dispatch-hint.js', 'claude/hooks/dispatch-hint.js'],
  ['.claude/hooks/quality-gate-reminder.js', 'claude/hooks/quality-gate-reminder.js'],
  ['.claude/hooks/session-phase-check.js', 'claude/hooks/session-phase-check.js'],
];

function target(root, relativePath, sourcePath = null) {
  return {
    relativePath,
    path: path.resolve(root, relativePath),
    sourcePath,
    managed: true,
  };
}

export function createInstallPlan(root, agents) {
  const absoluteRoot = path.resolve(root);
  const hasClaude = agents.includes('claude');
  const hasOpenStandard = agents.includes('codex') || agents.includes('cursor');
  const skillTargets = [];
  const templates = [];

  if (hasOpenStandard) skillTargets.push(target(absoluteRoot, '.agents/skills', 'skills'));
  if (hasClaude) skillTargets.push(target(absoluteRoot, '.claude/skills', 'skills'));
  if (hasOpenStandard) templates.push(target(absoluteRoot, 'AGENTS.md', 'AGENTS.md'));
  if (hasClaude) templates.push(target(absoluteRoot, 'CLAUDE.md', 'CLAUDE.md'));
  for (const [relativePath, sourcePath] of SHARED_TEMPLATES) {
    templates.push(target(absoluteRoot, relativePath, sourcePath));
  }
  if (hasClaude) {
    for (const [relativePath, sourcePath] of CLAUDE_TEMPLATES.slice(1)) {
      templates.push(target(absoluteRoot, relativePath, sourcePath));
    }
  }

  return { root: absoluteRoot, agents: [...agents], skillTargets, templates };
}

