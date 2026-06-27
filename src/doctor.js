import { lstat, readFile, realpath, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { SKILL_NAMES, SKILLS_ROOT } from './content.js';

async function info(file) {
  try {
    return await lstat(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function hash(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function check(code, status, filePath, message, suggestion = '') {
  return { code, status, path: filePath, message, suggestion };
}

async function checkSkillTarget(root, relativeTarget, checks) {
  const target = path.join(root, relativeTarget);
  const targetInfo = await info(target);
  if (!targetInfo) {
    checks.push(check('skill-target-missing', 'fail', relativeTarget,
      `Skill directory ${relativeTarget} is missing.`, 'Run ai-pm create . --force.'));
    return;
  }

  if (targetInfo.isSymbolicLink()) {
    try {
      await realpath(target);
      checks.push(check('skill-link-valid', 'pass', relativeTarget, 'Skill link resolves.', ''));
    } catch {
      checks.push(check('skill-link-broken', 'fail', relativeTarget,
        `Skill link ${relativeTarget} is broken.`, 'Reinstall without --link or restore the package location.'));
      return;
    }
  }

  for (const name of SKILL_NAMES) {
    const relativeFile = path.join(relativeTarget, name, 'SKILL.md');
    const actualFile = path.join(root, relativeFile);
    const canonicalFile = path.join(SKILLS_ROOT, name, 'SKILL.md');
    if (!(await info(actualFile))) {
      checks.push(check('skill-missing', 'fail', relativeFile,
        `${name}/SKILL.md is missing.`, 'Run ai-pm create . --force.'));
      continue;
    }
    const [actual, canonical] = await Promise.all([readFile(actualFile), readFile(canonicalFile)]);
    if (hash(actual) !== hash(canonical)) {
      checks.push(check('skill-drift', 'fail', relativeFile,
        `${name} differs from the installed AI PM package.`, 'Back up local edits, then run ai-pm create . --force.'));
    } else {
      checks.push(check('skill-valid', 'pass', relativeFile, `${name} is valid.`, ''));
    }
  }
}

async function collectFiles(root, relativePath) {
  const absolute = path.join(root, relativePath);
  const targetInfo = await info(absolute);
  if (!targetInfo || targetInfo.isSymbolicLink()) return [];
  if (targetInfo.isFile()) return [relativePath];
  if (!targetInfo.isDirectory()) return [];
  const files = [];
  for (const entry of await readdir(absolute)) {
    files.push(...await collectFiles(root, path.join(relativePath, entry)));
  }
  return files;
}

async function checkAbsolutePaths(root, checks) {
  const roots = ['AGENTS.md', 'CLAUDE.md', 'PROJECT-PHASE.md', '.ai-pm', '.claude/settings.json', '.claude/hooks'];
  const files = [];
  for (const entry of roots) files.push(...await collectFiles(root, entry));
  const pattern = /(?:\/Users\/[^/\s]+\/|\/home\/[^/\s]+\/|[A-Za-z]:\\Users\\[^\\\s]+\\)/;
  for (const relativeFile of files) {
    const content = await readFile(path.join(root, relativeFile), 'utf8');
    if (pattern.test(content)) {
      checks.push(check('absolute-path', 'fail', relativeFile,
        'Managed configuration contains a machine-specific absolute path.',
        'Replace it with a project-relative command or reinstall with --force.'));
    } else {
      checks.push(check('portable-paths', 'pass', relativeFile, 'No machine-specific path found.', ''));
    }
  }
}

export async function diagnoseProject(directory) {
  const root = path.resolve(directory);
  const checks = [];
  const targets = [];

  if (await info(path.join(root, '.agents/skills'))) targets.push('.agents/skills');
  if (await info(path.join(root, '.claude/skills'))) targets.push('.claude/skills');
  if (targets.length === 0) {
    checks.push(check('installation-missing', 'fail', '.', 'No AI PM skill installation found.',
      'Run ai-pm create . --agents all.'));
  }
  for (const target of targets) await checkSkillTarget(root, target, checks);
  await checkAbsolutePaths(root, checks);

  return {
    root,
    healthy: checks.length > 0 && checks.every((item) => item.status === 'pass'),
    checks,
  };
}

