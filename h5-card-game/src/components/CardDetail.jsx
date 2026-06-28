import { Lightning, ShieldCheck, Sparkle, X } from "@phosphor-icons/react";
import { RoleCard } from "./RoleCard";

const icons = [Lightning, Sparkle, ShieldCheck];

export function CardDetail({ card, onClose }) {
  return (
    <div className="modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal__panel" role="dialog" aria-modal="true" aria-label={`${card.character}技能详情`}>
        <button className="modal__close" type="button" aria-label="关闭" onClick={onClose}>
          <X size={22} weight="bold" />
        </button>
        <div className="modal__card"><RoleCard card={card} /></div>
        <div className="modal__content">
          <p className="eyebrow">角色技能</p>
          <h2>{card.character}</h2>
          <p className="modal__role">{card.role} · {card.team.name}团队</p>
          <div className="skill-list">
            {card.skills.map((skill, index) => {
              const Icon = icons[index];
              return (
                <article className="skill-row" key={skill.name}>
                  <span className="skill-row__icon"><Icon size={22} weight="duotone" /></span>
                  <div><h3>{skill.name}</h3><p>{skill.description}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

