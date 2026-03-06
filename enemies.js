
function getEnemyProfile(level){
  if(level === 10){
    return {
      name: 'Mini Boss Bulwark',
      archetype: 'tank',
      hpBonus: 12,
      energyBonus: 1,
      bonusCards: ['ironwall', 'blockall'],
      preferences: { defense: 1.8, heal: 1.1, debuff: 0.8, attack: 0.9, poison: 0.7, vamp: 0.6 }
    };
  }
  if(level === 20){
    return {
      name: 'Mini Boss Venomancer',
      archetype: 'venom',
      hpBonus: 16,
      energyBonus: 1,
      bonusCards: ['toxicburst', 'voidhex'],
      preferences: { defense: 0.9, heal: 1.0, debuff: 1.6, attack: 1.0, poison: 2.0, vamp: 0.7 }
    };
  }
  if(level === 30){
    return {
      name: 'Boss Final Eclipse',
      archetype: 'vamp',
      hpBonus: 24,
      energyBonus: 1,
      bonusCards: ['bloodmoon', 'ironwall', 'toxicburst'],
      preferences: { defense: 1.0, heal: 1.3, debuff: 1.2, attack: 1.3, poison: 1.0, vamp: 2.1 }
    };
  }
  const pool = [
    { name: 'Slime Guardião', archetype: 'tank', hpBonus: 0, energyBonus: 0, bonusCards: [], preferences: { defense: 1.5, heal: 1.1, debuff: 0.8, attack: 0.9, poison: 0.8, vamp: 0.6 } },
    { name: 'Venom Scout', archetype: 'venom', hpBonus: 0, energyBonus: 0, bonusCards: [], preferences: { defense: 0.8, heal: 1.0, debuff: 1.3, attack: 1.0, poison: 1.8, vamp: 0.7 } },
    { name: 'Vamp Raider', archetype: 'vamp', hpBonus: 0, energyBonus: 0, bonusCards: [], preferences: { defense: 0.8, heal: 1.1, debuff: 0.9, attack: 1.2, poison: 0.8, vamp: 1.8 } }
  ];
  if(level <= 10) return pool[(level - 1) % 2];
  if(level <= 20) return pool[(level + 1) % 3];
  return pool[(level + 2) % 3];
}

function buildEnemyDeck(save, level){
  const profile = getEnemyProfile(level);
  const deck = buildDeckFromChoices(save.botChoices || [], save.enemyRemovedStarters || [], save.enemyExtraCopies || {}, MAX_ACTIVE_DECK_SIZE);
  const counts = {};
  deck.forEach(id => counts[id] = (counts[id] || 0) + 1);
  const addIfUnlocked = (cardId) => {
    const card = getCard(cardId);
    if(!card) return;
    counts[cardId] = (counts[cardId] || 0) + 1;
  };
  profile.bonusCards.forEach(addIfUnlocked);

  const preferred = {
    tank: ['block4','block7','block10','blockall','imm1','imm3','reb2','reb3','ironwall'],
    venom: ['poison1','poison3','poison5','curse2','curse3','curse5','discard1','discard2','chaos2','chaos3','toxicburst','voidhex'],
    vamp: ['vamp3','vamp5','vamp8','atk8','atk10','atk15','atk20','bloodmoon']
  };
  (preferred[profile.archetype] || []).forEach(id => {
    if(getCard(id)) counts[id] = (counts[id] || 0) + 1;
  });

  const entries = [];
  Object.entries(counts).forEach(([id, count]) => {
    const card = getCard(id);
    if(!card) return;
    for(let i = 0; i < count; i++){
      const bias = profile.archetype === 'tank' && card.type === 'Defesa' ? 12 :
                   profile.archetype === 'venom' && (card.id.includes('poison') || card.type === 'Debuff') ? 12 :
                   profile.archetype === 'vamp' && (card.id.includes('vamp') || card.id === 'bloodmoon') ? 12 : 0;
      entries.push({ id, score: (card.power || 0) + (getStageRank(card) * 10) + bias });
    }
  });
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, MAX_ACTIVE_DECK_SIZE).map(entry => entry.id);
}
