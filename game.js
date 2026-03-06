
let level=1

let player={
hp:40,
energy:3,
deck:["atk3","atk5","heal5","block4","poison1","vamp3","buff2","curse2","regen1","rebote2"],
hand:[]
}

let enemy={}

function startBattle(){

document.getElementById("menu").classList.remove("active")
document.getElementById("battle").classList.add("active")

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

let c=player.deck[Math.floor(Math.random()*player.deck.length)]
player.hand.push(c)

}

renderHand()

}

function renderHand(){

let hand=document.getElementById("hand")
hand.innerHTML=""

player.hand.forEach((id,i)=>{

let card=getCard(id)

let div=document.createElement("div")
div.className="card"
div.innerText=card.name+" ("+card.cost+")"

div.onclick=()=>playCard(i)

hand.appendChild(div)

})

}

function playCard(i){

let card=getCard(player.hand[i])

if(player.energy<card.cost) return

player.energy-=card.cost

if(card.type=="attack") enemy.hp-=card.value
if(card.type=="heal") player.hp+=card.value
if(card.type=="sacrifice"){
player.hp-=4
enemy.hp-=18
}

if(card.type=="vamp"){
enemy.hp-=card.value
player.hp+=card.value
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

player.hp-=enemy.info.atk

updateUI()
checkEnd()

}

function updateUI(){

document.getElementById("playerHP").innerText=player.hp
document.getElementById("enemyHP").innerText=enemy.hp
document.getElementById("energy").innerText=player.energy

}

function checkEnd(){

if(enemy.hp<=0){

level++

alert("Vitória! Próximo nível "+level)

location.reload()

}

if(player.hp<=0){

alert("Derrota")

location.reload()

}

}
