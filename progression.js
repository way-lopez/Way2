const MAX_LEVEL = 30;
const BASE_HP = 40;
function getHpForLevel(level){ if(level <= 10) return BASE_HP + ((level - 1) * 2); if(level <= 20) return BASE_HP + 18 + ((level - 10) * 1); return BASE_HP + 28; }
function getStageForLevel(level){ if(level <= 10) return "early"; if(level <= 20) return "mid"; return "late"; }
function buildStarterDeck(){ const deck=[]; STARTER_CARDS.forEach(card=>{ for(let i=0;i<card.copies;i++) deck.push(card.id); }); return deck; }
function buildDeckFromChoices(choiceIds){ const deck=buildStarterDeck(); (choiceIds||[]).forEach(id=>{ const card=getCard(id); if(card){ for(let i=0;i<card.copies;i++) deck.push(card.id); } }); return deck; }
function weightedPick(pool){ const total=pool.reduce((acc,c)=>acc+(c.weight||1),0); let roll=Math.random()*total; for(const card of pool){ roll-=(card.weight||1); if(roll<=0) return card; } return pool[pool.length-1]; }
function getChoicePair(level,takenIds){ const stage=getStageForLevel(level); const pool=LEVEL_POOL.filter(c=>c.stage===stage && !takenIds.includes(c.id)); if(pool.length<=1) return pool.slice(0,2); const first=weightedPick(pool); const secondPool=pool.filter(c=>c.id!==first.id); const second=weightedPick(secondPool); return [first, second]; }
