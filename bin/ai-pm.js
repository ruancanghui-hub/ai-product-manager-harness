#!/usr/bin/env node

/**
 * AI PM CLI - 自进化的AI产品管理脚手架
 */

import { main } from '../src/main.js';

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
