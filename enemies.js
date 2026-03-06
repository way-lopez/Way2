function getEnemyTemplateForLevel(level){
  if(level <= 6) return { id:"slime", name:"Slime", baseHp:18 };
  if(level <= 13) return { id:"mage", name:"Mage", baseHp:24 };
  return { id:"vamp", name:"Vamp", baseHp:30 };
}
function buildEnemyDeck(level){
  const unlocked = getUnlockedCards(level);
  const deck = [];
  unlocked.forEach(cardId => {
    const card = getCard(cardId);
    if(!card) return;
    for(let i=0;i<card.copies;i++) deck.push(card.id);
  });
  return deck;
}
