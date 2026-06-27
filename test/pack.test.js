import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  assert.equal(result.status, 0, [result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result;
}

function packageManager() {
  for (const command of ['npm', 'pnpm']) {
    const result = spawnSync(command, ['--version'], { encoding: 'utf8' });
    if (result.status === 0) return command;
  }
  throw new Error('npm or pnpm is required for the packed-artifact test');
}

test('packed package installs and creates healthy copy and link projects', async () => {
  const manager = packageManager();
  const temp = await mkdtemp(path.join(os.tmpdir(), 'ai-pm-pack-'));
  const pack = run(manager, ['pack', '--pack-destination', temp], { cwd: process.cwd() });
  const tarballName = (await readdir(temp)).find((name) => name.endsWith('.tgz'));
  assert.ok(tarballName, pack.stdout);
  const tarball = path.join(temp, tarballName);
  const manifest = run('tar', ['-tzf', tarball]).stdout;
  assert.match(manifest, /package\/README\.md/);
  assert.match(manifest, /package\/package\/skills\/app-workflow\/SKILL\.md/);
  const prefix = path.join(temp, 'consumer');
  await mkdir(prefix);

  const installArgs = manager === 'npm'
    ? ['install', '--prefix', prefix, tarball]
    : ['add', '--dir', prefix, tarball];
  run(manager, installArgs);

  const cli = path.join(prefix, 'node_modules', 'ai-pm', 'bin', 'ai-pm.js');
  const copyProject = path.join(temp, 'copy-project');
  const linkProject = path.join(temp, 'link-project');
  run(process.execPath, [cli, 'create', copyProject, '--agents', 'all', '--no-git']);
  run(process.execPath, [cli, 'doctor', copyProject]);
  run(process.execPath, [cli, 'create', linkProject, '--agents', 'all', '--link', '--no-git']);
  run(process.execPath, [cli, 'doctor', linkProject]);
});
