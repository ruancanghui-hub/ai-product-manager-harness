#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseFile = path.join(root, 'PROJECT-PHASE.md');
const output = { hookName: 'session-phase-check', decision: 'continue' };

if (existsSync(phaseFile)) {
  const firstLine = readFileSync(phaseFile, 'utf8').split(/\r?\n/, 1)[0];
  output.systemMessage = `当前项目阶段：${firstLine}\n请先读取 PROJECT-PHASE.md，再从当前阶段继续。`;
} else {
  output.systemMessage = '项目尚未初始化阶段状态。需要完整流程时调用 app-workflow。';
}

process.stdout.write(JSON.stringify(output));
