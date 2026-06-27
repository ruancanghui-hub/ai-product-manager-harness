#!/usr/bin/env node

const gates = [
  [['PRD.md', 'Product-Spec.md'], 'PRD 评审是否仍通过？下游是否需要同步？'],
  [['设计规范', 'Design-Brief', 'design-system'], '设计评审是否仍通过？'],
  [['技术方案', 'API定义', '数据库变更'], '技术方案评审是否仍通过？'],
  [['测试用例', '测试计划'], '测试覆盖是否仍完整？'],
  [['用户协议', '隐私政策'], '法务审核是否仍通过？'],
  [['PROJECT-PHASE.md', 'DEV-PLAN.md'], '阶段计划依赖是否需同步？'],
];

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;
let filePath = input;
try {
  const parsed = JSON.parse(input);
  filePath = parsed.tool_input?.file_path ?? parsed.file_path ?? input;
} catch {}

const output = { hookName: 'quality-gate-reminder', decision: 'continue' };
const match = gates.find(([patterns]) => patterns.some((pattern) => filePath.toLowerCase().includes(pattern.toLowerCase())));
if (match) output.systemMessage = `质量门提醒：${match[1]}`;
process.stdout.write(JSON.stringify(output));
