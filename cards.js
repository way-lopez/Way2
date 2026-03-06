
const MAX_HAND_SIZE = 5;

const STARTER_CARDS = [
{ id:"atk3",name:"Dano Básico 3",type:"Ataque",rarity:"starter",copies:3,desc:"Causa 3 de dano.",effects:[{kind:"damage",value:3}]},
{ id:"atk5",name:"Dano Básico 5",type:"Ataque",rarity:"starter",copies:2,desc:"Causa 5 de dano.",effects:[{kind:"damage",value:5}]},
{ id:"heal5",name:"+5 HP",type:"Suporte",rarity:"starter",copies:2,desc:"Recupera 5 HP.",effects:[{kind:"heal",value:5}]},
{ id:"block4",name:"Block 4",type:"Defesa",rarity:"starter",copies:2,desc:"Bloqueia 4 de dano.",effects:[{kind:"block",value:4}]},
{ id:"poison1",name:"Veneno -1",type:"Debuff",rarity:"starter",copies:1,desc:"4 dano + veneno 1.",effects:[{kind:"damage",value:4},{kind:"poison",value:1}]},
{ id:"vamp3",name:"Vampiro 3",type:"Ataque",rarity:"starter",copies:1,desc:"3 dano e cura 3.",effects:[{kind:"lifesteal",damage:3,heal:3}]},
{ id:"buff2",name:"Buff ATK 2",type:"Buff",rarity:"starter",copies:1,desc:"+2 dano permanente.",effects:[{kind:"buffatk",value:2}]},
{ id:"curse2",name:"Maldição 2",type:"Debuff",rarity:"starter",copies:1,desc:"Inimigo perde 2 ataque.",effects:[{kind:"curse",value:2}]},
{ id:"imm1",name:"Imortal 1",type:"Buff",rarity:"starter",copies:1,desc:"Ganha 1 HP por turno.",effects:[{kind:"regen",value:1}]},
{ id:"reb2",name:"Rebote 2",type:"Buff",rarity:"starter",copies:1,desc:"Reflete 2 dano.",effects:[{kind:"rebote",value:2}]}
];

const LEVEL_POOL = [
{ id:"heal10",name:"+10 HP",effects:[{kind:"heal",value:10}]},
{ id:"heal15",name:"+15 HP",effects:[{kind:"heal",value:15}]},
{ id:"atk8",name:"Dano 8",effects:[{kind:"damage",value:8}]},
{ id:"atk10",name:"Dano 10",effects:[{kind:"damage",value:10}]},
{ id:"poison3",name:"Veneno -3",effects:[{kind:"damage",value:5},{kind:"poison",value:3}]},
{ id:"vamp5",name:"Vampiro 5",effects:[{kind:"lifesteal",damage:5,heal:5}]},
{ id:"buff3",name:"Buff ATK 3",effects:[{kind:"buffatk",value:3}]},
{ id:"curse3",name:"Maldição 3",effects:[{kind:"curse",value:3}]},
{ id:"reb3",name:"Rebote 3",effects:[{kind:"rebote",value:3}]},
{ id:"imm3",name:"Imortal 3",effects:[{kind:"regen",value:3}]},
{ id:"heal20",name:"+20 HP",effects:[{kind:"heal",value:20}]},
{ id:"atk15",name:"Dano 15",effects:[{kind:"damage",value:15}]},
{ id:"atk20",name:"Dano 20",effects:[{kind:"damage",value:20}]},
{ id:"poison5",name:"Veneno -5",effects:[{kind:"damage",value:8},{kind:"poison",value:5}]},
{ id:"vamp8",name:"Vampiro 8",effects:[{kind:"lifesteal",damage:8,heal:8}]},
{ id:"buff5",name:"Buff ATK 5",effects:[{kind:"buffatk",value:5}]},
{ id:"curse5",name:"Maldição 5",effects:[{kind:"curse",value:5}]},
{ id:"reb5",name:"Rebote 5",effects:[{kind:"rebote",value:5}]},
{ id:"sacrifice",name:"Sacrifício",effects:[{kind:"selfdamage",value:4},{kind:"damage",value:18}]},
{ id:"combo",name:"Combo",effects:[{kind:"combo",value:3}]}
];
