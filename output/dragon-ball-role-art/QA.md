# 七龙珠角色岗位图 QA

## 最终结果

- 状态：43/43 PASS
- 生成方式：Codex 内置 Image 2
- 最终格式：PNG
- 最终尺寸：全部 2160 × 3840
- 序号：001–043 连续，无缺失、无重复
- 视觉语言：统一日系动画分镜、天空岛、暴风电光、电影逆光、岗位制服与胸牌
- 胸牌：43 张均显示可读的中文岗位名称
- 人物：43 个岗位均使用独立的七龙珠角色映射

## 团队数量

| 目录 | 数量 | 结果 |
|---|---:|---|
| 01-product | 6 | PASS |
| 02-design | 5 | PASS |
| 03-development | 15 | PASS |
| 04-qa | 6 | PASS |
| 05-operations | 7 | PASS |
| 06-management | 3 | PASS |
| 07-orchestrator | 1 | PASS |

## 自动验证证据

```text
ASSET_VERIFICATION PASS
TOTAL=43
TEAM_COUNTS=6 5 15 6 7 3 1
SEQUENCE=001-043
DIMENSIONS=2160x3840_ALL
PNG_DECODING=43_PASS
```

项目测试：34/34 PASS。

## 人工视觉检查

- 全身、脸部、手脚与主要岗位道具可见。
- 角色身份与岗位视觉隐喻可辨认。
- 胸牌未被完全遮挡，岗位文字可用于快速区分。
- 未发现水印、额外人物或成组重复角色。
- 布尔玛原图画幅较窄，已用 Image 2 扩展天空岛背景后再统一到 4K，未使用纯色侧边栏。
