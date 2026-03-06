
let level=1

let player={hp:40,deck:["atk3","atk5","heal5","block4","venom1"],hand:[],energy:3}
let enemy={}

function startBattle(){

document.getElementById("menu").style.display="none"
document.getElementById("battle").style.display="block"

let hp=getHP(level)

player.hp=hp
enemy.hp=hp

enemy.info=enemyForLevel(level)

document.getElementById("enemyName").innerText=enemy.info.name

drawHand()

updateUI()

}

function drawHand(){

player.hand=[]

for(let i=0;i<5;i++){
player.hand.push(player.deck[Math.floor(Math.random()*player.deck.length)])
}

renderHand()

}

function renderHand(){

let h=document.getElementById("hand")
h.innerHTML=""

player.hand.forEach((c,i)=>{

let card=getCard(c)

let el=document.createElement("div")
el.className="card"
el.innerText=card.name

el.onclick=()=>playCard(i)

h.appendChild(el)

})

}

function playCard(i){

let card=getCard(player.hand[i])

if(player.energy<card.cost)return

player.energy-=card.cost

if(card.type=="attack"){
enemy.hp-=card.value
}

if(card.type=="heal"){
player.hp+=card.value
}

if(card.type=="sacrifice"){
player.hp-=4
enemy.hp-=18
}

updateUI()

checkEnd()

}

function endTurn(){

enemyTurn()

player.energy=3
drawHand()

}

function enemyTurn(){

let dmg=3

if(enemy.info.type=="mage") dmg=5
if(enemy.info.type=="vamp") dmg=4
if(enemy.info.type=="tank") dmg=2

player.hp-=dmg

}

function updateUI(){

document.getElementById("playerHP").innerText=player.hp
document.getElementById("enemyHP").innerText=enemy.hp

}

function checkEnd(){

if(enemy.hp<=0){

level++

alert("Vitória! Nivel "+level)

location.reload()

}

if(player.hp<=0){

alert("Derrota")

location.reload()

}

}
