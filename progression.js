const MAX_LEVEL = 30;
const BASE_HP = 40;

function getHpForLevel(level){
  if(level <= 10) return BASE_HP + ((level - 1) * 2);
  if(level <= 20) return BASE_HP + (9 * 2) + ((level - 10) * 1);
  return BASE_HP + (9 * 2) + (10 * 1);
}

function getTierForLevel(level){
  if(level <= 10) return "media";
  return "dificil";
}

function buildStarterDeck(){
  const deck = [];
  STARTER_CARDS.forEach(card => {
    for(let i=0;i<card.copies;i++) deck.push(card.id);
  });
  return deck;
}

function buildDeckFromChoices(choiceIds){
  const deck = buildStarterDeck();
  (choiceIds || []).forEach(id => {
    const card = getCard(id);
    if(card){
      for(let i=0;i<card.copies;i++) deck.push(card.id);
    }
  });
  return trimDeck(deck);
}

function trimDeck(deck){
  if(deck.length <= DECK_LIMIT) return deck.slice();
  const scored = deck.map((id, idx) => ({id, idx, power:getCard(id)?.power || 0}));
  scored.sort((a,b) => a.power - b.power || a.idx - b.idx);
  const toRemove = new Set(scored.slice(0, deck.length - DECK_LIMIT).map(x => x.idx));
  return deck.filter((_, idx) => !toRemove.has(idx));
}

function getChoicePair(level, takenIds){
  const tier = getTierForLevel(level);
  const available = LEVEL_POOL.filter(c => c.tier === tier && !takenIds.includes(c.id));
  if(available.length <= 2) return available.slice(0, 2);

  // Exorcismo entra cedo na progressão porque o deck inicial já resolve veneno, maldição, rebote e buff.
  // Assim o jogador ganha uma resposta importante para Imortal sem precisar esperar demais.
  if(level <= 4){
    const exorcism = available.find(c => c.id === "exorcism");
    if(exorcism){
      const rest = available.filter(c => c.id !== "exorcism").sort(() => Math.random() - 0.5);
      return [exorcism, rest[0]];
    }
  }

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

function shouldTriggerEvent(level){
  if(level <= 2) return false;
  if(level === 10 || level === 20 || level === 30) return false;
  return level % 4 === 0;
}
