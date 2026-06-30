/**
 * 智能推荐引擎
 *
 * 基于上下文和使用历史，推荐最佳方法和实践
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Learner } from './learner.js';

/**
 * 推荐引擎
 */
export class Recommender {
  constructor(options = {}) {
    this.learner = new Learner(options);
    this.recommendationsCache = null;
  }

  /**
   * 为特定场景推荐方法
   */
  async recommendForContext(context) {
    const analysis = await this.learner.analyze();
    const recommendations = [];

    // 如果有历史数据，基于数据推荐
    if (analysis.insights.length > 0) {
      // 找出高效方法
      const highPerf = analysis.insights.find(i => i.type === 'high-performing-methods');
      if (highPerf) {
        recommendations.push({
          source: 'historical-data',
          confidence: 'high',
          methods: highPerf.data.slice(0, 3).map(d => d.method),
          reason: `基于本项目 ${d.count} 次使用数据，平均得分 ${d.avgScore}`,
        });
      }

      // 找出最佳组合
      const bestCombos = analysis.insights.find(i => i.type === 'best-method-combinations');
      if (bestCombos && context.preferredSequence) {
        recommendations.push({
          source: 'proven-combinations',
          confidence: 'medium',
          sequences: bestCombos.data.slice(0, 2).map(d => d.combination),
          reason: '本项目中已验证的有效组合',
        });
      }
    }

    // 如果无历史数据，提供默认推荐
    if (recommendations.length === 0) {
      recommendations.push({
        source: 'default-recommendations',
        confidence: 'low',
        methods: this.getDefaultRecommendations(context),
        reason: '暂无本项目历史数据，使用行业最佳实践',
      });
    }

    return recommendations;
  }

  /**
   * 获取默认推荐（行业最佳实践）
   */
  getDefaultRecommendations(context) {
    const defaults = {
      'new-product': {
        methods: ['opportunity-solution-tree', 'user-personas', 'value-proposition', 'write-prd'],
        reason: '新产品启动的标准流程：先探索机会空间，再定义用户，明确价值，最后输出文档',
      },
      'feature-design': {
        methods: ['user-stories', 'test-scenarios', 'design-review'],
        reason: '功能设计的标准流程：从用户故事出发，设计测试场景，进行设计审核',
      },
      'quality-improvement': {
        methods: ['security-audit-static', 'performance-audit-static', 'intended-vs-implemented'],
        reason: '质量改进的标准流程：安全审计 → 性能审计 → 意图vs实现对比',
      },
      'growth-planning': {
        methods: ['north-star-metric', 'growth-loops', 'marketing-ideas'],
        reason: '增长规划的标准流程：定义北极星指标 → 设计增长闭环 → 生成营销创意',
      },
      'sprint-planning': {
        methods: ['sprint-plan', 'brainstorm-okrs', 'stakeholder-map'],
        reason: '迭代规划的标准流程：制定迭代计划 → 头脑风暴OKR → 利益相关者映射',
      },
    };

    const key = this.detectContextKey(context);
    return defaults[key] || {
      methods: ['write-prd'],
      reason: '通用推荐：从编写PRD开始',
    };
  }

  /**
   * 检测上下文类型
   */
  detectContextKey(context) {
    const keywords = {
      'new-product': ['新产品', '新项目', '从零开始', '立项', 'startup'],
      'feature-design': ['功能', '设计', 'feature', '交互', 'UI'],
      'quality-improvement': ['质量', '审计', '优化', 'quality', 'audit'],
      'growth-planning': ['增长', '运营', 'growth', '营销', '推广'],
      'sprint-planning': ['迭代', '规划', 'sprint', 'OKR', '排期'],
    };

    const contextStr = (context.description || '').toLowerCase();

    for (const [key, words] of Object.entries(keywords)) {
      if (words.some(word => contextStr.includes(word.toLowerCase()))) {
        return key;
      }
    }

    return 'new-product';
  }

  /**
   * 为特定 Skill 推荐下一步方法
   */
  async recommendNextMethod(currentSkill, currentMethod) {
    const analysis = await this.learner.analyze();

    // 查找包含当前方法的组合
    const bestCombos = analysis.insights.find(i => i.type === 'best-method-combinations');
    if (bestCombos) {
      const nextMethods = bestCombos.data
        .filter(d => d.combination.startsWith(`${currentMethod} →`))
        .map(d => ({
          method: d.combination.split(' → ')[1],
          avgScore: d.avgScore,
          count: d.count,
        }))
        .sort((a, b) => b.avgScore - a.avgScore);

      if (nextMethods.length > 0) {
        return {
          source: 'proven-sequences',
          confidence: 'high',
          recommendations: nextMethods.slice(0, 3),
          reason: '基于本项目中已验证的方法序列',
        };
      }
    }

    // 无历史数据，使用默认推荐
    const defaultNext = this.getDefaultNextMethod(currentSkill, currentMethod);
    return {
      source: 'default-flow',
      confidence: 'medium',
      recommendations: defaultNext,
      reason: '基于行业最佳实践的标准流程',
    };
  }

  /**
   * 获取默认的下一步方法
   */
  getDefaultNextMethod(skill, method) {
    const flows = {
      'pm-center': {
        'opportunity-solution-tree': ['user-personas', 'value-proposition'],
        'user-personas': ['value-proposition', 'write-prd'],
        'value-proposition': ['write-prd', 'north-star-metric'],
        'write-prd': ['user-stories', 'test-scenarios'],
        'interview-script': ['user-personas', 'identify-assumptions'],
      },
      'design-studio': {
        'design-consultation': ['design-review', 'design-shotgun'],
        'design-review': ['design-shotgun', 'design-consultation'],
      },
      'dev-factory': {
        'architecture-review': ['security-audit-static', 'performance-audit-static'],
        'security-audit-static': ['performance-audit-static', 'derive-tests'],
      },
      'ops-growth': {
        'north-star-metric': ['growth-loops', 'marketing-ideas'],
        'growth-loops': ['marketing-ideas', 'competitive-battlecard'],
      },
    };

    const skillFlows = flows[skill];
    if (skillFlows && skillFlows[method]) {
      return skillFlows[method].map(m => ({
        method: m,
        avgScore: null,
        isDefault: true,
      }));
    }

    return [];
  }

  /**
   * 生成推荐报告
   */
  async generateRecommendationReport(context) {
    const recommendations = await this.recommendForContext(context);

    const lines = [
      `# 智能推荐报告`,
      `生成时间：${new Date().toISOString()}`,
      `上下文：${context.description || '未指定'}`,
      ``,
    ];

    recommendations.forEach((rec, index) => {
      lines.push(`## 推荐 ${index + 1}: ${rec.source}`);
      lines.push(`置信度：${rec.confidence}`);
      lines.push(`原因：${rec.reason}`);
      lines.push(``);

      if (rec.methods) {
        lines.push(`**推荐方法：**`);
        rec.methods.forEach((method, i) => {
          lines.push(`${i + 1}. ${method}`);
        });
      } else if (rec.sequences) {
        lines.push(`**推荐序列：**`);
        rec.sequences.forEach((seq, i) => {
          lines.push(`${i + 1}. ${seq}`);
        });
      }
      lines.push(``);
    });

    return lines.join('\n');
  }
}

export default Recommender;
