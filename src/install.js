import { cp, lstat, mkdir, mkdtemp, readFile, readlink, rename, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { PACKAGE_ROOT, SKILLS_ROOT, TEMPLATES_ROOT } from './content.js';
import { createInstallPlan } from './plan.js';

export class InstallConflictError extends Error {
  constructor(conflicts) {
    super(`Conflicting AI PM files:\n${conflicts.map((item) => `- ${item}`).join('\n')}`);
    this.name = 'InstallConflictError';
    this.conflicts = conflicts;
  }
}

async function pathInfo(file) {
  try {
    return await lstat(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function digest(file) {
  const info = await lstat(file);
  if (info.isSymbolicLink()) return `link:${await readlink(file)}`;
  if (info.isFile()) {
    return `file:${createHash('sha256').update(await readFile(file)).digest('hex')}`;
  }
  if (info.isDirectory()) {
    const { readdir } = await import('node:fs/promises');
    const names = (await readdir(file)).sort();
    const parts = [];
    for (const name of names) parts.push(`${name}:${await digest(path.join(file, name))}`);
    return `dir:${createHash('sha256').update(parts.join('|')).digest('hex')}`;
  }
  return `other:${info.mode}`;
}

function sourceFor(item) {
  if (item.sourcePath === 'skills') return SKILLS_ROOT;
  return path.join(TEMPLATES_ROOT, item.sourcePath);
}

async function sameAsDesired(item, link) {
  const info = await pathInfo(item.path);
  if (!info) return false;
  const source = sourceFor(item);
  if (link && item.sourcePath === 'skills') {
    if (!info.isSymbolicLink()) return false;
    try {
      return path.resolve(path.dirname(item.path), await readlink(item.path)) === source;
    } catch {
      return false;
    }
  }
  if (info.isSymbolicLink()) return false;
  return await digest(item.path) === await digest(source);
}

async function writeItem(item, link) {
  await mkdir(path.dirname(item.path), { recursive: true });
  const source = sourceFor(item);
  if (link && item.sourcePath === 'skills') {
    try {
      await symlink(source, item.path, process.platform === 'win32' ? 'junction' : 'dir');
    } catch (error) {
      throw new Error(`Could not create skill link at ${item.relativePath}: ${error.message}. Retry without --link.`);
    }
  } else {
    await cp(source, item.path, { recursive: true, preserveTimestamps: false });
  }
}

export async function installProject({
  root,
  agents,
  link = false,
  force = false,
  git = true,
}) {
  const plan = createInstallPlan(root, agents);
  const items = [...plan.skillTargets, ...plan.templates];
  const existing = [];
  const conflicts = [];

  for (const item of items) {
    if (await pathInfo(item.path)) {
      existing.push(item);
      if (!(await sameAsDesired(item, link))) conflicts.push(item.relativePath);
    }
  }
  if (conflicts.length > 0 && !force) throw new InstallConflictError(conflicts);

  await mkdir(plan.root, { recursive: true });
  const backupRoot = await mkdtemp(path.join(os.tmpdir(), 'ai-pm-backup-'));
  const backups = [];
  const created = [];

  try {
    for (const item of items) {
      const info = await pathInfo(item.path);
      if (info && await sameAsDesired(item, link)) continue;
      if (info) {
        const backup = path.join(backupRoot, String(backups.length));
        await rename(item.path, backup);
        backups.push({ item, backup });
      }
      await writeItem(item, link);
      created.push(item.relativePath);
    }
  } catch (error) {
    for (const item of [...items].reverse()) {
      if (created.includes(item.relativePath)) await rm(item.path, { recursive: true, force: true });
    }
    for (const { item, backup } of backups.reverse()) {
      await mkdir(path.dirname(item.path), { recursive: true });
      await rename(backup, item.path);
    }
    throw error;
  } finally {
    await rm(backupRoot, { recursive: true, force: true });
  }

  return {
    root: plan.root,
    agents: [...agents],
    mode: link ? 'link' : 'copy',
    created,
    warnings: git ? [] : [],
    packageRoot: PACKAGE_ROOT,
  };
}

