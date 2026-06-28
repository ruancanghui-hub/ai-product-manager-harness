import { CheckCircle, Lightning, Seal, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import { RoleCard } from "../../components/RoleCard";

const skillIcons = [Lightning, Sparkle, ShieldCheck];

export function DrawScreen({ card, collectedCount, isCollected, onDraw, onCollect }) {
  return (
    <section className="draw-screen">
      <header className="draw-header">
        <div>
          <h1>{card ? "恭喜获得新角色" : "召唤祭坛"}</h1>
          <p>{card ? "翻开卡牌，查看角色的专业技能" : "抽取并收集专业角色卡牌"}</p>
        </div>
        <span className="collection-meter">已收集 <strong>{collectedCount}</strong> / 43</span>
      </header>

      {!card ? (
        <div className="summon-stage">
          <div className="card-back" aria-hidden="true">
            <img src="/cards/043-chief-orchestrator-zeno.jpg" alt="" />
            <span className="card-back__veil" />
            <span className="card-back__seal"><Seal size={72} weight="duotone" /></span>
            <span className="card-back__gems">
              {["#ef9f35", "#50b9ef", "#58b84b", "#8e64d7", "#d8aa42", "#d75b4a", "#d9dde5"].map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
          </div>
          <button className="primary-button primary-button--large" type="button" onClick={onDraw}>
            <Sparkle size={26} weight="fill" /> 抽取角色
          </button>
          <p className="draw-hint">优先召唤尚未收集的角色</p>
        </div>
      ) : (
        <div className="reveal-layout">
          <div className="reveal-card"><RoleCard card={card} /></div>
          <section className="skill-panel">
            <p className="eyebrow">技能预览</p>
            <div className="skill-list">
              {card.skills.map((skill, index) => {
                const Icon = skillIcons[index];
                return (
                  <article className="skill-row" key={skill.name}>
                    <span className="skill-row__icon"><Icon size={24} weight="duotone" /></span>
                    <div><h3>{skill.name}</h3><p>{skill.description}</p></div>
                  </article>
                );
              })}
            </div>
            {isCollected ? (
              <button className="primary-button is-complete" type="button" disabled>
                <CheckCircle size={22} weight="fill" /> 已收入
              </button>
            ) : (
              <button className="primary-button" type="button" onClick={() => onCollect(card)}>收入收藏</button>
            )}
            <button className="text-button" type="button" onClick={onDraw}>再抽一张</button>
          </section>
        </div>
      )}
    </section>
  );
}

