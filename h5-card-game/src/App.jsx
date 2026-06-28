import { useMemo, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { CardDetail } from "./components/CardDetail";
import { CollectionScreen } from "./features/collection/CollectionScreen";
import { DrawScreen } from "./features/draw/DrawScreen";
import { SkillPackScreen } from "./features/skill-pack/SkillPackScreen";
import { cards } from "./data/cards";
import { drawCard, loadCollection, saveCollection } from "./lib/cardGame";
import "./styles.css";

export function App({ random = Math.random }) {
  const [activeTab, setActiveTab] = useState("draw");
  const [currentCard, setCurrentCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [collectedIds, setCollectedIds] = useState(() => loadCollection());

  const collectedCards = useMemo(() => {
    const ids = new Set(collectedIds);
    return cards.filter((card) => ids.has(card.id));
  }, [collectedIds]);

  function handleDraw() {
    setCurrentCard(drawCard(cards, collectedIds, random));
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function handleCollect(card) {
    setCollectedIds((current) => {
      const next = [...new Set([...current, card.id])];
      saveCollection(next);
      return next;
    });
  }

  return (
    <div className={`app app--${activeTab}`}>
      <main className="app__main">
        {activeTab === "draw" ? (
          <DrawScreen
            card={currentCard}
            collectedCount={collectedIds.length}
            isCollected={currentCard ? collectedIds.includes(currentCard.id) : false}
            onDraw={handleDraw}
            onCollect={handleCollect}
          />
        ) : null}
        {activeTab === "collection" ? (
          <CollectionScreen cards={collectedCards} onOpen={setSelectedCard} />
        ) : null}
        {activeTab === "skills" ? (
          <SkillPackScreen cards={cards} collectedIds={collectedIds} onOpen={setSelectedCard} />
        ) : null}
      </main>

      <BottomNav
        activeTab={activeTab}
        collectedCount={collectedIds.length}
        onChange={setActiveTab}
      />

      {selectedCard ? <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} /> : null}
    </div>
  );
}
