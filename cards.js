const STARTER_DECK=[
{id:"atk3",name:"Dano 3",cost:1,type:"attack",value:3},
{id:"atk5",name:"Dano 5",cost:1,type:"attack",value:5},
{id:"heal5",name:"Cura 5",cost:1,type:"heal",value:5},
{id:"block4",name:"Block 4",cost:1,type:"block",value:4},
{id:"poison1",name:"Veneno 1",cost:2,type:"poison",value:1},
{id:"vamp3",name:"Vampiro 3",cost:2,type:"vamp",value:3},
{id:"buff2",name:"Buff 2",cost:1,type:"buff",value:2},
{id:"curse2",name:"Maldição 2",cost:1,type:"curse",value:2},
{id:"regen1",name:"Imortal 1",cost:1,type:"regen",value:1},
{id:"reb2",name:"Rebote 2",cost:1,type:"rebote",value:2}
]

function getCard(id){
return STARTER_DECK.find(c=>c.id===id)
}
