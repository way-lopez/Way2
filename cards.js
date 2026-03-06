
const MAX_HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;
const MAX_ACTIVE_DECK_SIZE = 22;

const STARTER_CARDS = [
  { id:"atk3", name:"Dano Básico 3", icon:"⚔️", type:"Ataque", rarity:"inicial", cost:1, copies:1, desc:"Causa 3 de dano.", power:3, effects:[{kind:"damage",value:3}] },
  { id:"atk5", name:"Dano Básico 5", icon:"⚔️", type:"Ataque", rarity:"inicial", cost:1, copies:1, desc:"Causa 5 de dano.", power:5, effects:[{kind:"damage",value:5}] },
  { id:"heal5", name:"+5 HP", icon:"💚", type:"Suporte", rarity:"inicial", cost:1, copies:1, desc:"Recupera 5 HP.", power:4, effects:[{kind:"heal",value:5}] },
  { id:"block4", name:"Block 4", icon:"🛡️", type:"Defesa", rarity:"inicial", cost:1, copies:1, desc:"Bloqueia 4 de dano.", power:4, effects:[{kind:"block",value:4}] },
  { id:"poison1", name:"Veneno -1", icon:"☠️", type:"Debuff", rarity:"inicial", cost:2, copies:1, desc:"4 dano + veneno 1.", power:6, effects:[{kind:"damage",value:4},{kind:"poison",value:1}] },
  { id:"vamp3", name:"Vampiro 3", icon:"🩸", type:"Ataque", rarity:"inicial", cost:2, copies:1, desc:"3 dano e cura 3.", power:6, effects:[{kind:"lifesteal",damage:3,heal:3}] },
  { id:"buff2", name:"Buff ATK 2", icon:"✨", type:"Buff", rarity:"inicial", cost:1, copies:1, desc:"+2 no dano dos seus ataques.", power:5, effects:[{kind:"buffatk",value:2}] },
  { id:"curse2", name:"Maldição 2", icon:"🔻", type:"Debuff", rarity:"inicial", cost:1, copies:1, desc:"Inimigo perde 2 de ataque.", power:5, effects:[{kind:"curse",value:2}] },
  { id:"imm1", name:"Imortal 1", icon:"🌿", type:"Buff", rarity:"inicial", cost:1, copies:1, desc:"Ganha 1 HP por turno.", power:4, effects:[{kind:"regen",value:1}] },
  { id:"reb2", name:"Rebote 2", icon:"↩️", type:"Buff", rarity:"inicial", cost:1, copies:1, desc:"Reflete 2 de dano ao sofrer ataque.", power:4, effects:[{kind:"rebote",value:2}] }
];

const LEVEL_POOL = [
  { id:"heal10", name:"+10 HP", icon:"💚", type:"Suporte", rarity:"media", cost:2, copies:2, desc:"Recupera 10 HP.", power:8, stage:"early", weight:4, effects:[{kind:"heal",value:10}] },
  { id:"heal15", name:"+15 HP", icon:"💚", type:"Suporte", rarity:"media", cost:3, copies:2, desc:"Recupera 15 HP.", power:11, stage:"mid", weight:3, effects:[{kind:"heal",value:15}] },
  { id:"heal20", name:"+20 HP", icon:"💚", type:"Suporte", rarity:"dificil", cost:3, copies:1, desc:"Recupera 20 HP.", power:14, stage:"late", weight:2, effects:[{kind:"heal",value:20}] },

  { id:"atk8", name:"Dano 8", icon:"⚔️", type:"Ataque", rarity:"media", cost:2, copies:2, desc:"Causa 8 de dano.", power:8, stage:"early", weight:4, effects:[{kind:"damage",value:8}] },
  { id:"atk10", name:"Dano 10", icon:"⚔️", type:"Ataque", rarity:"media", cost:3, copies:2, desc:"Causa 10 de dano.", power:10, stage:"mid", weight:4, effects:[{kind:"damage",value:10}] },
  { id:"atk15", name:"Dano 15", icon:"⚔️", type:"Ataque", rarity:"dificil", cost:3, copies:1, desc:"Causa 15 de dano.", power:15, stage:"late", weight:3, effects:[{kind:"damage",value:15}] },
  { id:"atk20", name:"Dano 20", icon:"⚔️", type:"Ataque", rarity:"dificil", cost:3, copies:1, desc:"Causa 20 de dano.", power:19, stage:"late", weight:2, effects:[{kind:"damage",value:20}] },

  { id:"poison3", name:"Veneno -3", icon:"☠️", type:"Debuff", rarity:"media", cost:3, copies:2, desc:"5 dano + veneno 3.", power:11, stage:"early", weight:3, effects:[{kind:"damage",value:5},{kind:"poison",value:3}] },
  { id:"poison5", name:"Veneno -5", icon:"☠️", type:"Debuff", rarity:"dificil", cost:3, copies:1, desc:"8 dano + veneno 5.", power:16, stage:"late", weight:2, effects:[{kind:"damage",value:8},{kind:"poison",value:5}] },

  { id:"vamp5", name:"Vampiro 5", icon:"🩸", type:"Ataque", rarity:"media", cost:2, copies:2, desc:"5 dano e cura 5.", power:10, stage:"early", weight:3, effects:[{kind:"lifesteal",damage:5,heal:5}] },
  { id:"vamp8", name:"Vampiro 8", icon:"🩸", type:"Ataque", rarity:"dificil", cost:3, copies:1, desc:"8 dano e cura 8.", power:15, stage:"late", weight:2, effects:[{kind:"lifesteal",damage:8,heal:8}] },

  { id:"block7", name:"Block 7", icon:"🛡️", type:"Defesa", rarity:"media", cost:1, copies:2, desc:"Bloqueia 7 de dano.", power:7, stage:"early", weight:4, effects:[{kind:"block",value:7}] },
  { id:"block10", name:"Block 10", icon:"🛡️", type:"Defesa", rarity:"media", cost:2, copies:2, desc:"Bloqueia 10 de dano.", power:10, stage:"mid", weight:3, effects:[{kind:"block",value:10}] },
  { id:"blockall", name:"Block Total", icon:"🧱", type:"Defesa", rarity:"dificil", cost:3, copies:1, desc:"Bloqueia totalmente o próximo dano.", power:16, stage:"late", weight:2, effects:[{kind:"blockall"}] },

  { id:"buff3", name:"Buff ATK 3", icon:"✨", type:"Buff", rarity:"media", cost:2, copies:2, desc:"+3 no dano dos seus ataques.", power:9, stage:"early", weight:3, effects:[{kind:"buffatk",value:3}] },
  { id:"buff5", name:"Buff ATK 5", icon:"✨", type:"Buff", rarity:"dificil", cost:3, copies:1, desc:"+5 no dano dos seus ataques.", power:13, stage:"late", weight:2, effects:[{kind:"buffatk",value:5}] },

  { id:"curse3", name:"Maldição 3", icon:"🔻", type:"Debuff", rarity:"media", cost:2, copies:2, desc:"Inimigo perde 3 de ataque.", power:8, stage:"early", weight:3, effects:[{kind:"curse",value:3}] },
  { id:"curse5", name:"Maldição 5", icon:"🔻", type:"Debuff", rarity:"dificil", cost:3, copies:1, desc:"Inimigo perde 5 de ataque.", power:12, stage:"late", weight:2, effects:[{kind:"curse",value:5}] },

  { id:"imm3", name:"Imortal 3", icon:"🌿", type:"Buff", rarity:"media", cost:2, copies:2, desc:"Ganha 3 HP por turno.", power:9, stage:"mid", weight:3, effects:[{kind:"regen",value:3}] },
  { id:"imm5", name:"Imortal 5", icon:"🌿", type:"Buff", rarity:"media", cost:3, copies:2, desc:"Ganha 5 HP por turno.", power:13, stage:"late", weight:2, effects:[{kind:"regen",value:5}] },

  { id:"reb3", name:"Rebote 3", icon:"↩️", type:"Buff", rarity:"media", cost:2, copies:2, desc:"Reflete 3 de dano.", power:8, stage:"mid", weight:3, effects:[{kind:"rebote",value:3}] },
  { id:"reb5", name:"Rebote 5", icon:"↩️", type:"Buff", rarity:"media", cost:3, copies:2, desc:"Reflete 5 de dano.", power:12, stage:"late", weight:2, effects:[{kind:"rebote",value:5}] },
  { id:"rebmaster", name:"Rebote Master", icon:"💥", type:"Buff", rarity:"dificil", cost:3, copies:1, desc:"Na próxima vez que sofrer ataque, devolve 10 de dano.", power:14, stage:"late", weight:1, effects:[{kind:"reboteonce",value:10}] },

  { id:"curepoison", name:"Cura do Veneno", icon:"🧪", type:"Suporte", rarity:"media", cost:1, copies:2, desc:"Remove veneno de si.", power:5, stage:"early", weight:3, effects:[{kind:"cleanse",targetEffect:"poison"}] },
  { id:"forcedheal", name:"Cura Forçada", icon:"🚫", type:"Suporte", rarity:"dificil", cost:2, copies:1, desc:"Remove Imortal do inimigo.", power:8, stage:"late", weight:2, effects:[{kind:"removeEnemyEffect",targetEffect:"regen"}] },
  { id:"exorcism", name:"Exorcismo", icon:"🚫", type:"Suporte", rarity:"media", cost:2, copies:2, desc:"Remove Imortal do inimigo.", power:7, stage:"mid", weight:2, effects:[{kind:"removeEnemyEffect",targetEffect:"regen"}] },
  { id:"nerfar", name:"Nerfar", icon:"🚫", type:"Suporte", rarity:"media", cost:2, copies:2, desc:"Remove Rebote do inimigo.", power:7, stage:"mid", weight:2, effects:[{kind:"removeEnemyEffect",targetEffect:"rebote"}] },
  { id:"rezet", name:"Rezet", icon:"🚫", type:"Suporte", rarity:"media", cost:2, copies:2, desc:"Remove Buff ATK do inimigo.", power:7, stage:"mid", weight:2, effects:[{kind:"removeEnemyEffect",targetEffect:"buffatk"}] },
  { id:"revitalize", name:"Revitalizar", icon:"🧪", type:"Suporte", rarity:"media", cost:1, copies:2, desc:"Remove maldição em si próprio.", power:5, stage:"mid", weight:2, effects:[{kind:"cleanse",targetEffect:"curse"}] },

  { id:"defense1", name:"Defesa", icon:"⛔", type:"Defesa", rarity:"dificil", cost:3, copies:1, desc:"Bloqueia todas as ações do inimigo por 1 turno.", power:12, stage:"mid", weight:2, effects:[{kind:"stunTurns",value:1}] },
  { id:"defense2", name:"Defesa 2", icon:"⛔", type:"Defesa", rarity:"dificil", cost:3, copies:1, desc:"Bloqueia todas as ações do inimigo por 2 turnos.", power:18, stage:"late", weight:1, effects:[{kind:"stunTurns",value:2}] },

  { id:"discard1", name:"Descarte 1", icon:"🗑️", type:"Debuff", rarity:"media", cost:2, copies:2, desc:"Inimigo descarta 1 carta da mão.", power:7, stage:"mid", weight:2, effects:[{kind:"discardEnemy",value:1}] },
  { id:"discard2", name:"Descarte 2", icon:"🗑️", type:"Debuff", rarity:"media", cost:3, copies:2, desc:"Inimigo descarta 2 cartas da mão.", power:10, stage:"late", weight:2, effects:[{kind:"discardEnemy",value:2}] },
  { id:"chaos2", name:"Caos 2", icon:"🎲", type:"Debuff", rarity:"media", cost:2, copies:2, desc:"Inimigo descarta 2 cartas e recebe 2 aleatórias no próximo turno.", power:8, stage:"mid", weight:2, effects:[{kind:"chaosEnemy",value:2}] },
  { id:"chaos3", name:"Caos 3", icon:"🎲", type:"Debuff", rarity:"dificil", cost:3, copies:1, desc:"Inimigo descarta 3 cartas e recebe 3 aleatórias.", power:12, stage:"late", weight:1, effects:[{kind:"chaosEnemy",value:3}] },
  { id:"fullchaos", name:"Completo Caos", icon:"🎲", type:"Debuff", rarity:"dificil", cost:3, copies:1, desc:"Troca toda a mão entre os jogadores.", power:12, stage:"late", weight:1, effects:[{kind:"swapHands"}] },

  { id:"troco", name:"Troco", icon:"🔁", type:"Debuff", rarity:"dificil", cost:2, copies:1, desc:"Devolve exatamente o último ataque sofrido.", power:9, stage:"mid", weight:2, effects:[{kind:"troco"}] },
  { id:"troca", name:"Troca", icon:"🃏", type:"Debuff", rarity:"dificil", cost:3, copies:1, desc:"Rouba uma carta aleatória da mão do inimigo e dá uma sua em troca.", power:8, stage:"late", weight:1, effects:[{kind:"tradeCard"}] },
  { id:"sacrifice1", name:"Sacrifício", icon:"🩸", type:"Ataque", rarity:"dificil", cost:3, copies:1, desc:"Perde 4 HP e causa 18 dano.", power:16, stage:"late", weight:1, effects:[{kind:"selfdamage",value:4},{kind:"damage",value:18}] },
  { id:"sacrifice2", name:"Sacrifício 2", icon:"🩸", type:"Ataque", rarity:"dificil", cost:3, copies:1, desc:"Perde 6 HP e causa 22 dano.", power:19, stage:"late", weight:1, effects:[{kind:"selfdamage",value:6},{kind:"damage",value:22}] },
  { id:"metamorph", name:"Metamorfosis", icon:"🪞", type:"Especial", rarity:"dificil", cost:2, copies:1, desc:"Copia o efeito de outra carta da sua mão.", power:10, stage:"late", weight:1, effects:[{kind:"metamorph"}] },
  { id:"combo", name:"Combo", icon:"⚡", type:"Especial", rarity:"dificil", cost:2, copies:1, desc:"No próximo turno, ganha energia extra.", power:10, stage:"late", weight:1, effects:[{kind:"combo"}] },

  { id:"ironwall", name:"Parede de Ferro", icon:"🧱", type:"Defesa", rarity:"boss", cost:2, copies:1, desc:"Bloqueia 14 de dano.", power:14, stage:"boss", weight:0, effects:[{kind:"block",value:14}], enemyOnly:true },
  { id:"toxicburst", name:"Explosão Tóxica", icon:"☣️", type:"Debuff", rarity:"boss", cost:3, copies:1, desc:"6 dano + veneno 4.", power:14, stage:"boss", weight:0, effects:[{kind:"damage",value:6},{kind:"poison",value:4}], enemyOnly:true },
  { id:"bloodmoon", name:"Lua de Sangue", icon:"🌕", type:"Ataque", rarity:"boss", cost:3, copies:1, desc:"9 dano e cura 9.", power:18, stage:"boss", weight:0, effects:[{kind:"lifesteal",damage:9,heal:9}], enemyOnly:true },
  { id:"voidhex", name:"Hex do Vazio", icon:"🕳️", type:"Debuff", rarity:"boss", cost:2, copies:1, desc:"Aplica maldição 4 e descarta 1 carta.", power:11, stage:"boss", weight:0, effects:[{kind:"curse",value:4},{kind:"discardEnemy",value:1}], enemyOnly:true }
];

const ALL_CARDS = [...STARTER_CARDS, ...LEVEL_POOL];

function getCard(cardId){ return ALL_CARDS.find(c => c.id === cardId) || null; }
function getStageRank(card){ const stage = card.stage || 'starter'; if(stage === 'starter') return 1; if(stage === 'early') return 2; if(stage === 'mid') return 3; if(stage === 'late') return 4; if(stage === 'boss') return 5; return 1; }
function getCardCssType(card){ const map = { 'Ataque':'ataque', 'Defesa':'defesa', 'Suporte':'suporte', 'Debuff':'debuff', 'Buff':'suporte', 'Especial':'especial' }; return map[card.type] || 'especial'; }
