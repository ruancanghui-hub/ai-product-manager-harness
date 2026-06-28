import { CardsThree } from "@phosphor-icons/react";
import { RoleCard } from "../../components/RoleCard";

export function CollectionScreen({ cards, onOpen }) {
  return (
    <section className="library-screen">
      <header className="page-header">
        <div><p className="eyebrow">我的图鉴</p><h1>角色收藏</h1></div>
        <span>{cards.length} / 43</span>
      </header>

      {cards.length === 0 ? (
        <div className="empty-state">
          <CardsThree size={60} weight="duotone" />
          <h2>还没有收藏角色</h2>
          <p>前往抽卡页完成第一次召唤吧。</p>
        </div>
      ) : (
        <div className="card-grid">
          {cards.map((card) => <RoleCard compact card={card} key={card.id} onOpen={onOpen} />)}
        </div>
      )}
    </section>
  );
}

