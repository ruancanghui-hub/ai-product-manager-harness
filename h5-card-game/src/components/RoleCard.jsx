import { Eye } from "@phosphor-icons/react";

export function RoleCard({ card, compact = false, locked = false, onOpen }) {
  const style = { "--team-color": card.team.color };

  return (
    <article className={`role-card ${compact ? "role-card--compact" : ""}`} style={style}>
      <div className="role-card__image-frame">
        <img className="role-card__image" src={card.image} alt={`${card.character}角色卡`} loading="lazy" />
        <span className="role-card__number">NO.{card.id}</span>
        <span className="role-card__team-mark" title={card.team.name}>{card.team.sigil}</span>
      </div>
      <div className="role-card__caption">
        <h3>{card.character}</h3>
        <p>{card.role}</p>
        <span className="role-card__team"><i /> {card.team.name}团队</span>
        {compact ? (
          <button type="button" onClick={() => onOpen(card)} aria-label={`查看${card.character}技能`}>
            <Eye size={17} weight="bold" />
            {locked ? "查看技能" : "查看技能"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

