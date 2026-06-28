# AI-PM H5 Card Game Implementation Plan

**Goal:** Build a responsive, local-first H5 card-drawing game from the 43 existing role images.

**Architecture:** A self-contained React + Vite app under `h5-card-game/`. Static role metadata drives all screens. A small pure-function game layer owns draw/search/collection behavior, while React components render the draw stage, reveal state, collection, and skill-pack codex. Collection persists through versioned localStorage.

**Tech Stack:** React, Vite, Vitest, Testing Library, Phosphor Icons, CSS modules/global tokens, browser localStorage.

---

### Task 1: Bootstrap and data contract

- Create the standalone Vite project and test setup.
- Add failing tests for card count, team distribution, search and draw behavior.
- Add 43-card metadata and pure game helpers until tests pass.

### Task 2: Web image pipeline

- Convert the existing 4K PNG role art to web-sized JPEG assets without touching originals.
- Generate or prepare dedicated game background and card-back assets.
- Validate that every data record maps to an existing public asset.

### Task 3: Core draw flow

- Add app shell, fixed bottom navigation and draw-stage layout.
- Implement face-down card, randomized draw, flip reveal, skill list and collect action.
- Add accessible animation and reduced-motion fallback.

### Task 4: Collection and skill pack

- Implement persistent collection with empty and populated states.
- Implement team distribution, search, filters and all-card grid.
- Add card detail dialog so every role’s skills are readable.

### Task 5: Verification and handoff

- Run unit tests and production build.
- Verify draw → reveal → collect → collection and skill-pack filter/search in the browser.
- Capture desktop and mobile screenshots, compare against the accepted concept, and write `design-qa.md` plus self-check report.

