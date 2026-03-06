
let playerDeck=[];
let enemyDeck=[];
let level=1;

function levelUp(){
 const choices=getRandomChoices(LEVEL_POOL);
 window.currentChoices=choices;
 showChoices();
}

function chooseCard(index){
 const chosen=currentChoices[index];
 const other=currentChoices[index===0?1:0];
 playerDeck.push(chosen.id);
 enemyDeck.push(other.id);
 level++;
 alert("Você pegou "+chosen.name+" | Inimigo recebeu "+other.name);
 startBattle();
}
