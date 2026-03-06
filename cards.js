const MAX_HAND_SIZE = 5;
const BASE_CARDS = [
  { id:"burst", name:"Burst", type:"Ataque", target:"enemy", rarity:"rara", copies:1, desc:"Causa 7 de dano.", effects:[{ kind:"damage", value:7, tag:"normal" }] },
  { id:"piro", name:"Piro", type:"Ataque", target:"enemy", rarity:"comum", copies:3, desc:"Causa 4 de dano.", effects:[{ kind:"damage", value:4, tag:"normal" }] },
  { id:"heal", name:"Heal", type:"Suporte", target:"self", rarity:"comum", copies:3, desc:"Recupera 5 de HP.", effects:[{ kind:"heal", value:5 }] },
  { id:"guard", name:"Guard", type:"Suporte", target:"self", rarity:"comum", copies:3, desc:"Ganha 4 de bloqueio por 1 turno.", effects:[{ kind:"block", value:4, duration:1 }] },
  { id:"slash", name:"Slash", type:"Ataque", target:"enemy", rarity:"media", copies:2, desc:"Causa 6 de dano.", effects:[{ kind:"damage", value:6, tag:"normal" }] },
  { id:"drain", name:"Drain", type:"Ataque", target:"enemy", rarity:"media", copies:2, desc:"Causa 3 de dano e cura 3 HP.", effects:[{ kind:"lifesteal", damage:3, heal:3 }] },
  { id:"guardplus", name:"Guard+", type:"Suporte", target:"self", rarity:"media", copies:2, desc:"Ganha 6 de bloqueio por 1 turno.", effects:[{ kind:"block", value:6, duration:1 }] },
  { id:"recover", name:"Recover", type:"Suporte", target:"self", rarity:"media", copies:2, desc:"Recupera 4 de HP e compra 1 carta.", effects:[{ kind:"heal", value:4 }, { kind:"draw", value:1 }] },
  { id:"stab", name:"Stab", type:"Ataque", target:"enemy", rarity:"comum", copies:3, desc:"Causa 3 de dano.", effects:[{ kind:"damage", value:3, tag:"normal" }] },
  { id:"focus", name:"Focus", type:"Suporte", target:"self", rarity:"rara", copies:1, desc:"Compra 2 cartas.", effects:[{ kind:"draw", value:2 }] }
];
const EXTRA_CARDS = [
  { id:"curse", name:"Curse", type:"Debuff", target:"enemy", rarity:"media", copies:2, desc:"Aplica maldição por 3 turnos.", effects:[{ kind:"status", id:"curse", duration:3 }] },
  { id:"vampire", name:"Vampire", type:"Ataque", target:"enemy", rarity:"media", copies:2, desc:"Causa 5 de dano e recupera 2 HP.", effects:[{ kind:"lifesteal", damage:5, heal:2 }] },
  { id:"insight", name:"Insight", type:"Suporte", target:"self", rarity:"rara", copies:1, desc:"Compra 2 cartas.", effects:[{ kind:"draw", value:2 }] },
  { id:"poison", name:"Poison", type:"Debuff", target:"enemy", rarity:"media", copies:2, desc:"Aplica veneno por 3 turnos.", effects:[{ kind:"status", id:"poison", duration:3, value:2 }] },
  { id:"smash", name:"Smash", type:"Ataque", target:"enemy", rarity:"rara", copies:1, desc:"Causa 8 de dano.", effects:[{ kind:"damage", value:8, tag:"normal" }] },
  { id:"fortify", name:"Fortify", type:"Suporte", target:"self", rarity:"media", copies:2, desc:"Ganha 8 de bloqueio por 1 turno.", effects:[{ kind:"block", value:8, duration:1 }] },
  { id:"meditate", name:"Meditate", type:"Suporte", target:"self", rarity:"media", copies:2, desc:"Recupera 6 de HP.", effects:[{ kind:"heal", value:6 }] },
  { id:"venomslash", name:"Venom Slash", type:"Ataque", target:"enemy", rarity:"media", copies:2, desc:"Causa 4 de dano e aplica veneno.", effects:[{ kind:"damage", value:4, tag:"normal" }, { kind:"status", id:"poison", duration:2, value:2 }] },
  { id:"stun", name:"Stun", type:"Debuff", target:"enemy", rarity:"rara", copies:1, desc:"Aplica atordoamento por 1 turno.", effects:[{ kind:"status", id:"stun", duration:1 }] },
  { id:"doublehit", name:"Double Hit", type:"Ataque", target:"enemy", rarity:"media", copies:2, desc:"Causa 2 de dano duas vezes.", effects:[{ kind:"damage", value:2, tag:"normal" }, { kind:"damage", value:2, tag:"normal" }] },
  { id:"renew", name:"Renew", type:"Suporte", target:"self", rarity:"media", copies:2, desc:"Recupera 3 de HP e ganha 3 de bloqueio.", effects:[{ kind:"heal", value:3 }, { kind:"block", value:3, duration:1 }] },
  { id:"burn", name:"Burn", type:"Ataque", target:"enemy", rarity:"comum", copies:3, desc:"Causa 5 de dano.", effects:[{ kind:"damage", value:5, tag:"normal" }] },
  { id:"focusplus", name:"Focus+", type:"Suporte", target:"self", rarity:"rara", copies:1, desc:"Compra 3 cartas.", effects:[{ kind:"draw", value:3 }] },
  { id:"lifeburst", name:"Life Burst", type:"Ataque", target:"enemy", rarity:"rara", copies:1, desc:"Causa 6 de dano e recupera 4 HP.", effects:[{ kind:"lifesteal", damage:6, heal:4 }] },
  { id:"shieldwall", name:"Shield Wall", type:"Suporte", target:"self", rarity:"rara", copies:1, desc:"Ganha 10 de bloqueio.", effects:[{ kind:"block", value:10, duration:1 }] },
  { id:"antidote", name:"Antidote", type:"Suporte", target:"self", rarity:"media", copies:2, desc:"Remove veneno e recupera 4 HP.", effects:[{ kind:"cleanse", id:"poison" }, { kind:"heal", value:4 }] },
  { id:"hex", name:"Hex", type:"Debuff", target:"enemy", rarity:"media", copies:2, desc:"Aplica maldição por 4 turnos.", effects:[{ kind:"status", id:"curse", duration:4 }] },
  { id:"rush", name:"Rush", type:"Ataque", target:"enemy", rarity:"comum", copies:3, desc:"Causa 4 de dano e compra 1 carta.", effects:[{ kind:"damage", value:4, tag:"normal" }, { kind:"draw", value:1 }] },
  { id:"purge", name:"Purge", type:"Debuff", target:"enemy", rarity:"rara", copies:1, desc:"Causa 5 de dano e remove bloqueio do alvo.", effects:[{ kind:"remove_block" }, { kind:"damage", value:5, tag:"normal" }] },
  { id:"overload", name:"Overload", type:"Ataque", target:"enemy", rarity:"rara", copies:1, desc:"Causa 9 de dano.", effects:[{ kind:"damage", value:9, tag:"normal" }] }
];
const CARDS = [...BASE_CARDS, ...EXTRA_CARDS];
function getCard(cardId){ return CARDS.find(c => c.id === cardId) || null; }
