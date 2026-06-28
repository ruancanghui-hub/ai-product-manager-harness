import { Backpack, CardsThree, Books } from "@phosphor-icons/react";

const items = [
  { id: "draw", label: "抽卡", icon: CardsThree },
  { id: "collection", label: "收藏", icon: Backpack },
  { id: "skills", label: "技能包", icon: Books },
];

export function BottomNav({ activeTab, collectedCount, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      <div className="bottom-nav__inner">
        {items.map((item) => {
          const Icon = item.icon;
          const suffix = item.id === "collection" && collectedCount > 0 ? ` ${collectedCount}` : "";
          return (
            <button
              className={`bottom-nav__item ${activeTab === item.id ? "is-active" : ""}`}
              key={item.id}
              type="button"
              aria-current={activeTab === item.id ? "page" : undefined}
              aria-label={`${item.label}${suffix}`}
              onClick={() => onChange(item.id)}
            >
              <Icon size={27} weight={activeTab === item.id ? "fill" : "duotone"} />
              <span>{item.label}</span>
              {item.id === "collection" && collectedCount > 0 ? (
                <b className="bottom-nav__count">{collectedCount}</b>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

