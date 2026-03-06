const MAX_LEVEL = 20;
const START_LEVEL = 1;
const BASE_PLAYER_HP = 35;
const STARTING_EXTRA_UNLOCK = 1;
const HP_GAIN_PER_LEVEL = 5;

function getCurrentHpBonus(level){ return (Math.max(1, level) - 1) * HP_GAIN_PER_LEVEL; }
function getUnlockedCards(level){
  const unlockedExtras = Math.min(STARTING_EXTRA_UNLOCK + Math.max(0, level - 1), EXTRA_CARDS.length);
  return [...BASE_CARDS.map(c => c.id), ...EXTRA_CARDS.slice(0, unlockedExtras).map(c => c.id)];
}
function buildDeckFromUnlocked(level){
  const deck = [];
  getUnlockedCards(level).forEach(cardId => {
    const card = getCard(cardId);
    if(!card) return;
    for(let i = 0; i < card.copies; i++) deck.push(card.id);
  });
  return deck;
}
function clampLevel(level){ return Math.max(START_LEVEL, Math.min(MAX_LEVEL, level)); }
