import { describe, expect, it } from "vitest";
import { cards } from "../data/cards";
import { drawCard, filterCards } from "./cardGame";

describe("card game rules", () => {
  it("draws from uncollected cards before duplicates", () => {
    const drawn = drawCard(cards, cards.slice(0, 42).map((card) => card.id), () => 0.9);
    expect(drawn.id).toBe(cards[42].id);
  });

  it("searches by role and skill and respects team filters", () => {
    expect(filterCards(cards, { query: "性能优化", teamId: "all" })).toHaveLength(1);
    expect(filterCards(cards, { query: "", teamId: "qa" })).toHaveLength(6);
  });
});

