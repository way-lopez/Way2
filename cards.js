
const ENERGY_PER_TURN = 3

const STARTER_CARDS=[
{id:"atk3",name:"Dano 3",type:"attack",cost:1,value:3},
{id:"atk5",name:"Dano 5",type:"attack",cost:1,value:5},
{id:"heal5",name:"Cura 5",type:"heal",cost:1,value:5},
{id:"block4",name:"Block 4",type:"block",cost:1,value:4},
{id:"poison1",name:"Veneno 1",type:"poison",cost:2,value:1},
{id:"vamp3",name:"Vampiro 3",type:"vamp",cost:2,value:3},
{id:"buff2",name:"Buff 2",type:"buff",cost:1,value:2},
{id:"curse2",name:"Maldição 2",type:"curse",cost:1,value:2},
{id:"regen1",name:"Imortal 1",type:"regen",cost:1,value:1},
{id:"rebote2",name:"Rebote 2",type:"rebote",cost:1,value:2}
]

const MID_CARDS=[
{id:"atk8",name:"Dano 8",type:"attack",cost:2,value:8},
{id:"atk10",name:"Dano 10",type:"attack",cost:3,value:10},
{id:"poison3",name:"Veneno 3",type:"poison",cost:3,value:3},
{id:"vamp5",name:"Vampiro 5",type:"vamp",cost:2,value:5},
{id:"block7",name:"Block 7",type:"block",cost:2,value:7},
{id:"regen3",name:"Imortal 3",type:"regen",cost:2,value:3},
{id:"rebote3",name:"Rebote 3",type:"rebote",cost:2,value:3}
]

const LATE_CARDS=[
{id:"atk15",name:"Dano 15",type:"attack",cost:3,value:15},
{id:"atk20",name:"Dano 20",type:"attack",cost:3,value:20},
{id:"sacrifice",name:"Sacrifício",type:"sacrifice",cost:3,value:18},
{id:"reboteMaster",name:"Rebote Master",type:"rebote",cost:3,value:10},
{id:"blockAll",name:"Block Total",type:"blockall",cost:3,value:999}
]

function getCard(id){
let all=[...STARTER_CARDS,...MID_CARDS,...LATE_CARDS]
return all.find(c=>c.id===id)
}
