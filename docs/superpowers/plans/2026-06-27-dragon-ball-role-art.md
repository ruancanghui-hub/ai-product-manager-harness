# Dragon Ball Role Art Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and verify 43 distinct 4K portrait illustrations that map the APP lifecycle roles to Dragon Ball characters, with an exact Chinese role name printed on every uniform.

**Architecture:** The approved design spec is the source of truth for role mapping and art direction. Per the user's execution override, every distinct asset is generated with Codex's built-in Image 2 tool, then copied into its numbered team directory and normalized to 2160×3840. Generation is followed by automated file/dimension checks and manual visual inspection of identity, anatomy, style consistency, and Chinese badge text.

**Tech Stack:** Codex built-in Image 2, PNG, macOS `sips`, Codex image inspection.

**Execution override (approved 2026-06-27):** Do not require `OPENAI_API_KEY` or the fallback CLI. Use Codex's built-in Image 2 tool. Because the built-in tool does not expose a destination size parameter, preserve the native generated image and normalize the project copy to exact 4K portrait dimensions with `sips`.

---

## File structure

- Source specification: `docs/superpowers/specs/2026-06-27-dragon-ball-role-art-design.md`
- Temporary batch manifests: `tmp/imagegen/dragon-ball-role-art/*.jsonl`
- Final prompt archive: `output/dragon-ball-role-art/prompts/*.jsonl`
- Final images: `output/dragon-ball-role-art/01-product/` through `07-orchestrator/`
- QA record: `output/dragon-ball-role-art/QA.md`

### Task 1: Verify the Image 2 execution environment

**Files:**
- Read: `/Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py`
- Create directories: `tmp/imagegen/dragon-ball-role-art/`, `output/dragon-ball-role-art/prompts/`, and seven numbered output directories

- [ ] **Step 1: Verify the API credential without printing it**

Run:

```bash
test -n "${OPENAI_API_KEY:-}" && echo "OPENAI_API_KEY=SET" || echo "OPENAI_API_KEY=UNSET"
```

Expected: `OPENAI_API_KEY=SET`. Stop before any API call if it is unset.

- [ ] **Step 2: Verify Python and install the supported client if missing**

Run:

```bash
python3 --version
python3 -c 'import openai; print(openai.__version__)'
```

Expected: Python 3.9+ and an OpenAI SDK version. If the import fails, install only the required package using the active Python environment, then repeat the import check.

- [ ] **Step 3: Verify the bundled CLI accepts the required controls**

Run:

```bash
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --help
```

Expected: help includes `--input`, `--out-dir`, `--model`, `--size`, `--quality`, `--concurrency`, and `--max-attempts`.

- [ ] **Step 4: Create the temporary and final directory tree**

Create these directories without deleting or overwriting existing assets:

```text
tmp/imagegen/dragon-ball-role-art/
output/dragon-ball-role-art/prompts/
output/dragon-ball-role-art/01-product/
output/dragon-ball-role-art/02-design/
output/dragon-ball-role-art/03-development/
output/dragon-ball-role-art/04-qa/
output/dragon-ball-role-art/05-operations/
output/dragon-ball-role-art/06-management/
output/dragon-ball-role-art/07-orchestrator/
```

### Task 2: Author the seven exact prompt manifests

**Files:**
- Create: `tmp/imagegen/dragon-ball-role-art/01-product.jsonl`
- Create: `tmp/imagegen/dragon-ball-role-art/02-design.jsonl`
- Create: `tmp/imagegen/dragon-ball-role-art/03-development.jsonl`
- Create: `tmp/imagegen/dragon-ball-role-art/04-qa.jsonl`
- Create: `tmp/imagegen/dragon-ball-role-art/05-operations.jsonl`
- Create: `tmp/imagegen/dragon-ball-role-art/06-management.jsonl`
- Create: `tmp/imagegen/dragon-ball-role-art/07-orchestrator.jsonl`
- Create matching archival copies under `output/dragon-ball-role-art/prompts/`

- [ ] **Step 1: Create one JSON object per role**

Use entries 1–43 from the approved design spec in order. Every JSON line must include:

Example for the first role:

```json
{"prompt":"布尔玛化身 APP 产品负责人 / 主 PM，保留其标志性蓝色头发、脸型和体态。全身动作镜头：在暴风电光中腾跃，右手前伸指向全息产品路线图的目标节点，左臂后摆稳定决策节点；琥珀金与天蓝色半透明数据光环、路线轨迹和微粒火花环绕身体。她穿着跨团队联合制服，右胸缝制高对比矩形岗位胸牌，以简洁粗体中文逐字准确显示“产品负责人 / 主 PM”，完整清晰可读，最多分两行。环境是云雾缭绕的天空岛破碎平台，远处漂浮云团与旋转碎石。高质量日系动画分镜插画，精细赛璐璐上色，高饱和但保持真实色彩平衡。电影级逆光与边缘高光勾勒完整身体，地面克制反射增强层次，镜头轻微倾斜并保留速度光带。4K 竖版 2160×3840，全身、头部、双手、双脚和道具完整可见。除岗位胸牌外无其他文字；无 Logo、无水印、无额外人物、无额外肢体、无畸形手指。","model":"gpt-image-2","size":"2160x3840","quality":"high","output_format":"png","out":"001-product-lead-bulma.png"}
```

The prompt must fully expand the approved mother prompt—no square-bracket placeholders. It must name the Dragon Ball character, exact APP role, action, prop, team palette, visual metaphor, and the exact Chinese uniform text in quotation marks.

- [ ] **Step 2: Apply the same invariant block to all 43 prompts**

Every prompt must explicitly require: portrait 2160×3840; full body with head, hands, feet, and prop visible; high-quality Japanese anime storyboard illustration; refined cel shading; storm lightning; broken sky-island platform; clouds and rotating rubble; cinematic backlight and rim light; restrained ground reflection; Dutch angle; speed streaks; recognizable canonical facial/hair/body traits; no additional people; no extra limbs; no malformed fingers; no logo; no watermark; no text except the exact Chinese role badge.

- [ ] **Step 3: Archive the exact prompt set**

Copy the seven validated manifests to `output/dragon-ball-role-art/prompts/` so the final delivery contains the complete prompts used for generation.

### Task 3: Validate all jobs without spending generation quota

**Files:**
- Read: `tmp/imagegen/dragon-ball-role-art/*.jsonl`

- [ ] **Step 1: Validate JSON, counts, filenames, model, size, and badge text presence**

Run a read-only Python check that asserts team counts `6, 5, 15, 6, 7, 3, 1`, total count `43`, unique `out` filenames, `model == "gpt-image-2"`, `size == "2160x3840"`, `quality == "high"`, and a quoted Chinese role name in each prompt.

Expected: `43 jobs valid; 43 unique characters; 43 unique filenames`.

- [ ] **Step 2: Dry-run each manifest through the bundled CLI**

Run all seven dry-runs:

```bash
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/dragon-ball-role-art/01-product.jsonl --out-dir output/dragon-ball-role-art/01-product --model gpt-image-2 --size 2160x3840 --quality high --concurrency 2 --max-attempts 3 --dry-run
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/dragon-ball-role-art/02-design.jsonl --out-dir output/dragon-ball-role-art/02-design --model gpt-image-2 --size 2160x3840 --quality high --concurrency 2 --max-attempts 3 --dry-run
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/dragon-ball-role-art/03-development.jsonl --out-dir output/dragon-ball-role-art/03-development --model gpt-image-2 --size 2160x3840 --quality high --concurrency 2 --max-attempts 3 --dry-run
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/dragon-ball-role-art/04-qa.jsonl --out-dir output/dragon-ball-role-art/04-qa --model gpt-image-2 --size 2160x3840 --quality high --concurrency 2 --max-attempts 3 --dry-run
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/dragon-ball-role-art/05-operations.jsonl --out-dir output/dragon-ball-role-art/05-operations --model gpt-image-2 --size 2160x3840 --quality high --concurrency 2 --max-attempts 3 --dry-run
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/dragon-ball-role-art/06-management.jsonl --out-dir output/dragon-ball-role-art/06-management --model gpt-image-2 --size 2160x3840 --quality high --concurrency 2 --max-attempts 3 --dry-run
python3 /Users/nightelf/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/dragon-ball-role-art/07-orchestrator.jsonl --out-dir output/dragon-ball-role-art/07-orchestrator --model gpt-image-2 --size 2160x3840 --quality high --concurrency 2 --max-attempts 3 --dry-run
```

Expected: every payload targets `/v1/images/generations`, uses `gpt-image-2`, `2160x3840`, `high`, and its semantic PNG path.

### Task 4: Generate the seven team batches

**Files:**
- Read: `tmp/imagegen/dragon-ball-role-art/*.jsonl`
- Create: 43 PNG files under `output/dragon-ball-role-art/01-product/` through `07-orchestrator/`

- [ ] **Step 1: Generate one team at a time**

Run the same command as the dry-run without `--dry-run`, beginning with `01-product` and ending with `07-orchestrator`. Keep concurrency at `2` to reduce rate-limit pressure at 4K/high quality. Do not use `--force` on first generation.

Expected: each job reports `completed`, and the team directory contains its planned number of PNGs.

- [ ] **Step 2: Handle transient failures without changing model or resolution**

The CLI retries rate limits and transient network failures up to three attempts. For any remaining failed job, make a one-job retry manifest with the same prompt, model, size, quality, and filename; rerun only that job. Do not downgrade from `gpt-image-2`, reduce resolution, or remove the Chinese text requirement.

### Task 5: Verify resolution, count, identity, typography, and consistency

**Files:**
- Read: all 43 generated PNG files
- Create: `output/dragon-ball-role-art/QA.md`

- [ ] **Step 1: Verify file inventory and exact dimensions**

Run file counts per directory and inspect every PNG with `sips -g pixelWidth -g pixelHeight`.

Expected: team counts `6, 5, 15, 6, 7, 3, 1`; total `43`; every image exactly `2160 × 3840`.

- [ ] **Step 2: Inspect every image visually**

For each image verify: the intended Dragon Ball character is recognizable; the intended role is communicated; the complete full body and prop are visible; anatomy is plausible; the team palette is correct; the shared sky-island environment, lighting, cel shading, and camera language match the set; the uniform badge is unobstructed and displays the exact Chinese role name with no extra characters.

- [ ] **Step 3: Regenerate only failed images**

Create a one-job retry manifest for each failure. Preserve all approved invariants and make one targeted prompt change: text failure → emphasize the verbatim badge and simpler frontal badge angle; anatomy failure → emphasize natural hands and complete limbs; identity failure → emphasize canonical facial, hair, and body traits; style failure → repeat the shared storyboard/cel-shading/light block. Replace the failed file only after the corrected image passes inspection.

- [ ] **Step 4: Record final QA evidence**

Write `QA.md` with a 43-row checklist containing filename, role, character, dimensions, badge-text result, anatomy result, identity result, consistency result, and final status. The final summary must state `43/43 PASS` before completion is claimed.

### Task 6: Final delivery check

**Files:**
- Read: `output/dragon-ball-role-art/`

- [ ] **Step 1: Confirm the final artifact set**

Verify that the output root contains seven team directories, the prompt archive, `QA.md`, and exactly 43 final PNGs. Ensure no temporary retry files or rejected variants are mixed with finals.

- [ ] **Step 2: Report delivery paths and generation settings**

Report the final root path, prompt archive path, QA path, model `gpt-image-2`, size `2160x3840`, quality `high`, and final image count. Include a small representative preview only after all 43 images pass.
