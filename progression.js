
const MAX_LEVEL = 30;
const BASE_HP = 40;
const EVENT_LEVELS = [4, 8, 12, 16, 24, 28];

function getHpForLevel(level){
  if(level <= 10) return BASE_HP + ((level - 1) * 2);
  if(level <= 20) return BASE_HP + 18 + ((level - 10) * 1);
  return BASE_HP + 28;
}

function getStageForLevel(level){
  if(level <= 10) return 'early';
  if(level <= 20) return 'mid';
  return 'late';
}

function buildStarterDeck(removedStarterIds = []){
  const removed = new Set(removedStarterIds || []);
  const deck = [];
  STARTER_CARDS.forEach(card => {
    if(removed.has(card.id)) return;
    for(let i = 0; i < card.copies; i++) deck.push(card.id);
  });
  return deck;
}

function buildDeckFromChoices(choiceIds = [], removedStarterIds = [], extraCopies = {}, cap = MAX_ACTIVE_DECK_SIZE){
  const entries = [];
  const addCopies = (cardId, count) => {
    const card = getCard(cardId);
    if(!card) return;
    const copies = Math.max(0, count || 0);
    for(let i = 0; i < copies; i++){
      entries.push({ id: card.id, score: (card.power || 0) + (getStageRank(card) * 10) + (card.enemyOnly ? 100 : 0) });
    }
  };
  const starterDeck = buildStarterDeck(removedStarterIds);
  starterDeck.forEach(id => addCopies(id, 1));
  (choiceIds || []).forEach(id => {
    const card = getCard(id);
    if(card) addCopies(card.id, card.copies);
  });
  Object.entries(extraCopies || {}).forEach(([id, amount]) => addCopies(id, amount));
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, cap).map(entry => entry.id);
}

function weightedPick(pool){
  const total = pool.reduce((acc, card) => acc + (card.weight || 1), 0);
  let roll = Math.random() * total;
  for(const card of pool){
    roll -= (card.weight || 1);
    if(roll <= 0) return card;
  }
  return pool[pool.length - 1];
}

function getChoicePair(level, takenIds){
  const stage = getStageForLevel(level);
  const pool = LEVEL_POOL.filter(card => !card.enemyOnly && card.stage === stage && !takenIds.includes(card.id));
  if(pool.length <= 1) return pool.slice(0, 2);
  const first = weightedPick(pool);
  const secondPool = pool.filter(card => card.id !== first.id);
  const second = weightedPick(secondPool);
  return [first, second];
}

function isEventLevel(level){
  return EVENT_LEVELS.includes(level);
}

function getEventOptions(save){
  const options = [];
  const removable = STARTER_CARDS.filter(card => !(save.removedStarters || []).includes(card.id));
  if(removable.length > 0){
    options.push({
      id: 'purify',
      title: 'Purificar deck',
      desc: 'Remove automaticamente 1 carta inicial fraca do seu deck ativo.'
    });
  }
  const unlocked = [...STARTER_CARDS.map(c => c.id), ...(save.playerChoices || [])];
  if(unlocked.length > 0){
    options.push({
      id: 'duplicate',
      title: 'Forjar carta',
      desc: 'Duplica 1 carta aleatória que você já possui, respeitando o limite do deck.'
    });
  }
  options.push({
    id: 'vigor',
    title: 'Bênção de vigor',
    desc: 'Próximo combate começa com +8 HP temporários.'
  });
  options.push({
    id: 'transmute',
    title: 'Transmutação',
    desc: 'Troca 1 carta inicial sua por 1 carta aleatória do estágio atual.'
  });
  return options.slice(0, 3);
}
