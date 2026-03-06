
const MAX_LEVEL = 30;
const BASE_HP = 35;

function getStarterDeck(){
 return STARTER_CARDS.map(c=>c.id);
}

function getRandomChoices(pool){
 const shuffled=[...pool].sort(()=>Math.random()-0.5);
 return [shuffled[0],shuffled[1]];
}
