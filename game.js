let level=1

let player={hp:40,energy:3,deck:["atk3","atk5","heal5","block4","poison1"],hand:[]}
let enemy={}

function startBattle(){
document.getElementById("menu").classList.remove("active")
document.getElementById("battle").classList.add("active")

let hp=getHP(level)

player.hp=hp
enemy=getEnemy(level)
enemy.hp=hp

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
let hand=document.getElementById("hand")
hand.innerHTML=""
player.hand.forEach((id,i)=>{
let card=getCard(id)
let div=document.createElement("div")
div.className="card"
div.innerHTML=card.name+"<br>Cost:"+card.cost
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
updateUI()
}

function updateUI(){
document.getElementById("playerHPText").innerText=player.hp
document.getElementById("enemyHPText").innerText=enemy.hp
document.getElementById("playerHPFill").style.width=(player.hp)+"%"
document.getElementById("enemyHPFill").style.width=(enemy.hp)+"%"
document.getElementById("energyText").innerText="Energia: "+player.energy+"/3"
}
