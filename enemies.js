const BOSS_CARD_IDS = {
  tank:["block10","blockall","regen3","regen3","reb3","defense1","defense2","atk10","atk15"],
  venom:["poison3","poison5","chaos2","discard1","discard2","curse3","forcedheal","atk8","atk10"],
  vamp:["vamp5","vamp8","reb5","regen3","atk10","atk15","troco","combo","sacrifice1"]
};

function getEnemyProfile(level){
  if(level === 10){
    return { name:"Mini Boss Tank", archetype:"tank", hpBonus:8, energyBonus:1, boss:true };
  }
  if(level === 20){
    return { name:"Mini Boss Venom", archetype:"venom", hpBonus:12, energyBonus:1, boss:true };
  }
  if(level === 30){
    return { name:"Boss Final Vamp", archetype:"vamp", hpBonus:18, energyBonus:1, boss:true };
  }
  if(level <= 10){
    const roll = (level % 3);
    if(roll === 0) return { name:"Venom", archetype:"venom", hpBonus:0, energyBonus:0, boss:false };
    if(roll === 1) return { name:"Slime", archetype:"tank", hpBonus:0, energyBonus:0, boss:false };
    return { name:"Bandit", archetype:"vamp", hpBonus:0, energyBonus:0, boss:false };
  }
  if(level <= 20){
    const roll = level % 3;
    if(roll === 0) return { name:"Guardian", archetype:"tank", hpBonus:4, energyBonus:0, boss:false };
    if(roll === 1) return { name:"Plague Mage", archetype:"venom", hpBonus:2, energyBonus:0, boss:false };
    return { name:"Blood Acolyte", archetype:"vamp", hpBonus:2, energyBonus:0, boss:false };
  }
  const roll = level % 3;
  if(roll === 0) return { name:"Titan", archetype:"tank", hpBonus:6, energyBonus:0, boss:false };
  if(roll === 1) return { name:"Hex Lord", archetype:"venom", hpBonus:4, energyBonus:0, boss:false };
  return { name:"Night Lord", archetype:"vamp", hpBonus:4, energyBonus:0, boss:false };
}

function getEnemyStarterDeck(level){
  let deck = buildStarterDeck();

  // Nerf dos níveis 1-5: bot com deck inicial mais fraco, sem as respostas/pressões mais irritantes juntas.
  if(level <= 5){
    deck = deck.filter(id => id !== "reb2" && id !== "curse2");
    return deck;
  }

  return deck;
}

function addArchetypeCards(deck, profile, level){
  if(level <= 5) return deck.slice(); // sem reforço de arquétipo no early
  const extra = [];
  if(profile.archetype === "tank"){
    extra.push("block7","block10","imm3");
    if(level >= 12) extra.push("blockall","defense1");
  } else if(profile.archetype === "venom"){
    extra.push("poison3","curse3","chaos2");
    if(level >= 12) extra.push("discard1","forcedheal");
    if(level >= 20) extra.push("poison5","chaos3");
  } else if(profile.archetype === "vamp"){
    extra.push("vamp5","reb3","atk8");
    if(level >= 12) extra.push("vamp8","combo");
    if(level >= 20) extra.push("troco","sacrifice1");
  }
  return deck.concat(extra);
}

function buildEnemyDeck(level, botChoices){
  const profile = getEnemyProfile(level);
  let deck = getEnemyStarterDeck(level);

  (botChoices || []).forEach(id => {
    const card = getCard(id);
    if(card){
      for(let i=0;i<card.copies;i++) deck.push(card.id);
    }
  });

  deck = addArchetypeCards(deck, profile, level);

  if(profile.boss){
    deck = deck.concat(BOSS_CARD_IDS[profile.archetype] || []);
  }

  return trimDeck(deck);
}
