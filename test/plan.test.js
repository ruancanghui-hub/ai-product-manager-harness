import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstallPlan } from '../src/plan.js';

test('codex and cursor share one open-standard skill target', () => {
  const plan = createInstallPlan('/tmp/demo', ['codex', 'cursor']);
  assert.deepEqual(plan.skillTargets.map((item) => item.relativePath), ['.agents/skills']);
  assert.deepEqual(plan.templates.map((item) => item.relativePath), [
    'AGENTS.md',
    'PROJECT-PHASE.md',
    '.ai-pm/SCORING-RUBRIC.md',
  ]);
});

test('all agents include Claude native files without duplicate shared targets', () => {
  const plan = createInstallPlan('/tmp/demo', ['claude', 'codex', 'cursor']);
  assert.deepEqual(plan.skillTargets.map((item) => item.relativePath), [
    '.agents/skills',
    '.claude/skills',
  ]);
  assert.deepEqual(plan.templates.map((item) => item.relativePath), [
    'AGENTS.md',
    'CLAUDE.md',
    'PROJECT-PHASE.md',
    '.ai-pm/SCORING-RUBRIC.md',
    '.claude/settings.json',
    '.claude/hooks/dispatch-hint.js',
    '.claude/hooks/quality-gate-reminder.js',
    '.claude/hooks/session-phase-check.js',
  ]);
});

test('Claude-only plan does not create an open-standard skill target', () => {
  const plan = createInstallPlan('/tmp/demo', ['claude']);
  assert.deepEqual(plan.skillTargets.map((item) => item.relativePath), ['.claude/skills']);
  assert.equal(plan.templates.some((item) => item.relativePath === 'AGENTS.md'), false);
});

