
const ENERGY_PER_TURN = 3

const STARTER_CARDS = [
{id:"atk3",name:"Dano 3",cost:1,type:"attack",value:3},
{id:"atk5",name:"Dano 5",cost:1,type:"attack",value:5},
{id:"heal5",name:"Cura 5",cost:1,type:"heal",value:5},
{id:"block4",name:"Block 4",cost:1,type:"block",value:4},
{id:"venom1",name:"Veneno 1",cost:2,type:"poison",value:1}
]

const MID_CARDS=[
{id:"atk8",name:"Dano 8",cost:2,type:"attack",value:8},
{id:"atk10",name:"Dano 10",cost:3,type:"attack",value:10},
{id:"venom3",name:"Veneno 3",cost:3,type:"poison",value:3},
{id:"vamp5",name:"Vampiro 5",cost:2,type:"vamp",value:5}
]

const LATE_CARDS=[
{id:"atk15",name:"Dano 15",cost:3,type:"attack",value:15},
{id:"atk20",name:"Dano 20",cost:3,type:"attack",value:20},
{id:"sacrifice",name:"Sacrifício",cost:3,type:"sacrifice",value:18},
{id:"reboteMaster",name:"Rebote Master",cost:3,type:"rebote",value:10}
]

function getCard(id){
let all=[...STARTER_CARDS,...MID_CARDS,...LATE_CARDS]
return all.find(c=>c.id===id)
}
