import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { PACKAGE_ROOT, SKILLS_ROOT, SKILL_NAMES, TEMPLATES_ROOT } from '../src/content.js';

test('exports stable package asset locations', () => {
  assert.equal(path.basename(PACKAGE_ROOT), 'package');
  assert.equal(path.dirname(SKILLS_ROOT), PACKAGE_ROOT);
  assert.equal(path.dirname(TEMPLATES_ROOT), PACKAGE_ROOT);
});

test('contains exactly nine canonical skills with matching frontmatter', async () => {
  assert.deepEqual(SKILL_NAMES, [
    'app-workflow',
    'chief-orchestrator',
    'design-studio',
    'dev-factory',
    'evolution-engine',
    'mgmt-office',
    'ops-growth',
    'pm-center',
    'qa-gate',
  ]);
  for (const name of SKILL_NAMES) {
    const content = await readFile(path.join(SKILLS_ROOT, name, 'SKILL.md'), 'utf8');
    assert.match(content, new RegExp(`^---\\nname: ${name}\\n`, 'm'));
    assert.doesNotMatch(content, /^allowed-tools:/m);
  }
});

test('canonical content is platform-neutral and templates are portable', async () => {
  const files = [
    ...SKILL_NAMES.map((name) => path.join(SKILLS_ROOT, name, 'SKILL.md')),
    path.join(TEMPLATES_ROOT, 'AGENTS.md'),
    path.join(TEMPLATES_ROOT, 'CLAUDE.md'),
    path.join(TEMPLATES_ROOT, 'PROJECT-PHASE.md'),
    path.join(TEMPLATES_ROOT, 'claude/settings.json'),
  ];
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(content, /\.Codex|\/Users\/orico|CLAUDE_PROJECT_DIR/);
  }
  assert.doesNotMatch(await readFile(path.join(TEMPLATES_ROOT, 'AGENTS.md'), 'utf8'), /\.claude\/skills/);
  assert.doesNotMatch(await readFile(path.join(TEMPLATES_ROOT, 'CLAUDE.md'), 'utf8'), /\.agents\/skills/);
});

test('Claude hooks are executable Node programs', async () => {
  for (const name of ['dispatch-hint.js', 'quality-gate-reminder.js', 'session-phase-check.js']) {
    const file = path.join(TEMPLATES_ROOT, 'claude/hooks', name);
    const content = await readFile(file, 'utf8');
    assert.match(content, /^#!\/usr\/bin\/env node/);
    assert.equal((await stat(file)).isFile(), true);
  }
});

