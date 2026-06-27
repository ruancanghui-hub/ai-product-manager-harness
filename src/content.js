import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = path.dirname(fileURLToPath(import.meta.url));

export const PACKAGE_ROOT = path.resolve(SOURCE_ROOT, '../package');
export const SKILLS_ROOT = path.join(PACKAGE_ROOT, 'skills');
export const TEMPLATES_ROOT = path.join(PACKAGE_ROOT, 'templates');
export const SKILL_NAMES = Object.freeze([
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
