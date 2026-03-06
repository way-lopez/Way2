
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

function generateChoice(level){

let pool=[]

if(tier(level)=="early") pool=STARTER_CARDS
if(tier(level)=="mid") pool=[...STARTER_CARDS,...MID_CARDS]
if(tier(level)=="late") pool=[...MID_CARDS,...LATE_CARDS]

let a=pool[Math.floor(Math.random()*pool.length)]
let b=pool[Math.floor(Math.random()*pool.length)]

while(a.id===b.id){
b=pool[Math.floor(Math.random()*pool.length)]
}

return [a,b]
}
