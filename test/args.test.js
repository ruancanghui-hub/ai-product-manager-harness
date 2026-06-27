import test from 'node:test';
import assert from 'node:assert/strict';

import { parseArgs } from '../src/args.js';

test('create defaults to all agents and copy mode', () => {
  assert.deepEqual(parseArgs(['create', 'demo']), {
    command: 'create',
    directory: 'demo',
    agents: ['claude', 'codex', 'cursor'],
    link: false,
    force: false,
    git: true,
  });
});

test('create parses selected agents and flags', () => {
  assert.deepEqual(
    parseArgs(['create', '.', '--agents', 'codex,cursor', '--link', '--force', '--no-git']),
    {
      command: 'create',
      directory: '.',
      agents: ['codex', 'cursor'],
      link: true,
      force: true,
      git: false,
    },
  );
});

test('all expands and agent values are deduplicated', () => {
  assert.deepEqual(parseArgs(['create', 'demo', '--agents', 'all']).agents, [
    'claude', 'codex', 'cursor',
  ]);
  assert.deepEqual(parseArgs(['create', 'demo', '--agents', 'codex,cursor,codex']).agents, [
    'codex', 'cursor',
  ]);
});

test('doctor defaults to the current directory', () => {
  assert.deepEqual(parseArgs(['doctor']), { command: 'doctor', directory: '.' });
});

test('rejects unknown agents', () => {
  assert.throws(
    () => parseArgs(['create', 'demo', '--agents', 'windsurf']),
    /Unknown agent: windsurf/,
  );
});

test('rejects missing directories, option values, and unknown flags', () => {
  assert.throws(() => parseArgs(['create']), /requires a directory/);
  assert.throws(() => parseArgs(['create', 'demo', '--agents']), /requires a value/);
  assert.throws(() => parseArgs(['create', 'demo', '--wat']), /Unknown option: --wat/);
});

