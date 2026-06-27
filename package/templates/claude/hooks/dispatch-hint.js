#!/usr/bin/env node

const routes = [
  ['app-workflow', ['全流程', '从零开始', '完整开发', '立项', '新项目']],
  ['chief-orchestrator', ['调度', '协调', '瓶颈', '质量门', '延期', '卡住了']],
  ['pm-center', ['prd', '产品需求', '用户研究', '埋点', '数据指标', '商业化', '用户画像']],
  ['design-studio', ['设计稿', '交互', 'ui', '视觉', '动效', 'figma', '设计系统', '多端适配']],
  ['dev-factory', ['开发', '编码', '架构', '技术方案', '接口', '数据库', 'ci/cd', '打包', '算法', 'ios', 'android']],
  ['qa-gate', ['测试', '提测', 'bug', '兼容', '性能', '安全扫描', '合规检查', '回归']],
  ['ops-growth', ['运营', '增长', '投放', 'aso', '法务', '内容审核', '客服', '隐私政策', '用户协议']],
  ['mgmt-office', ['排期', '资源分配', 'okr', '战略', '团队管理', '招聘', '预算', '决策']],
];

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;
const normalized = input.toLowerCase();
const match = routes.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)));
const output = { hookName: 'dispatch-hint', decision: 'continue' };
if (match) output.systemMessage = `路由建议 → ${match[0]}`;
process.stdout.write(JSON.stringify(output));
