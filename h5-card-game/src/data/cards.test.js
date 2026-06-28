import { describe, expect, it } from "vitest";
import { cards, teams } from "./cards";

describe("card catalog", () => {
  it("contains all 43 cards with three usable skills", () => {
    expect(cards).toHaveLength(43);
    expect(new Set(cards.map((card) => card.id)).size).toBe(43);
    expect(cards.every((card) => card.skills.length === 3)).toBe(true);
    expect(cards.every((card) => card.image.startsWith("/cards/"))).toBe(true);
  });

  it("matches the approved seven-team distribution", () => {
    const counts = Object.fromEntries(
      teams.map((team) => [team.id, cards.filter((card) => card.teamId === team.id).length]),
    );

    expect(counts).toEqual({
      product: 6,
      design: 5,
      development: 15,
      qa: 6,
      operations: 7,
      management: 3,
      orchestrator: 1,
    });
  });

  it("gives every role a unique and actionable usage guide", () => {
    expect(cards.every((card) => card.profile.summary.length >= 20)).toBe(true);
    expect(cards.every((card) => card.profile.dailyWork.length === 3)).toBe(true);
    expect(cards.every((card) => card.profile.howToUse.length === 3)).toBe(true);
    expect(cards.every((card) => card.profile.promptExample.length >= 30)).toBe(true);
    expect(new Set(cards.map((card) => card.profile.promptExample)).size).toBe(43);

    const uiDesigner = cards.find((card) => card.id === "008");
    expect(JSON.stringify(uiDesigner.profile)).toMatch(/高保真/);
    expect(JSON.stringify(uiDesigner.profile)).toMatch(/视觉规范/);
    expect(JSON.stringify(uiDesigner.profile)).toMatch(/组件/);
  });
});
