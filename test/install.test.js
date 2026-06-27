import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { installProject } from '../src/install.js';
import { SKILLS_ROOT } from '../src/content.js';

async function temporaryRoot() {
  return mkdtemp(path.join(os.tmpdir(), 'ai-pm-install-'));
}

test('copy mode installs all agents and nine skills per target', async () => {
  const root = await temporaryRoot();
  const result = await installProject({
    root,
    agents: ['claude', 'codex', 'cursor'],
    git: false,
  });
  assert.equal(result.mode, 'copy');
  assert.equal((await readdir(path.join(root, '.agents/skills'))).length, 9);
  assert.equal((await readdir(path.join(root, '.claude/skills'))).length, 9);
  assert.match(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), /大厂 APP 全链路角色系统/);
});

test('codex and cursor install only one shared skill tree', async () => {
  const root = await temporaryRoot();
  await installProject({ root, agents: ['codex', 'cursor'], git: false });
  assert.equal((await readdir(path.join(root, '.agents/skills'))).length, 9);
  await assert.rejects(readFile(path.join(root, 'CLAUDE.md')), /ENOENT/);
});

test('preserves unrelated files', async () => {
  const root = await temporaryRoot();
  await writeFile(path.join(root, 'notes.txt'), 'mine');
  await installProject({ root, agents: ['codex'], git: false });
  assert.equal(await readFile(path.join(root, 'notes.txt'), 'utf8'), 'mine');
});

test('reports every conflict before writing', async () => {
  const root = await temporaryRoot();
  await writeFile(path.join(root, 'AGENTS.md'), 'custom');
  await writeFile(path.join(root, 'PROJECT-PHASE.md'), 'custom phase');
  await assert.rejects(
    installProject({ root, agents: ['codex'], git: false }),
    (error) => {
      assert.deepEqual(error.conflicts, ['AGENTS.md', 'PROJECT-PHASE.md']);
      return true;
    },
  );
  await assert.rejects(readdir(path.join(root, '.agents')), /ENOENT/);
});

test('force replaces managed conflicts and keeps unrelated files', async () => {
  const root = await temporaryRoot();
  await writeFile(path.join(root, 'AGENTS.md'), 'custom');
  await writeFile(path.join(root, 'notes.txt'), 'mine');
  await installProject({ root, agents: ['codex'], force: true, git: false });
  assert.notEqual(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), 'custom');
  assert.equal(await readFile(path.join(root, 'notes.txt'), 'utf8'), 'mine');
});

test('generated text does not contain the package repository path', async () => {
  const root = await temporaryRoot();
  await installProject({ root, agents: ['claude', 'codex'], git: false });
  for (const name of ['AGENTS.md', 'CLAUDE.md', 'PROJECT-PHASE.md', '.claude/settings.json']) {
    assert.doesNotMatch(await readFile(path.join(root, name), 'utf8'), new RegExp(process.cwd()));
  }
});

test('link mode points both platform directories to canonical skills', async () => {
  const root = await temporaryRoot();
  const result = await installProject({
    root,
    agents: ['claude', 'cursor'],
    link: true,
    git: false,
  });
  assert.equal(result.mode, 'link');
  assert.equal(await readFile(path.join(root, '.agents/skills/app-workflow/SKILL.md'), 'utf8'),
    await readFile(path.join(SKILLS_ROOT, 'app-workflow/SKILL.md'), 'utf8'));
  assert.equal(await readFile(path.join(root, '.claude/skills/app-workflow/SKILL.md'), 'utf8'),
    await readFile(path.join(SKILLS_ROOT, 'app-workflow/SKILL.md'), 'utf8'));
});

test('a broken existing skill link is a conflict', async () => {
  const root = await temporaryRoot();
  await mkdir(path.join(root, '.agents'), { recursive: true });
  await symlink(path.join(root, 'missing'), path.join(root, '.agents/skills'));
  await assert.rejects(
    installProject({ root, agents: ['codex'], link: true, git: false }),
    (error) => error.conflicts?.includes('.agents/skills'),
  );
});

test('git initialization is optional', async () => {
  const withoutGit = await temporaryRoot();
  await installProject({ root: withoutGit, agents: ['codex'], git: false });
  await assert.rejects(access(path.join(withoutGit, '.git')), /ENOENT/);

  const withGit = await temporaryRoot();
  await installProject({ root: withGit, agents: ['codex'], git: true });
  await access(path.join(withGit, '.git'));
});

test('missing git produces a warning without rolling back the project', async () => {
  const root = await temporaryRoot();
  const result = await installProject({
    root,
    agents: ['codex'],
    git: true,
    gitCommand: 'definitely-not-a-git-executable',
  });
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /Git initialization skipped/);
  await access(path.join(root, '.agents/skills'));
});
