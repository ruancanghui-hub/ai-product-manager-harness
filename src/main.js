/**
 * AI PM CLI 主入口
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, HELP_TEXT } from './args.js';
import { diagnoseProject } from './doctor.js';
import { installProject } from './install.js';
import { Router } from '../cli/lib/router.js';
import { Learner } from '../cli/lib/learner.js';
import { Recommender } from '../cli/lib/recommender.js';

const packageJsonUrl = new URL('../package.json', import.meta.url);

function defaultIo() {
  return {
    out: (message) => console.log(message),
    error: (message) => console.error(message),
  };
}

export async function main(argv, io = defaultIo()) {
  const args = parseArgs(argv);

  switch (args.command) {
    case 'help':
      io.out(HELP_TEXT.trimEnd());
      return 0;

    case 'version':
      const metadata = JSON.parse(await readFile(packageJsonUrl, 'utf8'));
      io.out(`AI PM v${metadata.version}`);
      return 0;

    case 'create':
      return await handleCreate(args, io);

    case 'doctor':
      return await handleDoctor(args, io);

    case 'evolve':
      return await handleEvolve(args, io);

    case 'learn':
      return await handleLearn(args, io);

    case 'recommend':
      return await handleRecommend(args, io);

    case 'list':
      return await handleList(args, io);

    case 'route':
      return await handleRoute(args, io);

    case 'execute':
      return await handleExecute(args, io);

    default:
      io.error(`Unknown command: ${args.command}`);
      io.out(HELP_TEXT);
      return 1;
  }
}

/**
 * 创建项目
 */
async function handleCreate(args, io) {
  try {
    const result = await installProject({
      root: args.directory,
      agents: args.agents,
      link: args.link,
      force: args.force,
    });

    io.out([
      '✓ AI PM project initialized',
      `Root: ${result.root}`,
      `Installed agents: ${result.agents.join(', ')}`,
      `Mode: ${result.mode}`,
      ...result.warnings.map((warning) => `! ${warning}`),
      '',
      'Next steps:',
      `  cd ${result.root}`,
      '  ai-pm list methods      # List all available methods',
      '  ai-pm recommend         # Get recommendations for your context',
    ].join('\n'));

    return 0;
  } catch (error) {
    io.error(`Failed to create project: ${error.message}`);
    return 1;
  }
}

/**
 * 健康检查
 */
async function handleDoctor(args, io) {
  const report = await diagnoseProject(args.directory);

  for (const item of report.checks) {
    const symbol = item.status === 'pass' ? '✓' : '✗';
    io.out(`${symbol} [${item.code}] ${item.path}: ${item.message}`);
    if (item.status !== 'pass' && item.suggestion) {
      io.out(`  Suggestion: ${item.suggestion}`);
    }
  }

  io.out('');
  io.out(report.healthy
    ? `✓ ${report.root} is healthy`
    : `✗ ${report.root} has problems`
  );

  return report.healthy ? 0 : 1;
}

/**
 * 触发进化
 */
async function handleEvolve(args, io) {
  const learner = new Learner();

  io.out('🔄 Analyzing usage patterns...');
  const analysis = await learner.analyze();

  if (analysis.insights.length === 0) {
    io.out('ℹ️  No usage data found. Start using AI PM to generate evolution insights.');
    return 0;
  }

  io.out('');
  io.out('📊 Evolution Insights:');
  io.out('');

  analysis.insights.forEach((insight, index) => {
    io.out(`${index + 1}. ${insight.title}`);
    io.out(`   ${insight.description}`);
    if (insight.data && insight.data.length > 0) {
      io.out(`   Top items: ${insight.data.slice(0, 3).map(d => d.method || d.combination).join(', ')}`);
    }
    io.out('');
  });

  if (args.save) {
    const saved = await learner.saveLearnings(analysis);
    io.out(`✓ Learnings saved to:`);
    io.out(`  - ${saved.learningsFile}`);
    io.out(`  - ${saved.recommendationsFile}`);
  }

  return 0;
}

/**
 * 查看学习结果
 */
async function handleLearn(args, io) {
  const learner = new Learner();

  if (args.trend) {
    io.out('📈 Learning Curve Analysis\n');

    const analysis = await learner.analyze();
    const trends = analysis.patterns?.qualityTrends;

    if (!trends || trends.overall.length === 0) {
      io.out('ℹ️  No quality trend data yet. Keep using AI PM to build your learning curve.');
      return 0;
    }

    io.out('Overall Score Trend:');
    const scores = trends.overall.slice(-10);
    const avgScore = scores.reduce((a, b) => a + b.score, 0) / scores.length;
    io.out(`  Average score (last 10): ${avgScore.toFixed(1)}/10`);
    io.out(`  Trend: ${scores[scores.length - 1].score > scores[0].score ? '↗️ Improving' : '↘️ Declining'}`);
    io.out('');

    return 0;
  }

  // 默认显示学习概览
  const analysis = await learner.analyze();

  io.out('📚 Learning Summary\n');
  io.out(`Methods analyzed: ${Object.keys(analysis.patterns?.methodUsage || {}).length}`);
  io.out(`Method combinations: ${Object.keys(analysis.patterns?.methodCombinations || {}).length}`);
  io.out(`Insights generated: ${analysis.insights.length}`);
  io.out(`Recommendations: ${analysis.recommendations.length}`);

  return 0;
}

/**
 * 智能推荐
 */
async function handleRecommend(args, io) {
  const recommender = new Recommender();

  io.out('🎯 Generating Recommendations...\n');

  const context = {
    description: args.context || 'new product development',
  };

  const recommendations = await recommender.recommendForContext(context);

  if (recommendations.length === 0) {
    io.out('ℹ️  No recommendations yet. Use AI PM more to generate personalized recommendations.');
    return 0;
  }

  recommendations.forEach((rec, index) => {
    io.out(`Recommendation ${index + 1}: ${rec.source}`);
    io.out(`Confidence: ${rec.confidence}`);
    io.out(`Reason: ${rec.reason}`);
    io.out('');

    if (rec.methods && Array.isArray(rec.methods)) {
      io.out('Recommended methods:');
      rec.methods.forEach((method, i) => {
        io.out(`  ${i + 1}. ${method}`);
      });
    } else if (rec.sequences && Array.isArray(rec.sequences)) {
      io.out('Recommended sequences:');
      rec.sequences.forEach((seq, i) => {
        io.out(`  ${i + 1}. ${seq}`);
      });
    }
    io.out('');
  });

  if (args.save) {
    const report = await recommender.generateRecommendationReport(context);
    io.out('📄 Full report saved to knowledge/recommendations/');
  }

  return 0;
}

/**
 * 列出可用资源
 */
async function handleList(args, io) {
  const router = new Router();

  if (args.type === 'methods') {
    io.out('📋 Available Methods\n');

    const methods = await router.listAllMethods();
    const categories = {
      strategy: 'Strategy Methods (战略类)',
      discovery: 'Discovery Methods (发现类)',
      execution: 'Execution Methods (执行类)',
      analytics: 'Analytics Methods (分析类)',
      shipping: 'Shipping Methods (交付类)',
    };

    for (const [category, title] of Object.entries(categories)) {
      if (methods[category] && methods[category].length > 0) {
        io.out(`${title}:`);
        methods[category].forEach(method => {
          io.out(`  - ${method}`);
        });
        io.out('');
      }
    }

    io.out(`Total: ${Object.values(methods).flat().length} methods`);
    return 0;
  }

  if (args.type === 'skills') {
    io.out('🎭 Available Skills\n');

    for (const [skill, config] of Object.entries(router.skillRoutes)) {
      io.out(`${skill}:`);
      io.out(`  Description: ${config.description}`);
      io.out(`  Keywords: ${config.keywords.slice(0, 5).join(', ')}`);
      io.out(`  Methods: ${config.methods.length}`);
      io.out('');
    }

    return 0;
  }

  if (args.type === 'commands') {
    io.out('⚡ Available Chain Commands\n');

    for (const [command, config] of Object.entries(router.chainCommands)) {
      io.out(`${command}:`);
      io.out(`  Description: ${config.description}`);
      io.out(`  Methods: ${config.methods.join(' → ')}`);
      io.out(`  Skill: ${config.skill}`);
      io.out('');
    }

    return 0;
  }

  io.out('Usage: ai-pm list <methods|skills|commands>');
  return 1;
}

/**
 * 智能路由测试
 */
async function handleRoute(args, io) {
  if (!args.input) {
    io.error('Please provide input text with --input');
    return 1;
  }

  const router = new Router();
  const result = router.routeToSkill(args.input);

  io.out('🔀 Routing Result\n');
  io.out(`Input: "${args.input}"`);
  io.out(`Type: ${result.type}`);
  io.out('');

  if (result.type === 'chain') {
    io.out(`Command: ${result.command}`);
    io.out(`Description: ${result.description}`);
    io.out(`Methods: ${result.methods.join(' → ')}`);
  } else if (result.type === 'skill') {
    io.out(`Skill: ${result.skill}`);
    io.out(`Description: ${result.description}`);
    io.out(`Matched keywords: ${result.keywords.join(', ')}`);
    io.out('');
    io.out('Recommended methods:');
    const recommendations = router.recommendMethods(result.skill);
    recommendations.forEach((rec, i) => {
      io.out(`  ${i + 1}. ${rec.method}${rec.isDefault ? ' (default)' : ` (score: ${rec.avgScore?.toFixed(1)})`}`);
    });
  } else {
    io.out(result.suggestion);
  }

  return 0;
}

/**
 * 执行方法论
 */
async function handleExecute(args, io) {
  if (!args.method) {
    io.error('Please specify a method with --method');
    return 1;
  }

  const router = new Router();
  const methodDetails = await router.getMethodDetails(args.method);

  if (!methodDetails) {
    io.error(`Method not found: ${args.method}`);
    io.out('Run "ai-pm list methods" to see available methods.');
    return 1;
  }

  io.out(`📖 ${args.method}\n`);
  io.out('---');
  io.out(methodDetails.content.split('## 使用步骤')[0]); // 只显示概述部分
  io.out('---');
  io.out('');
  io.out('This is the skill definition. In a real implementation,');
  io.out('this would be loaded into Claude Code/Codex/Cursor context.');
  io.out('');
  io.out('To use this method, describe your need in natural language');
  io.out('and the AI will apply the methodology automatically.');

  return 0;
}
