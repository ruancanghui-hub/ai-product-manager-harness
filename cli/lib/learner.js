/**
 * 知识学习引擎
 *
 * 从使用记录中提取模式，生成 learnings 和 recommendations
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_ROOT = path.resolve(__dirname, '../../knowledge');

/**
 * 学习引擎
 */
export class Learner {
  constructor(options = {}) {
    this.knowledgeRoot = options.knowledgeRoot || KNOWLEDGE_ROOT;
    this.observationsPath = path.join(this.knowledgeRoot, 'observations');
    this.learningsPath = path.join(this.knowledgeRoot, 'learnings');
    this.recommendationsPath = path.join(this.knowledgeRoot, 'recommendations');
  }

  /**
   * 分析使用记录，提取模式
   */
  async analyze() {
    const observations = await this.loadObservations();

    if (observations.length === 0) {
      return {
        patterns: [],
        insights: [],
        recommendations: [],
      };
    }

    // 分析方法使用频率
    const methodUsage = this.analyzeMethodUsage(observations);

    // 分析方法组合效果
    const methodCombinations = this.analyzeMethodCombinations(observations);

    // 分析质量得分趋势
    const qualityTrends = this.analyzeQualityTrends(observations);

    // 生成洞察
    const insights = this.generateInsights(methodUsage, methodCombinations, qualityTrends);

    // 生成推荐
    const recommendations = this.generateRecommendations(insights);

    return {
      patterns: {
        methodUsage,
        methodCombinations,
        qualityTrends,
      },
      insights,
      recommendations,
    };
  }

  /**
   * 加载所有 observations
   */
  async loadObservations() {
    const observations = [];
    try {
      const files = await readdir(this.observationsPath);
      for (const file of files) {
        if (file.endsWith('.jsonl')) {
          const content = await readFile(path.join(this.observationsPath, file), 'utf8');
          const lines = content.trim().split('\n');
          for (const line of lines) {
            try {
              observations.push(JSON.parse(line));
            } catch (e) {
              // 跳过解析错误的行
            }
          }
        }
      }
    } catch (error) {
      // 目录不存在或为空
    }
    return observations;
  }

  /**
   * 分析方法使用频率
   */
  analyzeMethodUsage(observations) {
    const usage = {};
    observations.forEach(obs => {
      if (obs.method) {
        if (!usage[obs.method]) {
          usage[obs.method] = { count: 0, scores: [], contexts: [] };
        }
        usage[obs.method].count += 1;
        if (obs.score) usage[obs.method].scores.push(obs.score);
        if (obs.context) usage[obs.method].contexts.push(obs.context);
      }
    });

    // 计算平均得分
    Object.keys(usage).forEach(method => {
      const scores = usage[method].scores;
      usage[method].avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;
    });

    return usage;
  }

  /**
   * 分析方法组合效果
   */
  analyzeMethodCombinations(observations) {
    const combinations = {};

    // 按会话分组
    const sessionGroups = {};
    observations.forEach(obs => {
      if (obs.sessionId && obs.method) {
        if (!sessionGroups[obs.sessionId]) {
          sessionGroups[obs.sessionId] = [];
        }
        sessionGroups[obs.sessionId].push(obs);
      }
    });

    // 提取方法序列
    Object.values(sessionGroups).forEach(sessionObs => {
      const methods = sessionObs.map(o => o.method).filter(Boolean);
      if (methods.length >= 2) {
        for (let i = 0; i < methods.length - 1; i++) {
          const combo = `${methods[i]} → ${methods[i + 1]}`;
          if (!combinations[combo]) {
            combinations[combo] = { count: 0, scores: [] };
          }
          combinations[combo].count += 1;
          // 使用第二个方法的得分作为组合效果
          const score = sessionObs.find(o => o.method === methods[i + 1])?.score;
          if (score) combinations[combo].scores.push(score);
        }
      }
    });

    // 计算平均得分
    Object.keys(combinations).forEach(combo => {
      const scores = combinations[combo].scores;
      combinations[combo].avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;
    });

    return combinations;
  }

  /**
   * 分析质量得分趋势
   */
  analyzeQualityTrends(observations) {
    const trends = {
      overall: [],
      bySkill: {},
      byMethod: {},
    };

    // 按时间排序
    const sorted = [...observations].sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    sorted.forEach(obs => {
      if (obs.score) {
        trends.overall.push({
          timestamp: obs.timestamp,
          score: obs.score,
        });

        if (obs.skill) {
          if (!trends.bySkill[obs.skill]) {
            trends.bySkill[obs.skill] = [];
          }
          trends.bySkill[obs.skill].push({
            timestamp: obs.timestamp,
            score: obs.score,
          });
        }

        if (obs.method) {
          if (!trends.byMethod[obs.method]) {
            trends.byMethod[obs.method] = [];
          }
          trends.byMethod[obs.method].push({
            timestamp: obs.timestamp,
            score: obs.score,
          });
        }
      }
    });

    return trends;
  }

  /**
   * 生成洞察
   */
  generateInsights(methodUsage, methodCombinations, qualityTrends) {
    const insights = [];

    // 找出高频高效方法
    const topMethods = Object.entries(methodUsage)
      .filter(([_, data]) => data.count >= 3 && data.avgScore && data.avgScore >= 8)
      .sort((a, b) => b[1].avgScore - a[1].avgScore)
      .slice(0, 5);

    if (topMethods.length > 0) {
      insights.push({
        type: 'high-performing-methods',
        title: '高效方法识别',
        description: `以下方法在本项目中表现优异（平均得分 ≥ 8，使用次数 ≥ 3）：`,
        data: topMethods.map(([method, data]) => ({
          method,
          avgScore: data.avgScore.toFixed(1),
          count: data.count,
        })),
      });
    }

    // 找出高频低效方法
    const lowMethods = Object.entries(methodUsage)
      .filter(([_, data]) => data.count >= 3 && data.avgScore && data.avgScore < 7)
      .sort((a, b) => a[1].avgScore - b[1].avgScore)
      .slice(0, 3);

    if (lowMethods.length > 0) {
      insights.push({
        type: 'low-performing-methods',
        title: '低效方法警示',
        description: `以下方法在本项目中表现不佳（平均得分 < 7），建议优化或替代：`,
        data: lowMethods.map(([method, data]) => ({
          method,
          avgScore: data.avgScore.toFixed(1),
          count: data.count,
          suggestion: '考虑更换方法或改进执行质量',
        })),
      });
    }

    // 找出最佳方法组合
    const topCombos = Object.entries(methodCombinations)
      .filter(([_, data]) => data.count >= 2 && data.avgScore && data.avgScore >= 8)
      .sort((a, b) => b[1].avgScore - a[1].avgScore)
      .slice(0, 5);

    if (topCombos.length > 0) {
      insights.push({
        type: 'best-method-combinations',
        title: '最佳方法组合',
        description: `以下方法组合在本项目中效果最佳：`,
        data: topCombos.map(([combo, data]) => ({
          combination: combo,
          avgScore: data.avgScore.toFixed(1),
          count: data.count,
        })),
      });
    }

    return insights;
  }

  /**
   * 生成推荐
   */
  generateRecommendations(insights) {
    const recommendations = [];

    // 基于高效方法生成推荐
    const highPerf = insights.find(i => i.type === 'high-performing-methods');
    if (highPerf) {
      recommendations.push({
        type: 'method-selection',
        priority: 'high',
        title: '优先使用高效方法',
        description: `在下次使用时，建议优先选择：${highPerf.data.map(d => d.method).join('、')}`,
        methods: highPerf.data.map(d => d.method),
      });
    }

    // 基于最佳组合生成推荐
    const bestCombos = insights.find(i => i.type === 'best-method-combinations');
    if (bestCombos) {
      recommendations.push({
        type: 'method-sequence',
        priority: 'medium',
        title: '推荐方法组合',
        description: '以下方法组合已被验证有效，建议在相同场景下复用',
        combinations: bestCombos.data.map(d => d.combination),
      });
    }

    // 基于低效方法生成改进建议
    const lowPerf = insights.find(i => i.type === 'low-performing-methods');
    if (lowPerf) {
      recommendations.push({
        type: 'method-improvement',
        priority: 'high',
        title: '需要改进的方法',
        description: '以下方法需要改进执行质量或考虑替代方案',
        methods: lowPerf.data.map(d => ({
          method: d.method,
          currentScore: d.avgScore,
          suggestion: d.suggestion,
        })),
      });
    }

    return recommendations;
  }

  /**
   * 保存学习结果
   */
  async saveLearnings(analysis) {
    await mkdir(this.learningsPath, { recursive: true });
    await mkdir(this.recommendationsPath, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];

    // 保存洞察
    const learningsFile = path.join(this.learningsPath, `learnings-${timestamp}.md`);
    const learningsContent = this.formatLearnings(analysis.insights);
    await writeFile(learningsFile, learningsContent, 'utf8');

    // 保存推荐
    const recommendationsFile = path.join(this.recommendationsPath, `recommendations-${timestamp}.json`);
    await writeFile(recommendationsFile, JSON.stringify(analysis.recommendations, null, 2), 'utf8');

    return {
      learningsFile,
      recommendationsFile,
    };
  }

  /**
   * 格式化学习结果为 Markdown
   */
  formatLearnings(insights) {
    const lines = [
      `# 项目学习洞察`,
      `生成时间：${new Date().toISOString()}`,
      ``,
    ];

    insights.forEach(insight => {
      lines.push(`## ${insight.title}`);
      lines.push(insight.description);
      lines.push(``);

      if (insight.data) {
        lines.push(`| 项目 | 数据 |`);
        lines.push(`|------|------|`);
        insight.data.forEach(item => {
          const row = Object.entries(item).map(([key, val]) => `${key}: ${val}`).join(' | ');
          lines.push(`| ${row} |`);
        });
        lines.push(``);
      }
    });

    return lines.join('\n');
  }
}

export default Learner;
