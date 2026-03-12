const MAX_HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;
const DECK_LIMIT = 24;

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
  { id:"reb2", name:"Rebote 2", type:"buff", rarity:"inicial", cost:1, copies:1, power:2, desc:"Reflete 2 de dano ao sofrer ataque.", effects:[{kind:"rebote",value:2}] },
  { id:"curepoison", name:"Cura do Veneno", type:"support", rarity:"inicial", cost:1, copies:1, power:3, desc:"Remove veneno de si.", effects:[{kind:"cleanse",targetEffect:"poison"}] },
  { id:"revitalize", name:"Revitalizar", type:"support", rarity:"inicial", cost:1, copies:1, power:3, desc:"Remove maldição em si próprio.", effects:[{kind:"cleanse",targetEffect:"curse"}] },
  { id:"nerfar", name:"Nerfar", type:"support", rarity:"inicial", cost:2, copies:1, power:4, desc:"Remove Rebote do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"rebote"}] },
  { id:"rezet", name:"Rezet", type:"support", rarity:"inicial", cost:2, copies:1, power:4, desc:"Remove Buff ATK do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"buffatk"}] }
];

const LEVEL_POOL = [
  { id:"exorcism", name:"Exorcismo", type:"support", rarity:"media", cost:2, copies:2, power:5, desc:"Remove Imortal do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"regen"}], tier:"media" },

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

  { id:"forcedheal", name:"Cura Forçada", type:"support", rarity:"dificil", cost:2, copies:1, power:6, desc:"Remove Imortal do inimigo.", effects:[{kind:"removeEnemyEffect",targetEffect:"regen"}], tier:"dificil" },

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


function getCardShortEffect(card){
  const e = card.effects || [];
  if(card.id.startsWith("heal")) return "+" + (e[0]?.value || 0) + " HP";
  if(card.id.startsWith("atk")) return "-" + (e[0]?.value || 0) + " HP";
  if(card.id.startsWith("poison")) return "☠ " + (e[1]?.value || e[0]?.value || 1);
  if(card.id.startsWith("vamp")) return "Drena " + (e[0]?.damage || 0);
  if(card.id.startsWith("block")) return "🛡 " + ((e[0] && e[0].value) || "∞");
  if(card.id.startsWith("buff")) return "ATK +" + (e[0]?.value || 0);
  if(card.id.startsWith("curse")) return "ATK -" + (e[0]?.value || 0);
  if(card.id.startsWith("imm")) return "HP/turno +" + (e[0]?.value || 0);
  if(card.id.startsWith("reb")) return "↩ " + (e[0]?.value || 0);
  if(card.id === "curepoison") return "remove veneno";
  if(card.id === "revitalize") return "remove maldição";
  if(card.id === "nerfar") return "remove rebote";
  if(card.id === "rezet") return "remove buff";
  if(card.id === "exorcism" || card.id === "forcedheal") return "remove imortal";
  if(card.id.startsWith("defense")) return "paralisa";
  if(card.id.startsWith("discard")) return "descarta";
  if(card.id.startsWith("chaos")) return "embaralha";
  if(card.id === "fullchaos") return "troca mãos";
  if(card.id === "troco") return "reflete";
  if(card.id === "troca") return "rouba carta";
  if(card.id.startsWith("sacrifice")) return "alto dano";
  if(card.id === "metamorph") return "copia";
  if(card.id === "combo") return "turno forte";
  return card.desc;
}

const CARD_DETAIL_OVERRIDES = {
  curepoison: {
    long: "Remove o efeito de veneno do usuário. É a resposta direta contra estratégias que tentam drenar sua vida aos poucos. Quando o veneno está alto, esta carta costuma valer mais do que simplesmente curar.",
    tip: "Use quando o veneno estiver atrapalhando sua sobrevivência futura. Melhor ainda se vier antes de uma sequência de cartas agressivas do inimigo."
  },
  revitalize: {
    long: "Remove a maldição do usuário. Maldição reduz o impacto dos seus ataques e enfraquece sua pressão ofensiva. Esta carta devolve seu poder natural.",
    tip: "Vale mais quando você está com cartas de dano fortes na mão e não quer perder eficiência."
  },
  nerfar: {
    long: "Corta o efeito de Rebote do inimigo. Serve para impedir que ataques seus voltem contra você, principalmente quando o oponente está acumulando reflexo de dano.",
    tip: "Jogue antes de uma sequência agressiva ou antes de uma carta de alto dano."
  },
  rezet: {
    long: "Remove o Buff de ataque do inimigo. É uma carta de controle que evita explosões de dano no turno seguinte.",
    tip: "Guarde quando perceber que o inimigo está preparando cartas de dano mais pesado."
  },
  exorcism: {
    long: "Remove o efeito de Imortal do inimigo, cortando sua regeneração por turno. É a resposta ideal contra adversários que querem alongar a luta.",
    tip: "Use logo após o inimigo ativar regeneração alta, para não perder vários turnos de pressão."
  },
  forcedheal: {
    long: "Anula a regeneração do inimigo, funcionando como uma versão mais forte de resposta contra cura por turno.",
    tip: "Excelente contra bosses e inimigos tank."
  },
  troco: {
    long: "Devolve exatamente o último efeito ofensivo que você sofreu. Se o golpe anterior foi grande, Troco pode virar a batalha na hora.",
    tip: "Segure para responder cartas perigosas. Quanto mais forte o impacto recebido, mais valor ela devolve."
  },
  troca: {
    long: "Rouba uma carta da mão do inimigo e entrega uma sua em troca. Ela muda o ritmo da luta e pode tanto atrapalhar a estratégia inimiga quanto te dar uma peça forte.",
    tip: "Funciona melhor quando sua mão está fraca e você quer embaralhar as possibilidades."
  },
  fullchaos: {
    long: "Troca todas as cartas da mão entre os jogadores. É uma carta caótica, de alto risco e alto potencial de virada.",
    tip: "Use quando sua mão estiver ruim e a do inimigo parecer muito melhor."
  },
  metamorph: {
    long: "Copia o efeito de outra carta da sua mão, sem consumi-la. Isso permite repetir uma jogada importante ou adaptar-se ao momento da luta.",
    tip: "Brilha quando você já tem uma carta perfeita para o turno atual."
  },
  combo: {
    long: "Prepara um turno seguinte com energia extra, permitindo uma sequência mais explosiva. É uma carta de preparo e tempo.",
    tip: "Melhor quando você já tem ou espera comprar cartas fortes para o turno seguinte."
  }
};

function getCardDetailedText(card){
  if(CARD_DETAIL_OVERRIDES[card.id]) return CARD_DETAIL_OVERRIDES[card.id].long;
  const e = card.effects || [];
  const parts = [];
  e.forEach(effect => {
    if(effect.kind === "damage") parts.push("causa " + effect.value + " de dano ao alvo");
    if(effect.kind === "heal") parts.push("recupera " + effect.value + " pontos de vida");
    if(effect.kind === "block") parts.push("gera " + effect.value + " pontos de bloqueio");
    if(effect.kind === "blockall") parts.push("bloqueia completamente o próximo golpe recebido");
    if(effect.kind === "poison") parts.push("aplica veneno " + effect.value + ", causando dano contínuo por turno");
    if(effect.kind === "lifesteal") parts.push("causa " + effect.damage + " de dano e ainda cura " + effect.heal + " de vida");
    if(effect.kind === "buffatk") parts.push("aumenta em " + effect.value + " o poder ofensivo dos seus ataques");
    if(effect.kind === "curse") parts.push("reduz em " + effect.value + " o poder ofensivo do inimigo");
    if(effect.kind === "regen") parts.push("faz você recuperar " + effect.value + " de vida por turno");
    if(effect.kind === "rebote") parts.push("devolve " + effect.value + " de dano toda vez que sofrer ataque");
    if(effect.kind === "reboteonce") parts.push("na próxima vez que sofrer um ataque, devolve " + effect.value + " de dano");
    if(effect.kind === "cleanse") parts.push("remove o efeito de " + effect.targetEffect + " do usuário");
    if(effect.kind === "removeEnemyEffect") parts.push("remove o efeito de " + effect.targetEffect + " do inimigo");
    if(effect.kind === "stunTurns") parts.push("impede o inimigo de agir por " + effect.value + " turno(s)");
    if(effect.kind === "discardEnemy") parts.push("obriga o inimigo a descartar " + effect.value + " carta(s)");
    if(effect.kind === "chaosEnemy") parts.push("faz o inimigo descartar e recomprar " + effect.value + " carta(s)");
    if(effect.kind === "swapHands") parts.push("troca toda a mão entre você e o inimigo");
    if(effect.kind === "selfdamage") parts.push("faz você perder " + effect.value + " de vida como custo");
  });
  if(parts.length === 0) return card.desc;
  return "Quando usada, esta carta " + parts.join(", ") + ".";
}

function getCardStrategyText(card){
  if(CARD_DETAIL_OVERRIDES[card.id]) return CARD_DETAIL_OVERRIDES[card.id].tip;
  if(card.type === "attack") return "Boa para pressionar, finalizar o inimigo ou aproveitar buffs de ataque.";
  if(card.type === "defense") return "Ideal para sobreviver a turnos perigosos e reduzir a eficiência da ofensiva inimiga.";
  if(card.type === "buff") return "Fica mais forte quando usada antes de cartas ofensivas ou em momentos de vantagem.";
  if(card.type === "debuff") return "Excelente para quebrar o ritmo do inimigo e abrir espaço para sua estratégia.";
  if(card.type === "special") return "É uma carta tática. O momento certo costuma valer mais do que jogá-la cedo demais.";
  if(card.type === "support") return "Ajuda a estabilizar a partida e manter sua jornada viva por mais tempo.";
  return "Use de acordo com o momento da luta.";
}

const ALL_CARDS = [...STARTER_CARDS, ...LEVEL_POOL];
const CARD_BY_ID = Object.fromEntries(ALL_CARDS.map(card => [card.id, card]));

function getCard(id){ return CARD_BY_ID[id] || null; }

function getCardVisual(card){
  return CARD_TYPES[card.type] || {label:"Carta", icon:"🃏", css:"special"};
}

const CARD_NAME_I18N = {
  "atk3": {
    "pt": "Dano Básico 3",
    "en": "Basic Damage 3",
    "es": "Daño Básico 3"
  },
  "atk5": {
    "pt": "Dano Básico 5",
    "en": "Basic Damage 5",
    "es": "Daño Básico 5"
  },
  "heal5": {
    "pt": "+5 HP",
    "en": "+5 HP",
    "es": "+5 HP"
  },
  "block4": {
    "pt": "Block 4",
    "en": "Block 4",
    "es": "Block 4"
  },
  "poison1": {
    "pt": "Veneno -1",
    "en": "Poison -1",
    "es": "Veneno -1"
  },
  "vamp3": {
    "pt": "Vampiro 3",
    "en": "Vampire 3",
    "es": "Vampiro 3"
  },
  "buff2": {
    "pt": "Buff ATK 2",
    "en": "ATK Buff 2",
    "es": "Buff ATQ 2"
  },
  "curse2": {
    "pt": "Maldição 2",
    "en": "Curse 2",
    "es": "Maldición 2"
  },
  "imm1": {
    "pt": "Imortal 1",
    "en": "Immortal 1",
    "es": "Inmortal 1"
  },
  "reb2": {
    "pt": "Rebote 2",
    "en": "Rebound 2",
    "es": "Rebote 2"
  },
  "curepoison": {
    "pt": "Cura do Veneno",
    "en": "Poison Cure",
    "es": "Cura del Veneno"
  },
  "revitalize": {
    "pt": "Revitalizar",
    "en": "Revitalize",
    "es": "Revitalizar"
  },
  "nerfar": {
    "pt": "Nerfar",
    "en": "Nerf",
    "es": "Nerfear"
  },
  "rezet": {
    "pt": "Rezet",
    "en": "Reset",
    "es": "Rezet"
  },
  "exorcism": {
    "pt": "Exorcismo",
    "en": "Exorcism",
    "es": "Exorcismo"
  },
  "heal10": {
    "pt": "+10 HP",
    "en": "+10 HP",
    "es": "+10 HP"
  },
  "heal15": {
    "pt": "+15 HP",
    "en": "+15 HP",
    "es": "+15 HP"
  },
  "heal20": {
    "pt": "+20 HP",
    "en": "+20 HP",
    "es": "+20 HP"
  },
  "atk8": {
    "pt": "Dano 8",
    "en": "Damage 8",
    "es": "Daño 8"
  },
  "atk10": {
    "pt": "Dano 10",
    "en": "Damage 10",
    "es": "Daño 10"
  },
  "atk15": {
    "pt": "Dano 15",
    "en": "Damage 15",
    "es": "Daño 15"
  },
  "atk20": {
    "pt": "Dano 20",
    "en": "Damage 20",
    "es": "Daño 20"
  },
  "poison3": {
    "pt": "Veneno -3",
    "en": "Poison -3",
    "es": "Veneno -3"
  },
  "poison5": {
    "pt": "Veneno -5",
    "en": "Poison -5",
    "es": "Veneno -5"
  },
  "vamp5": {
    "pt": "Vampiro 5",
    "en": "Vampire 5",
    "es": "Vampiro 5"
  },
  "vamp8": {
    "pt": "Vampiro 8",
    "en": "Vampire 8",
    "es": "Vampiro 8"
  },
  "block7": {
    "pt": "Block 7",
    "en": "Block 7",
    "es": "Block 7"
  },
  "block10": {
    "pt": "Block 10",
    "en": "Block 10",
    "es": "Block 10"
  },
  "blockall": {
    "pt": "Block Total",
    "en": "Total Block",
    "es": "Bloqueo Total"
  },
  "buff3": {
    "pt": "Buff ATK 3",
    "en": "ATK Buff 3",
    "es": "Buff ATQ 3"
  },
  "buff5": {
    "pt": "Buff ATK 5",
    "en": "ATK Buff 5",
    "es": "Buff ATQ 5"
  },
  "curse3": {
    "pt": "Maldição 3",
    "en": "Curse 3",
    "es": "Maldición 3"
  },
  "curse5": {
    "pt": "Maldição 5",
    "en": "Curse 5",
    "es": "Maldición 5"
  },
  "imm3": {
    "pt": "Imortal 3",
    "en": "Immortal 3",
    "es": "Inmortal 3"
  },
  "imm5": {
    "pt": "Imortal 5",
    "en": "Immortal 5",
    "es": "Inmortal 5"
  },
  "reb3": {
    "pt": "Rebote 3",
    "en": "Rebound 3",
    "es": "Rebote 3"
  },
  "reb5": {
    "pt": "Rebote 5",
    "en": "Rebound 5",
    "es": "Rebote 5"
  },
  "rebmaster": {
    "pt": "Rebote Master",
    "en": "Master Rebound",
    "es": "Rebote Maestro"
  },
  "forcedheal": {
    "pt": "Cura Forçada",
    "en": "Forced Heal",
    "es": "Curación Forzada"
  },
  "defense1": {
    "pt": "Defesa",
    "en": "Defense",
    "es": "Defensa"
  },
  "defense2": {
    "pt": "Defesa 2",
    "en": "Defense 2",
    "es": "Defensa 2"
  },
  "discard1": {
    "pt": "Descarte 1",
    "en": "Discard 1",
    "es": "Descarte 1"
  },
  "discard2": {
    "pt": "Descarte 2",
    "en": "Discard 2",
    "es": "Descarte 2"
  },
  "chaos2": {
    "pt": "Caos 2",
    "en": "Chaos 2",
    "es": "Caos 2"
  },
  "chaos3": {
    "pt": "Caos 3",
    "en": "Chaos 3",
    "es": "Caos 3"
  },
  "fullchaos": {
    "pt": "Completo Caos",
    "en": "Complete Chaos",
    "es": "Caos Completo"
  },
  "troco": {
    "pt": "Troco",
    "en": "Counterstrike",
    "es": "Contragolpe"
  },
  "troca": {
    "pt": "Troca",
    "en": "Swap",
    "es": "Intercambio"
  },
  "sacrifice1": {
    "pt": "Sacrifício",
    "en": "Sacrifice",
    "es": "Sacrificio"
  },
  "sacrifice2": {
    "pt": "Sacrifício 2",
    "en": "Sacrifice 2",
    "es": "Sacrificio 2"
  },
  "metamorph": {
    "pt": "Metamorfosis",
    "en": "Metamorphosis",
    "es": "Metamorfosis"
  },
  "combo": {
    "pt": "Combo",
    "en": "Combo",
    "es": "Combo"
  }
};

function __cardLang(){ return (typeof getCurrentLanguage === "function" ? getCurrentLanguage() : "pt") || "pt"; }
function __cardName(id, fallback){ const lang=__cardLang(); return CARD_NAME_I18N[id]?.[lang] || fallback || id; }
function __effectName(key){ return (typeof translateEffectKey === "function" ? translateEffectKey(key) : key); }

function __makeBaseCardDesc(card){
  const lang = __cardLang();
  const e = card.effects || [];
  const parts = [];
  e.forEach(effect => {
    if(effect.kind === "damage") parts.push(lang==="en" ? `deals ${effect.value} damage` : lang==="es" ? `causa ${effect.value} de daño` : `causa ${effect.value} de dano`);
    if(effect.kind === "heal") parts.push(lang==="en" ? `restores ${effect.value} HP` : lang==="es" ? `recupera ${effect.value} HP` : `recupera ${effect.value} HP`);
    if(effect.kind === "block") parts.push(lang==="en" ? `grants ${effect.value} block` : lang==="es" ? `otorga ${effect.value} de bloqueo` : `gera ${effect.value} de bloqueio`);
    if(effect.kind === "blockall") parts.push(lang==="en" ? `fully blocks the next hit` : lang==="es" ? `bloquea por completo el próximo golpe` : `bloqueia completamente o próximo golpe`);
    if(effect.kind === "poison") parts.push(lang==="en" ? `applies poison ${effect.value}` : lang==="es" ? `aplica veneno ${effect.value}` : `aplica veneno ${effect.value}`);
    if(effect.kind === "lifesteal") parts.push(lang==="en" ? `deals ${effect.damage} and heals ${effect.heal}` : lang==="es" ? `causa ${effect.damage} y cura ${effect.heal}` : `causa ${effect.damage} e cura ${effect.heal}`);
    if(effect.kind === "buffatk") parts.push(lang==="en" ? `increases your attack by ${effect.value}` : lang==="es" ? `aumenta tu ataque en ${effect.value}` : `aumenta seu ataque em ${effect.value}`);
    if(effect.kind === "curse") parts.push(lang==="en" ? `reduces enemy attack by ${effect.value}` : lang==="es" ? `reduce el ataque enemigo en ${effect.value}` : `reduz o ataque inimigo em ${effect.value}`);
    if(effect.kind === "regen") parts.push(lang==="en" ? `restores ${effect.value} HP each turn` : lang==="es" ? `recupera ${effect.value} HP por turno` : `recupera ${effect.value} HP por turno`);
    if(effect.kind === "rebote") parts.push(lang==="en" ? `reflects ${effect.value} damage when hit` : lang==="es" ? `devuelve ${effect.value} de daño al ser golpeado` : `devolve ${effect.value} de dano ao ser atingido`);
    if(effect.kind === "reboteonce") parts.push(lang==="en" ? `reflects ${effect.value} damage on the next hit` : lang==="es" ? `devuelve ${effect.value} de daño en el próximo golpe` : `devolve ${effect.value} de dano no próximo golpe`);
    if(effect.kind === "cleanse") parts.push(lang==="en" ? `removes ${__effectName(effect.targetEffect)} from yourself` : lang==="es" ? `elimina ${__effectName(effect.targetEffect)} de ti` : `remove ${__effectName(effect.targetEffect)} de si`);
    if(effect.kind === "removeEnemyEffect") parts.push(lang==="en" ? `removes ${__effectName(effect.targetEffect)} from the enemy` : lang==="es" ? `elimina ${__effectName(effect.targetEffect)} del enemigo` : `remove ${__effectName(effect.targetEffect)} do inimigo`);
    if(effect.kind === "stunTurns") parts.push(lang==="en" ? `stuns for ${effect.value} turn(s)` : lang==="es" ? `paraliza por ${effect.value} turno(s)` : `paralisa por ${effect.value} turno(s)`);
    if(effect.kind === "discardEnemy") parts.push(lang==="en" ? `forces the enemy to discard ${effect.value} card(s)` : lang==="es" ? `obliga al enemigo a descartar ${effect.value} carta(s)` : `obriga o inimigo a descartar ${effect.value} carta(s)`);
    if(effect.kind === "chaosEnemy") parts.push(lang==="en" ? `reshuffles ${effect.value} enemy card(s)` : lang==="es" ? `baraja de nuevo ${effect.value} carta(s) del enemigo` : `embaralha ${effect.value} carta(s) do inimigo`);
    if(effect.kind === "swapHands") parts.push(lang==="en" ? `swaps both hands` : lang==="es" ? `intercambia ambas manos` : `troca ambas as mãos`);
    if(effect.kind === "selfdamage") parts.push(lang==="en" ? `costs ${effect.value} HP` : lang==="es" ? `cuesta ${effect.value} HP` : `custa ${effect.value} HP`);
    if(effect.kind === "combo") parts.push(lang==="en" ? `prepares a combo turn` : lang==="es" ? `prepara un turno de combo` : `prepara um turno de combo`);
    if(effect.kind === "troco") parts.push(lang==="en" ? `returns the last damage taken` : lang==="es" ? `devuelve el último daño recibido` : `devolve o último dano sofrido`);
  });
  if(parts.length === 0) return card.desc;
  if(lang === "en") return "This card " + parts.join(", ") + ".";
  if(lang === "es") return "Esta carta " + parts.join(", ") + ".";
  return "Esta carta " + parts.join(", ") + ".";
}

function getCard(id){
  const base = CARD_BY_ID[id] || null;
  if(!base) return null;
  return {
    ...base,
    name: __cardName(base.id, base.name),
    desc: __makeBaseCardDesc(base),
    rarity: typeof translateRarity === "function" ? translateRarity(base.rarity) : base.rarity
  };
}

function getCardShortEffect(card){
  const lang = __cardLang();
  const e = card.effects || [];
  if(card.id.startsWith("heal")) return "+" + (e[0]?.value || 0) + " HP";
  if(card.id.startsWith("atk")) return "-" + (e[0]?.value || 0) + " HP";
  if(card.id.startsWith("poison")) return "☠ " + (e[1]?.value || e[0]?.value || 1);
  if(card.id.startsWith("vamp")) return (lang==="en" ? "Drain " : "Drena ") + (e[0]?.damage || 0);
  if(card.id.startsWith("block")) return "🛡 " + ((e[0] && e[0].value) || "∞");
  if(card.id.startsWith("buff")) return (lang==="es" ? "ATQ +" : "ATK +") + (e[0]?.value || 0);
  if(card.id.startsWith("curse")) return (lang==="es" ? "ATQ -" : "ATK -") + (e[0]?.value || 0);
  if(card.id.startsWith("imm")) return (lang==="en" ? "HP/turn +" : "HP/turno +") + (e[0]?.value || 0);
  if(card.id.startsWith("reb")) return "↩ " + (e[0]?.value || 0);
  if(card.id === "curepoison") return lang==="en" ? "cleanse poison" : lang==="es" ? "quita veneno" : "remove veneno";
  if(card.id === "revitalize") return lang==="en" ? "cleanse curse" : lang==="es" ? "quita maldición" : "remove maldição";
  if(card.id === "nerfar") return lang==="en" ? "remove rebound" : lang==="es" ? "quita rebote" : "remove rebote";
  if(card.id === "rezet") return lang==="en" ? "remove buff" : lang==="es" ? "quita buff" : "remove buff";
  if(card.id === "exorcism" || card.id === "forcedheal") return lang==="en" ? "remove immortal" : lang==="es" ? "quita inmortal" : "remove imortal";
  if(card.id.startsWith("defense")) return lang==="en" ? "stuns" : lang==="es" ? "paraliza" : "paralisa";
  if(card.id.startsWith("discard")) return lang==="en" ? "discard" : lang==="es" ? "descarta" : "descarta";
  if(card.id.startsWith("chaos")) return lang==="en" ? "chaos" : "caos";
  if(card.id === "fullchaos") return lang==="en" ? "swap hands" : lang==="es" ? "intercambia manos" : "troca mãos";
  if(card.id === "troco") return lang==="en" ? "counter" : lang==="es" ? "contraataque" : "reflete";
  if(card.id === "troca") return lang==="en" ? "steal card" : lang==="es" ? "roba carta" : "rouba carta";
  if(card.id.startsWith("sacrifice")) return lang==="en" ? "heavy damage" : lang==="es" ? "gran daño" : "alto dano";
  if(card.id === "metamorph") return lang==="en" ? "copy" : "copia";
  if(card.id === "combo") return lang==="en" ? "power turn" : lang==="es" ? "turno fuerte" : "turno forte";
  return card.desc;
}

function getCardDetailedText(card){ return __makeBaseCardDesc(card); }

function getCardStrategyText(card){
  const lang = __cardLang();
  if(card.type === "attack") return lang==="en" ? "Great for pressure, finishing the enemy, or taking advantage of attack buffs." : lang==="es" ? "Ideal para presionar, rematar al enemigo o aprovechar mejoras de ataque." : "Boa para pressionar, finalizar o inimigo ou aproveitar buffs de ataque.";
  if(card.type === "defense") return lang==="en" ? "Best used to survive dangerous turns and reduce enemy offensive efficiency." : lang==="es" ? "Ideal para sobrevivir turnos peligrosos y reducir la ofensiva enemiga." : "Ideal para sobreviver a turnos perigosos e reduzir a eficiência da ofensiva inimiga.";
  if(card.type === "buff") return lang==="en" ? "Stronger when played before offensive cards or when you already have advantage." : lang==="es" ? "Es más fuerte si se juega antes de cartas ofensivas o cuando ya tienes ventaja." : "Fica mais forte quando usada antes de cartas ofensivas ou em momentos de vantagem.";
  if(card.type === "debuff") return lang==="en" ? "Excellent for breaking the enemy rhythm and creating room for your strategy." : lang==="es" ? "Excelente para romper el ritmo del enemigo y abrir espacio para tu estrategia." : "Excelente para quebrar o ritmo do inimigo e abrir espaço para sua estratégia.";
  if(card.type === "support") return lang==="en" ? "Helps stabilize the match and keeps your journey alive longer." : lang==="es" ? "Ayuda a estabilizar la partida y mantener viva tu aventura." : "Ajuda a estabilizar a partida e manter sua jornada viva por mais tempo.";
  return lang==="en" ? "Use according to the state of the battle." : lang==="es" ? "Úsala de acuerdo con el estado de la batalla." : "Use de acordo com o momento da luta.";
}

function getCardVisual(card){
  const base = CARD_TYPES[card.type] || {label:"Card", icon:"🃏", css:"special"};
  return { ...base, label: (typeof translateCardTypeLabel === "function" ? translateCardTypeLabel(card.type) : base.label) };
}
