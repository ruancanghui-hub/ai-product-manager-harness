import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const binary = path.resolve('bin/ai-pm.js');

function run(args) {
  return spawnSync(process.execPath, [binary, ...args], { encoding: 'utf8' });
}

test('--help prints approved usage', () => {
  const result = run(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /ai-pm create my-app --agents claude,codex,cursor/);
});

test('--version prints package version', () => {
  const result = run(['--version']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), '0.1.0');
});

test('invalid agents fail without creating the target', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'ai-pm-cli-invalid-'));
  const target = path.join(parent, 'demo');
  const result = run(['create', target, '--agents', 'windsurf']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown agent: windsurf/);
  await assert.rejects(rm(target), /ENOENT/);
});

test('create and doctor provide useful output and exit codes', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'ai-pm-cli-create-'));
  const target = path.join(parent, 'demo');
  const created = run(['create', target, '--agents', 'claude,codex,cursor', '--no-git']);
  assert.equal(created.status, 0, created.stderr);
  assert.match(created.stdout, /Installed agents: claude, codex, cursor/);
  assert.match(created.stdout, /Mode: copy/);
  assert.match(created.stdout, /Next: cd/);

  const healthy = run(['doctor', target]);
  assert.equal(healthy.status, 0, healthy.stderr);
  assert.match(healthy.stdout, /healthy/);

  await rm(path.join(target, '.agents/skills/qa-gate/SKILL.md'));
  const damaged = run(['doctor', target]);
  assert.notEqual(damaged.status, 0);
  assert.match(damaged.stdout, /skill-missing/);
});

