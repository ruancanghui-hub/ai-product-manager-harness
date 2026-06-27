import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { diagnoseProject } from '../src/doctor.js';
import { installProject } from '../src/install.js';

async function fixture(agents = ['claude', 'codex', 'cursor']) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ai-pm-doctor-'));
  await installProject({ root, agents, git: false });
  return root;
}

test('reports a generated all-agent project as healthy', async () => {
  const report = await diagnoseProject(await fixture());
  assert.equal(report.healthy, true);
  assert.equal(report.checks.every((check) => check.status === 'pass'), true);
});

test('detects a missing canonical skill', async () => {
  const root = await fixture(['codex']);
  await rm(path.join(root, '.agents/skills/qa-gate/SKILL.md'));
  const report = await diagnoseProject(root);
  assert.equal(report.healthy, false);
  assert.equal(report.checks.some((check) => check.code === 'skill-missing' && check.path.includes('qa-gate')), true);
});

test('detects copied skill drift', async () => {
  const root = await fixture(['codex']);
  await writeFile(path.join(root, '.agents/skills/pm-center/SKILL.md'), 'changed');
  const report = await diagnoseProject(root);
  assert.equal(report.checks.some((check) => check.code === 'skill-drift'), true);
});

test('detects a broken skill link', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ai-pm-doctor-link-'));
  await mkdir(path.join(root, '.agents'), { recursive: true });
  await symlink(path.join(root, 'missing-skills'), path.join(root, '.agents/skills'));
  await writeFile(path.join(root, 'AGENTS.md'), 'AI PM');
  const report = await diagnoseProject(root);
  assert.equal(report.checks.some((check) => check.code === 'skill-link-broken'), true);
});

test('detects absolute paths in managed configuration', async () => {
  const root = await fixture(['claude']);
  await writeFile(path.join(root, '.claude/settings.json'), '{"command":"/Users/example/tool"}');
  const report = await diagnoseProject(root);
  assert.equal(report.checks.some((check) => check.code === 'absolute-path'), true);
});

test('check records expose actionable fields', async () => {
  const report = await diagnoseProject(await fixture(['cursor']));
  for (const check of report.checks) {
    assert.deepEqual(Object.keys(check), ['code', 'status', 'path', 'message', 'suggestion']);
  }
});

