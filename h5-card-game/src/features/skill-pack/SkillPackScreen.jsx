import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { useDeferredValue, useMemo, useState } from "react";
import { RoleCard } from "../../components/RoleCard";
import { teams } from "../../data/cards";
import { filterCards } from "../../lib/cardGame";

export function SkillPackScreen({ cards, collectedIds, onOpen }) {
  const [teamId, setTeamId] = useState("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const visibleCards = useMemo(
    () => filterCards(cards, { query: deferredQuery, teamId }),
    [cards, deferredQuery, teamId],
  );
  const collected = useMemo(() => new Set(collectedIds), [collectedIds]);

  return (
    <section className="library-screen skill-pack">
      <header className="page-header page-header--center">
        <div><p className="eyebrow">职业图鉴</p><h1>技能包</h1></div>
      </header>

      <section className="team-distribution" aria-label="团队分布">
        <h2>团队分布</h2>
        <div className="team-distribution__grid">
          {teams.map((team) => (
            <button
              className={teamId === team.id ? "is-active" : ""}
              type="button"
              key={team.id}
              style={{ "--team-color": team.color }}
              onClick={() => setTeamId(team.id)}
              aria-label={team.name}
            >
              <span>{team.sigil}</span><strong>{team.name}</strong><small>{team.count}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="catalog-tools">
        <label className="search-box">
          <MagnifyingGlass size={22} weight="bold" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索角色名称或技能" />
        </label>
        <button className={`filter-all ${teamId === "all" ? "is-active" : ""}`} type="button" onClick={() => setTeamId("all")}>
          <FunnelSimple size={19} weight="bold" /> 全部
        </button>
      </div>

      <div className="catalog-result"><strong>{visibleCards.length} 张角色卡</strong><span>点击卡牌查看完整技能</span></div>
      <div className="card-grid">
        {visibleCards.map((card) => (
          <RoleCard compact card={card} key={card.id} locked={!collected.has(card.id)} onOpen={onOpen} />
        ))}
      </div>
      {visibleCards.length === 0 ? <div className="empty-state"><h2>没有找到匹配卡牌</h2><p>试试其他角色名或技能关键词。</p></div> : null}
    </section>
  );
}

