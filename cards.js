const MAX_HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;
const DECK_LIMIT = 22;

const CARD_TYPES = {
  attack:{label:"Ataque", icon:"⚔️", css:"attack"},
  defense:{label:"Defesa", icon:"🛡️", css:"defense"},
  buff:{label:"Buff", icon:"✨", css:"buff"},
  debuff:{label:"Debuff", icon:"☠️", css:"debuff"},
  special:{label:"Especial", icon:"🌀", css:"special"},
  support:{label:"Suporte", icon:"💚", css:"buff"}
};

const STARTER_CARDS = [
  { id:"atk3", name:"Dano Básico 3", type:"attack", rarity:"inicial", cost:1, copies:1, power:1, desc:"Causa 3 de dano.", effects:[{kind:"damage",value:3}] },
  { id:"atk5", name:"Dano Básico 5", type:"attack", rarity:"inicial", cost:1, copies:1, power:2, desc:"Causa 5 de dano.", effects:[{kind:"damage",value:5}] },
  { id:"heal5", name:"+5 HP", type:"support", rarity:"inicial", cost:1, copies:1, power:1, desc:"Recupera 5 HP.", effects:[{kind:"heal",value:5}] },
  { id:"block4", name:"Block 4", type:"defense", rarity:"inicial", cost:1, copies:1, power:1, desc:"Bloqueia 4 de dano.", effects:[{kind:"block",value:4}] },
  { id:"poison1", name:"Veneno -1", type:"debuff", rarity:"inicial", cost:2, copies:1, power:3, desc:"4 dano + veneno 1.", effects:[{kind:"damage",value:4},{kind:"poison",value:1}] },
  { id:"vamp3", name:"Vampiro 3", type:"attack", rarity:"inicial", cost:2, copies:1, power:3, desc:"3 dano e cura 3.", effects:[{kind:"lifesteal",damage:3,heal:3}] },
  { id:"buff2", name:"Buff ATK 2", type:"buff", rarity:"inicial", cost:1, copies:1, power:2, desc:"+2 no dano dos seus ataques.", effects:[{kind:"buffatk",value:2}] },
  { id:"curse2", name:"Maldição 2", type:"debuff", rarity:"inicial", cost:1, copies:1, power:2, desc:"Inimigo perde 2 de ataque.", effects:[{kind:"curse",value:2}] },
  { id:"imm1", name:"Imortal 1", type:"buff", rarity:"inicial", cost:1, copies:1, power:2, desc:"Ganha 1 HP por turno.", effects:[{kind:"regen",value:1}] },
  { id:"reb2", name:"Rebote 2", type:"buff", rarity:"inicial", cost:1, copies:1, power:2, desc:"Reflete 2 de dano ao sofrer ataque.", effects:[{kind:"rebote",value:2}] }
];

const LEVEL_POOL = [
  { id:"heal10", name:"+10 HP", type:"support", rarity:"media", cost:2, copies:2, power:4, desc:"Recupera 10 HP.", effects:[{kind:"heal",value:10}], tier:"media" },
  { id:"heal15", name:"+15 HP", type:"support", rarity:"media", cost:3, copies:2, power:5, desc:"Recupera 15 HP.", effects:[{kind:"heal",value:15}], tier:"media" },
  { id:"heal20", name:"+20 HP", type:"support", rarity:"dificil", cost:3, copies:1, power:7, desc:"Recupera 20 HP.", effects:[{kind:"heal",value:20}], tier:"dificil" },

  { id:"atk8", name:"Dano 8", type:"attack", rarity:"media", cost:2, copies:2, power:4, desc:"Causa 8 de dano.", effects:[{kind:"damage",value:8}], tier:"media" },
  { id:"atk10", name:"Dano 10", type:"attack", rarity:"media", cost:3, copies:2, power:5, desc:"Causa 10 de dano.", effects:[{kind:"damage",value:10}], tier:"media" },
  { id:"atk15", name:"Dano 15", type:"attack", rarity:"dificil", cost:3, copies:1, power:8, desc:"Causa 15 de dano.", effects:[{kind:"damage",value:15}], tier:"dificil" },
  { id:"atk20", name:"Dano 20", type:"attack", rarity:"dificil", cost:3, copies:1, power:10, desc:"Causa 20 de dano.", effects:[{kind:"damage",value:20}], tier:"dificil" },

  { id:"poison3", name:"Veneno -3", type:"debuff", rarity:"media", cost:3, copies:2, power:6, desc:"5 dano + veneno 3.", effects:[{kind:"damage",value:5},{kind:"poison",value:3}], tier:"media" },
  { id:"poison5", name:"Veneno -5", type:"debuff", rarity:"dificil", cost:3, copies:1, power:9, desc:"8 dano + veneno 5.", effects:[{kind:"damage",value:8},{kind:"poison",value:5}], tier:"dificil" },

  { id:"vamp5", name:"Vampiro 5", type:"attack", rarity:"media", cost:2, copies:2, power:5, desc:"5 dano e cura 5.", effects:[{kind:"lifesteal",damage:5,heal:5}], tier:"media" },
  { id:"vamp8", name:"Vampiro 8", type:"attack", rarity:"dificil", cost:3, copies:1, power:8, desc:"8 dano e cura 8.", effects:[{kind:"lifesteal",damage:8,heal:8}], tier:"dificil" },

  { id:"block7", name:"Block 7", type:"defense", rarity:"media", cost:1, copies:2, power:4, desc:"Bloqueia 7 de dano.", effects:[{kind:"block",value:7}], tier:"media" },
  { id:"block10", name:"Block 10", type:"defense", rarity:"media", cost:2, copies:2, power:5, desc:"Bloqueia 10 de dano.", effects:[{kind:"block",value:10}], tier:"media" },
  { id:"blockall", name:"Block Total", type:"defense", rarity:"dificil", cost:3, copies:1, power:8, desc:"Bloqueia totalmente o próximo dano.", effects:[{kind:"blockall"}], tier:"dificil" },

  { id:"buff3", name:"Buff ATK 3", type:"buff", rarity:"media", cost:2, copies:2, power:5, desc:"+3 no dano dos seus ataques.", effects:[{kind:"buffatk",value:3}], tier:"media" },
  { id:"buff5", name:"Buff ATK 5", type:"buff", rarity:"dificil", cost:3, copies:1, power:8, desc:"+5 no dano dos seus ataques.", effects:[{kind:"buffatk",value:5}], tier:"dificil" },

  { id:"curse3", name:"Maldição 3", type:"debuff", rarity:"media", cost:2, copies:2, power:5, desc:"Inimigo perde 3 de ataque.", effects:[{kind:"curse",value:3}], tier:"media" },
  { id:"curse5", name:"Maldição 5", type:"debuff", rarity:"dificil", cost:3, copies:1, power:8, desc:"Inimigo perde 5 de ataque.", effects:[{kind:"curse",value:5}], tier:"dificil" },

  { id:"imm3", name:"Imortal 3", type:"buff", rarity:"media", cost:2, copies:2, power:5, desc:"Ganha 3 HP por turno.", effects:[{kind:"regen",value:3}], tier:"media" },
  { id:"imm5", name:"Imortal 5", type:"buff", rarity:"media", cost:3, copies:2, power:7, desc:"Ganha 5 HP por turno.", effects:[{kind:"regen",value:5}], tier:"media" },

  { id:"reb3", name:"Rebote 3", type:"buff", rarity:"media", cost:2, copies:2, power:5, desc:"Reflete 3 de dano.", effects:[{kind:"rebote",value:3}], tier:"media" },
  { id:"reb5", name:"Rebote 5", type:"buff", rarity:"media", cost:3, copies:2, power:7, desc:"Reflete 5 de dano.", effects:[{kind:"rebote",value:5}], tier:"media" },
  { id:"rebmaster", name:"Rebote Master", type:"buff", rarity:"dificil", cost:3, copies:1, power:8, desc:"Na próxima vez que sofrer ataque, devolve 10 de dano.", effects:[{kind:"reboteonce",value:10}], tier:"dificil" },

  { id:"curepoison", name:"Cura do Veneno", type:"support", rarity:"media", cost:1, copies:2, power:3, desc:"Remove veneno de si.", effects:[{kind:"cleanse",targetEffect:"poison"}], tier:"media" },
  { id:"forcedheal", name:"Cura Forçada", type:"support", rarity:"dificil", cost:2, copies:1, power:6, desc:"Remove Imortal do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"regen"}], tier:"dificil" },
  { id:"exorcism", name:"Exorcismo", type:"support", rarity:"media", cost:2, copies:2, power:5, desc:"Remove Imortal do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"regen"}], tier:"media" },
  { id:"nerfar", name:"Nerfar", type:"support", rarity:"media", cost:2, copies:2, power:5, desc:"Remove Rebote do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"rebote"}], tier:"media" },
  { id:"rezet", name:"Rezet", type:"support", rarity:"media", cost:2, copies:2, power:5, desc:"Remove Buff ATK do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"buffatk"}], tier:"media" },
  { id:"revitalize", name:"Revitalizar", type:"support", rarity:"media", cost:1, copies:2, power:3, desc:"Remove maldição em si próprio.", effects:[{kind:"cleanse",targetEffect:"curse"}], tier:"media" },

  { id:"defense1", name:"Defesa", type:"defense", rarity:"dificil", cost:3, copies:1, power:8, desc:"Bloqueia todas as ações do inimigo por 1 turno.", effects:[{kind:"stunTurns",value:1}], tier:"dificil" },
  { id:"defense2", name:"Defesa 2", type:"defense", rarity:"dificil", cost:3, copies:1, power:10, desc:"Bloqueia todas as ações do inimigo por 2 turnos.", effects:[{kind:"stunTurns",value:2}], tier:"dificil" },

  { id:"discard1", name:"Descarte 1", type:"debuff", rarity:"media", cost:2, copies:2, power:4, desc:"Inimigo descarta 1 carta da mão.", effects:[{kind:"discardEnemy",value:1}], tier:"media" },
  { id:"discard2", name:"Descarte 2", type:"debuff", rarity:"media", cost:3, copies:2, power:6, desc:"Inimigo descarta 2 cartas da mão.", effects:[{kind:"discardEnemy",value:2}], tier:"media" },
  { id:"chaos2", name:"Caos 2", type:"debuff", rarity:"media", cost:2, copies:2, power:5, desc:"Inimigo descarta 2 cartas e recebe 2 aleatórias.", effects:[{kind:"chaosEnemy",value:2}], tier:"media" },
  { id:"chaos3", name:"Caos 3", type:"debuff", rarity:"dificil", cost:3, copies:1, power:8, desc:"Inimigo descarta 3 cartas e recebe 3 aleatórias.", effects:[{kind:"chaosEnemy",value:3}], tier:"dificil" },
  { id:"fullchaos", name:"Completo Caos", type:"special", rarity:"dificil", cost:3, copies:1, power:8, desc:"Troca toda a mão entre os jogadores.", effects:[{kind:"swapHands"}], tier:"dificil" },

  { id:"troco", name:"Troco", type:"special", rarity:"dificil", cost:2, copies:1, power:7, desc:"Devolve exatamente o último ataque sofrido.", effects:[{kind:"troco"}], tier:"dificil" },
  { id:"troca", name:"Troca", type:"special", rarity:"dificil", cost:3, copies:1, power:7, desc:"Rouba uma carta aleatória da mão do inimigo e dá uma sua em troca.", effects:[{kind:"tradeCard"}], tier:"dificil" },
  { id:"sacrifice1", name:"Sacrifício", type:"attack", rarity:"dificil", cost:3, copies:1, power:9, desc:"Perde 4 HP e causa 18 dano.", effects:[{kind:"selfdamage",value:4},{kind:"damage",value:18}], tier:"dificil" },
  { id:"sacrifice2", name:"Sacrifício 2", type:"attack", rarity:"dificil", cost:3, copies:1, power:10, desc:"Perde 6 HP e causa 22 dano.", effects:[{kind:"selfdamage",value:6},{kind:"damage",value:22}], tier:"dificil" },
  { id:"metamorph", name:"Metamorfosis", type:"special", rarity:"dificil", cost:2, copies:1, power:7, desc:"Copia o efeito de outra carta da sua mão.", effects:[{kind:"metamorph"}], tier:"dificil" },
  { id:"combo", name:"Combo", type:"special", rarity:"dificil", cost:2, copies:1, power:8, desc:"No próximo turno, ganha energia extra.", effects:[{kind:"combo"}], tier:"dificil" }
];

const ALL_CARDS = [...STARTER_CARDS, ...LEVEL_POOL];

function getCard(id){ return ALL_CARDS.find(c => c.id === id) || null; }

function getCardVisual(card){
  return CARD_TYPES[card.type] || {label:"Carta", icon:"🃏", css:"special"};
}
