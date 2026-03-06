
const MAX_LEVEL=30
const BASE_HP=40

function getHP(level){
if(level<=10) return BASE_HP+(level-1)*2
if(level<=20) return BASE_HP+18+(level-10)
return BASE_HP+28
}

function tier(level){
if(level<=10) return "early"
if(level<=20) return "mid"
return "late"
}

function randomChoice(arr){
return arr[Math.floor(Math.random()*arr.length)]
}

function generateChoice(level){
let t=tier(level)
let pool=[]

if(t=="early") pool=STARTER_CARDS
if(t=="mid") pool=[...MID_CARDS,...STARTER_CARDS]
if(t=="late") pool=[...LATE_CARDS,...MID_CARDS]

let a=randomChoice(pool)
let b=randomChoice(pool)

while(b.id==a.id){
b=randomChoice(pool)
}

return [a,b]
}
