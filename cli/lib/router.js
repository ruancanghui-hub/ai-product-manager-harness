/**
 * 智能路由引擎
 *
 * 双层路由机制：
 * 1. 隐式路由：关键词 → 角色 Skill
 * 2. 显式路由：斜杠命令 → 方法论技能链
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const METHODS_ROOT = path.resolve(__dirname, '../../methods');

/**
 * 角色 Skill 路由规则
 */
export const SKILL_ROUTES = {
  'pm-center': {
    keywords: ['PRD', '需求', '产品', '用研', '数据', '埋点', '商业化', '海外', '用户画像', '产品定义'],
    methods: ['opportunity-solution-tree', 'user-personas', 'value-proposition', 'write-prd', 'interview-script', 'north-star-metric'],
    description: '产品中心——6个产品角色的集体工作输出',
  },
  'design-studio': {
    keywords: ['设计', '交互', 'UI', '视觉', '动效', '品牌', '多端适配', '设计系统', 'Figma'],
    methods: ['design-review', 'design-shotgun', 'design-consultation'],
    description: '设计团队——5个设计角色的集体工作输出',
  },
  'dev-factory': {
    keywords: ['开发', '编码', '架构', 'iOS', 'Android', '后端', 'DevOps', '打包', '算法', '安全', '音视频'],
    methods: ['architecture-review', 'security-audit-static', 'performance-audit-static'],
    description: '研发团队——15个技术角色的集体工作输出',
  },
  'qa-gate': {
    keywords: ['测试', '质量', '兼容', '性能', '安全测试', '合规', '提测', '回归'],
    methods: ['test-scenarios', 'security-audit-static'],
    description: '测试团队——6个测试角色的集体工作输出',
  },
  'ops-growth': {
    keywords: ['运营', '增长', '投放', '商业化', '法务', '审核', '客服', 'ASO'],
    methods: ['north-star-metric', 'growth-loops', 'competitive-battlecard', 'marketing-ideas'],
    description: '运营与商业化——7个角色的集体工作输出',
  },
  'mgmt-office': {
    keywords: ['管理', '排期', '资源', '战略', 'OKR', '团队', '决策'],
    methods: ['brainstorm-okrs', 'stakeholder-map', 'pre-mortem', 'sprint-plan'],
    description: '管理中枢——3个管理角色的集体工作输出',
  },
  'chief-orchestrator': {
    keywords: ['调度', '协调', '依赖', '风险', '版本', '全链路', '瓶颈', '质量门'],
    methods: ['stakeholder-map', 'sprint-plan'],
    description: '总调度——全链路协调',
  },
  'app-workflow': {
    keywords: ['全流程', '从零开始', '立项', '完整开发', '发布上线', '新项目'],
    methods: [], // app-workflow 是编排层，不直接调用方法
    description: '全链路流水线——端到端项目推进',
  },
  'evolution-engine': {
    keywords: ['打分', '评分', '进化', '改进', '不及格', '自优化', '审计'],
    methods: ['derive-tests', 'intended-vs-implemented'],
    description: '自进化引擎——质量反馈→Skill改进闭环',
  },
};

/**
 * 链式命令定义
 */
export const CHAIN_COMMANDS = {
  '/strategize': {
    name: 'strategize',
    description: '战略规划全流程',
    methods: ['business-model-canvas', 'swot-analysis', 'value-proposition', 'product-strategy'],
    skill: 'pm-center',
  },
  '/discover': {
    name: 'discover',
    description: '产品发现全流程',
    methods: ['brainstorm-ideas', 'identify-assumptions', 'prioritize-assumptions', 'interview-script', 'brainstorm-experiments'],
    skill: 'pm-center',
  },
  '/ship': {
    name: 'ship',
    description: '交付发布全流程',
    methods: ['write-prd', 'user-stories', 'test-scenarios', 'shipping-artifacts'],
    skill: 'pm-center',
  },
  '/audit': {
    name: 'audit',
    description: '质量审计全流程',
    methods: ['security-audit-static', 'performance-audit-static', 'intended-vs-implemented'],
    skill: 'evolution-engine',
  },
  '/plan': {
    name: 'plan',
    description: '迭代规划全流程',
    methods: ['sprint-plan', 'brainstorm-okrs', 'stakeholder-map'],
    skill: 'mgmt-office',
  },
  '/grow': {
    name: 'grow',
    description: '增长规划全流程',
    methods: ['north-star-metric', 'growth-loops', 'marketing-ideas'],
    skill: 'ops-growth',
  },
};

/**
 * 智能路由器
 */
export class Router {
  constructor(options = {}) {
    this.skillRoutes = SKILL_ROUTES;
    this.chainCommands = CHAIN_COMMANDS;
    this.useHistory = options.useHistory || []; // 使用历史，用于推荐
  }

  /**
   * 根据用户输入判断应该调用哪个 Skill
   */
  routeToSkill(input) {
    const inputLower = input.toLowerCase();

    // 检查是否匹配链式命令
    for (const [command, config] of Object.entries(this.chainCommands)) {
      if (inputLower.includes(command.slice(1))) {
        return {
          type: 'chain',
          command,
          skill: config.skill,
          methods: config.methods,
          description: config.description,
        };
      }
    }

    // 检查关键词匹配
    const matches = [];
    for (const [skill, config] of Object.entries(this.skillRoutes)) {
      const matchCount = config.keywords.filter(kw =>
        inputLower.includes(kw.toLowerCase())
      ).length;
      if (matchCount > 0) {
        matches.push({ skill, matchCount, config });
      }
    }

    if (matches.length === 0) {
      return {
        type: 'unknown',
        suggestion: '无法确定需要哪个角色的协助。请描述您的具体需求，例如："帮我写个PRD"、"设计这个页面"、"开始开发"等。',
      };
    }

    // 返回匹配度最高的
    matches.sort((a, b) => b.matchCount - a.matchCount);
    const best = matches[0];

    return {
      type: 'skill',
      skill: best.skill,
      keywords: best.config.keywords.filter(kw => inputLower.includes(kw.toLowerCase())),
      methods: best.config.methods,
      description: best.config.description,
    };
  }

  /**
   * 根据上下文推荐最佳方法组合
   */
  recommendMethods(skill, context = {}) {
    const config = this.skillRoutes[skill];
    if (!config || config.methods.length === 0) {
      return [];
    }

    // 如果有使用历史，基于历史推荐
    if (this.useHistory.length > 0) {
      const skillHistory = this.useHistory.filter(h => h.skill === skill);
      if (skillHistory.length > 0) {
        // 找出得分最高的方法组合
        const methodScores = {};
        skillHistory.forEach(h => {
          h.methods.forEach(m => {
            if (!methodScores[m]) methodScores[m] = { total: 0, count: 0 };
            methodScores[m].total += h.score || 7;
            methodScores[m].count += 1;
          });
        });

        const recommendations = Object.entries(methodScores)
          .map(([method, data]) => ({
            method,
            avgScore: data.total / data.count,
            usageCount: data.count,
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 3);

        return recommendations;
      }
    }

    // 无历史，返回默认推荐
    return config.methods.slice(0, 3).map(method => ({
      method,
      avgScore: null,
      usageCount: 0,
      isDefault: true,
    }));
  }

  /**
   * 获取方法详情
   */
  async getMethodDetails(methodName) {
    const methodPath = this.findMethodPath(methodName);
    if (!methodPath) {
      return null;
    }

    try {
      const content = await readFile(methodPath, 'utf8');
      return {
        name: methodName,
        path: methodPath,
        content,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 查找方法文件路径
   */
  findMethodPath(methodName) {
    const categories = ['strategy', 'discovery', 'execution', 'analytics', 'shipping'];
    for (const category of categories) {
      const possiblePath = path.join(METHODS_ROOT, category, methodName, 'SKILL.md');
      // 同步检查文件是否存在会在后续调用中处理
      return possiblePath;
    }
    return null;
  }

  /**
   * 列出所有可用方法
   */
  async listAllMethods() {
    const methods = {};
    const categories = ['strategy', 'discovery', 'execution', 'analytics', 'shipping'];

    for (const category of categories) {
      const categoryPath = path.join(METHODS_ROOT, category);
      try {
        const entries = await readdir(categoryPath, { withFileTypes: true });
        methods[category] = entries
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name);
      } catch (error) {
        methods[category] = [];
      }
    }

    return methods;
  }
}

export default Router;
