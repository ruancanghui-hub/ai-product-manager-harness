const STORAGE_KEY = "ai-pm-card-collection:v1";

export function drawCard(cards, collectedIds = [], random = Math.random) {
  const collected = new Set(collectedIds);
  const available = cards.filter((card) => !collected.has(card.id));
  const pool = available.length > 0 ? available : cards;
  return pool[Math.floor(random() * pool.length)] ?? null;
}

export function filterCards(cards, { query = "", teamId = "all" } = {}) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");

  return cards.filter((card) => {
    if (teamId !== "all" && card.teamId !== teamId) return false;
    if (!normalized) return true;

    const haystack = [
      card.character,
      card.role,
      card.team.name,
      ...card.skills.flatMap((skill) => [skill.name, skill.description]),
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN");

    return haystack.includes(normalized);
  });
}

export function loadCollection(storage = globalThis.localStorage) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveCollection(ids, storage = globalThis.localStorage) {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

