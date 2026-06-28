# Role Card Usage Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a unique, actionable role guide to all 43 cards and expose it on the draw reveal and full card-detail surfaces.

**Architecture:** Keep long-form role copy in a dedicated `roleProfiles.js` data module keyed by the existing three-digit card IDs. Attach the profile while constructing each card, then render the same data through a reusable `RoleGuide` component with compact and full variants. Existing draw, collection, search and persistence rules remain unchanged.

**Tech Stack:** React 19, Vite, Vitest, Testing Library, Phosphor Icons, CSS.

---

### Task 1: Define and enforce the profile data contract

**Files:**
- Create: `h5-card-game/src/data/roleProfiles.js`
- Modify: `h5-card-game/src/data/cards.js`
- Test: `h5-card-game/src/data/cards.test.js`

- [x] **Step 1: Write the failing data-contract test**

Add assertions that all cards have a summary, exactly three `dailyWork` items, exactly three `howToUse` items, and a non-empty `promptExample`. Assert all prompt examples are unique and check the UI designer profile contains “高保真”, “视觉规范”, and “组件”.

```js
expect(cards.every((card) => card.profile.summary.length >= 20)).toBe(true);
expect(cards.every((card) => card.profile.dailyWork.length === 3)).toBe(true);
expect(cards.every((card) => card.profile.howToUse.length === 3)).toBe(true);
expect(new Set(cards.map((card) => card.profile.promptExample)).size).toBe(43);
const uiDesigner = cards.find((card) => card.id === "008");
expect(JSON.stringify(uiDesigner.profile)).toMatch(/高保真/);
expect(JSON.stringify(uiDesigner.profile)).toMatch(/视觉规范/);
expect(JSON.stringify(uiDesigner.profile)).toMatch(/组件/);
```

- [x] **Step 2: Run the test and verify RED**

Run: `npm --prefix h5-card-game test -- src/data/cards.test.js`

Expected: FAIL because `card.profile` is missing.

- [x] **Step 3: Add the complete role profile catalog**

Create `roleProfiles` keyed by IDs `001` through `043`. Every entry follows this exact shape:

```js
"008": {
  summary: "UI 视觉设计师把产品结构转化为清晰、一致且可落地的高保真界面。",
  dailyWork: [
    "根据 PRD 和交互稿完成高保真页面与关键状态设计。",
    "建立颜色、字体、间距、图标和组件等视觉规范。",
    "向开发交付组件状态、切图资源、尺寸标注和走查清单。",
  ],
  howToUse: [
    "提供 PRD、交互流程、目标平台尺寸和现有品牌规范。",
    "明确需要设计的页面范围、用户状态和交付时间。",
    "要求输出高保真稿、组件规范、开发标注和视觉验收清单。",
  ],
  promptExample: "请以 UI 视觉设计师身份，根据这份 PRD 和交互稿，为 390px 宽的 H5 输出高保真页面、完整组件状态、视觉规范与开发标注。",
}
```

Update `createCard` to attach the matching profile and fail fast in development if an ID is missing.

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `npm --prefix h5-card-game test -- src/data/cards.test.js`

Expected: all card catalog tests pass.

### Task 2: Render compact and full role guides

**Files:**
- Create: `h5-card-game/src/components/RoleGuide.jsx`
- Modify: `h5-card-game/src/features/draw/DrawScreen.jsx`
- Modify: `h5-card-game/src/components/CardDetail.jsx`
- Modify: `h5-card-game/src/App.jsx`
- Test: `h5-card-game/src/App.test.jsx`

- [x] **Step 1: Write failing component tests**

After drawing card `001`, assert the reveal contains “岗位详细介绍”, “日常能帮你做什么” and the product-lead summary. Click “查看完整使用指南” and assert the dialog contains “如何让他使用这些能力” and “可直接使用的召唤口令”.

```jsx
fireEvent.click(screen.getByRole("button", { name: "抽取角色" }));
expect(screen.getByText("岗位详细介绍")).toBeInTheDocument();
expect(screen.getByText("日常能帮你做什么")).toBeInTheDocument();
fireEvent.click(screen.getByRole("button", { name: "查看完整使用指南" }));
expect(screen.getByText("如何让他使用这些能力")).toBeInTheDocument();
expect(screen.getByText("可直接使用的召唤口令")).toBeInTheDocument();
```

- [x] **Step 2: Run the test and verify RED**

Run: `npm --prefix h5-card-game test -- src/App.test.jsx`

Expected: FAIL because the guide headings and button are absent.

- [x] **Step 3: Implement the reusable guide**

`RoleGuide` renders `summary` and the three daily-work bullets in compact mode. Full mode additionally renders numbered `howToUse` steps and the `promptExample`. `DrawScreen` receives `onOpenDetails`, renders compact mode below skills, and opens the existing `CardDetail`. `CardDetail` renders full mode after the skill list.

- [x] **Step 4: Run the component test and verify GREEN**

Run: `npm --prefix h5-card-game test -- src/App.test.jsx`

Expected: all H5 interaction tests pass.

### Task 3: Style and responsive integration

**Files:**
- Modify: `h5-card-game/src/styles.css`

- [x] **Step 1: Add role-guide component styles**

Add parchment-compatible section dividers, compact bullet rows, numbered usage steps, and a distinct prompt-example panel. At desktop heights up to 780px, set the reveal skill panel to a bounded scroll region so collection controls remain reachable. On mobile, remove the internal height cap and let the document scroll naturally.

- [x] **Step 2: Run all automated verification**

Run: `npm --prefix h5-card-game test && npm --prefix h5-card-game run build && npm test`

Expected: 6+ H5 tests, production build, and 34 root tests all pass.

### Task 4: Browser regression and visual QA

**Files:**
- Modify: `h5-card-game/design-qa.md`
- Modify: `h5-card-game/SELF-CHECK.md`

- [x] **Step 1: Verify the desktop flow**

Use the in-app browser at `http://127.0.0.1:5173/`: reload → draw → confirm compact role guide → open full guide → confirm usage steps and prompt → close → collect.

- [x] **Step 2: Verify the mobile flow**

Set viewport to 390 × 844 and repeat draw → open guide → close. Confirm no horizontal overflow, hidden actions, broken images or console warnings.

- [x] **Step 3: Update QA evidence**

Record both viewport checks, interaction proof, console health, and any responsive patch in `design-qa.md` and `SELF-CHECK.md`. The final QA result remains `passed` only when no actionable P0/P1/P2 issue remains.
