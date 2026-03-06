const SAVE_KEY = "wayly_balance_fix_full_v1";

let gameState = {
  save: loadSave(),
  battle: null,
  pendingChoice: null,
  pendingEvent: null
};

function el(id){ return document.getElementById(id); }

function defaultSave(){
  return {
    level: 1,
    wins: 0,
    losses: 0,
    options: { music: 60, sfx: 70 },
    playerChoices: [],
    botChoices: [],
    nextBattleHpBonus: 0,
    lastNotice: "",
    pausedBattle: null,
    canContinue: false
  };
}

function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    return { ...defaultSave(), ...parsed, options: { ...defaultSave().options, ...(parsed.options || {}) } };
  }catch(e){
    return defaultSave();
  }
}

function saveSave(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.save));
  renderMenuStats();
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  el(id).classList.add("active");
}

function clearDebug(){
  const box = el("debugBox");
  if(box){ box.classList.add("hidden"); box.textContent = ""; }
}

function showDebug(text){
  const box = el("debugBox");
  if(box){ box.classList.remove("hidden"); box.textContent = text; }
}

function renderMenuStats(){
  const unlocked = STARTER_CARDS.length + gameState.save.playerChoices.length;
  el("statUnlocked").textContent = unlocked;
  el("statDeckSize").textContent = buildDeckFromChoices(gameState.save.playerChoices).length;
  el("statMaxHand").textContent = MAX_HAND_SIZE;
  el("statEnergy").textContent = ENERGY_PER_TURN;
  el("statLevel").textContent = gameState.save.level;
  const hasPaused = !!gameState.save.pausedBattle;
  const hasJourney = hasPaused || gameState.save.level > 1 || gameState.save.playerChoices.length > 0;
  el("statJourney").textContent = hasPaused ? "Batalha pausada" : (hasJourney ? "Run em andamento" : "Nova run");
  const continueBtn = el("continueBtn");
  if(continueBtn){
    continueBtn.textContent = hasPaused ? "Continuar batalha" : "Continuar jornada";
    continueBtn.disabled = !hasJourney;
    continueBtn.style.opacity = hasJourney ? "1" : ".55";
  }
  const note = el("menuNotice");
  if(note){
    if(gameState.save.lastNotice){
      note.classList.remove("hidden");
      note.textContent = gameState.save.lastNotice;
    } else {
      note.classList.add("hidden");
      note.textContent = "";
    }
  }
}

function openDeck(){
  const grid = el("deckGrid");
  grid.innerHTML = "";
  const unlocked = new Set([...STARTER_CARDS.map(c => c.id), ...(gameState.save.playerChoices || [])]);
  el("deckCount").textContent = buildDeckFromChoices(gameState.save.playerChoices).length;
  el("deckLevel").textContent = gameState.save.level;

  ALL_CARDS.forEach(card => {
    const isUnlocked = unlocked.has(card.id);
    const vis = getCardVisual(card);
    const div = document.createElement("div");
    div.className = "card " + vis.css + (isUnlocked ? "" : " disabled");
    div.innerHTML = `
      <div class="card-head"><span class="icon">${vis.icon}</span><span class="badge">${vis.label}</span></div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-foot"><span>Custo ${card.cost}</span><span>${isUnlocked ? "Liberada" : "Bloqueada"}</span></div>
    `;
    grid.appendChild(div);
  });

  showScreen("deck");
}

function openOptions(){
  el("musicRange").value = gameState.save.options.music;
  el("sfxRange").value = gameState.save.options.sfx;
  el("optionsModal").classList.remove("hidden");
}
function closeOptions(){ el("optionsModal").classList.add("hidden"); }

function saveOptions(){
  gameState.save.options.music = Number(el("musicRange").value);
  gameState.save.options.sfx = Number(el("sfxRange").value);
  saveSave();
  closeOptions();
  alert("Opções salvas.");
}

function goMenu(){ renderMenuStats(); showScreen("menu"); }
function exitGame(){ alert("Para sair, feche a aba do navegador."); }

function snapshotBattle(){
  if(!gameState.battle) return null;
  return JSON.parse(JSON.stringify(gameState.battle));
}
function persistPausedBattle(){
  gameState.save.pausedBattle = snapshotBattle();
  gameState.save.canContinue = true;
  saveSave();
}
function continueGame(){
  gameState.save.lastNotice = "";
  if(gameState.save.pausedBattle){
    gameState.battle = JSON.parse(JSON.stringify(gameState.save.pausedBattle));
    showScreen("battle");
    renderBattle();
    return;
  }
  startBattle();
}
function startNewGame(){
  const ok = confirm("Iniciar uma nova jornada do nível 1? Isso apaga o progresso atual da run.");
  if(!ok) return;
  gameState.save = defaultSave();
  saveSave();
  goMenu();
}
function returnToMenu(){
  if(gameState.battle){
    persistPausedBattle();
    gameState.save.lastNotice = "Batalha pausada. Você pode continuar de onde parou ou iniciar uma nova jornada.";
    saveSave();
  }
  goMenu();
}

function shuffle(arr){
  const copy = arr.slice();
  for(let i=copy.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createEntity(name, maxHp, deck, maxEnergy){
  return {
    name,
    maxHp,
    hp: maxHp,
    energy: maxEnergy,
    maxEnergy,
    deck: shuffle(deck),
    hand: [],
    discard: [],
    effects: {
      block: 0,
      blockAll: false,
      poison: 0,
      regen: 0,
      rebote: 0,
      reboteOnce: 0,
      buffatk: 0,
      curse: 0,
      stunTurns: 0,
      comboNext: 0
    },
    lastOffense: null
  };
}

function effectiveAttackMod(attacker){
  return Math.max(0, (attacker.effects.buffatk || 0) - (attacker.effects.curse || 0));
}

function addLog(text){
  const log = el("battleLog");
  if(!log) return;
  const div = document.createElement("div");
  div.innerHTML = decorateLog(text);
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function decorateLog(text){
  let icon = "✦";
  if(/dano|sofreu|sacrificou|devolveu/i.test(text)) icon = "⚔️";
  else if(/recuperou|HP|Imortal/i.test(text)) icon = "💚";
  else if(/Block|bloqueou/i.test(text)) icon = "🛡️";
  else if(/Veneno|Maldição|descartou|caos|Troco/i.test(text)) icon = "☠️";
  else if(/Buff|Combo|ativou|copiou/i.test(text)) icon = "✨";
  return `<span class="log-icon">${icon}</span> ${text}`;
}

function getPortraitMood(current, max){
  const ratio = max > 0 ? current / max : 0;
  if(ratio > 0.66) return { cls:"confident", mouth:"⌣" };
  if(ratio > 0.33) return { cls:"wary", mouth:"•" };
  return { cls:"afraid", mouth:"⌢" };
}

function applyPortraitMood(frameId, mouthId, current, max, themeClass){
  const frame = el(frameId);
  const mouth = el(mouthId);
  if(!frame || !mouth) return;
  const mood = getPortraitMood(current, max);
  frame.classList.remove("confident","wary","afraid","theme-neutral","theme-player","theme-tank","theme-venom","theme-vamp");
  frame.classList.add(mood.cls, themeClass);
  mouth.textContent = mood.mouth;
}

function syncEnemyBacks(){
  const b = gameState.battle;
  const zone = el("enemyHandBacks");
  if(!b || !zone) return;
  zone.innerHTML = "";
  const total = MAX_HAND_SIZE;
  for(let i=0;i<total;i++){
    const back = document.createElement("div");
    back.className = "enemy-card-back" + (i >= b.enemy.hand.length ? " hidden-back" : "");
    if(i >= b.enemy.hand.length) back.style.opacity = ".18";
    zone.appendChild(back);
  }
}

function renderEnergyOrbs(){
  const b = gameState.battle;
  const wrap = el("energyOrbs");
  if(!b || !wrap) return;
  wrap.innerHTML = "";
  for(let i=0;i<b.player.maxEnergy;i++){
    const orb = document.createElement("div");
    orb.className = "energy-orb" + (i < b.player.energy ? " active" : "");
    wrap.appendChild(orb);
  }
}

function showBattleFx(side, kind, value){
  const layer = el("battleFxLayer");
  const scene = el("battleScene");
  if(!layer || !scene) return;
  const sceneRect = scene.getBoundingClientRect();
  const sideRect = (side === "player" ? el("playerPortraitFrame") : el("enemyPortraitFrame")).getBoundingClientRect();
  const fx = document.createElement("div");
  fx.className = "fx-text " + kind;
  fx.textContent = value;
  fx.style.left = ((sideRect.left + sideRect.width / 2) - sceneRect.left) + "px";
  fx.style.top = ((sideRect.top + sideRect.height / 2) - sceneRect.top) + "px";
  layer.appendChild(fx);
  setTimeout(() => fx.remove(), 900);
}

function setEnemyTheme(profile){
  const panel = el("enemyPanel");
  const frame = el("enemyPortraitFrame");
  if(!panel || !frame) return;
  panel.classList.remove("theme-tank","theme-venom","theme-vamp");
  const theme = profile.archetype === "tank" ? "theme-tank" : profile.archetype === "venom" ? "theme-venom" : "theme-vamp";
  panel.classList.add(theme);
}

function pulseCardForType(type){
  const hand = el("hand");
  if(!hand) return;
}

function flashBar(id, kind){
  const node = el(id);
  if(!node) return;
  const cls = kind === "heal" ? "flash-heal" : "flash-damage";
  node.classList.remove("flash-damage","flash-heal");
  void node.offsetWidth;
  node.classList.add(cls);

  const targetFrame = id === "playerHpBar" ? el("playerPortraitFrame") : el("enemyPortraitFrame");
  if(targetFrame && kind === "damage"){
    targetFrame.classList.remove("shake-hit");
    void targetFrame.offsetWidth;
    targetFrame.classList.add("shake-hit");
  }
}

function drawCard(entity, amount=1){
  for(let i=0;i<amount;i++){
    if(entity.deck.length === 0){
      if(entity.discard.length > 0){
        entity.deck = shuffle(entity.discard);
        entity.discard = [];
      } else return;
    }
    const drawn = entity.deck.pop();
    if(entity.hand.length >= MAX_HAND_SIZE){
      entity.discard.push(drawn);
      addLog(entity.name + " comprou uma carta, mas a mão estava cheia.");
      continue;
    }
    entity.hand.push(drawn);
  }
}

function renderEffectList(targetId, entity){
  const wrap = el(targetId);
  wrap.innerHTML = "";
  const entries = [];
  if(entity.effects.block > 0) entries.push("Block " + entity.effects.block);
  if(entity.effects.blockAll) entries.push("Block Total");
  if(entity.effects.poison > 0) entries.push("Veneno " + entity.effects.poison);
  if(entity.effects.regen > 0) entries.push("Imortal " + entity.effects.regen);
  if(entity.effects.rebote > 0) entries.push("Rebote " + entity.effects.rebote);
  if(entity.effects.reboteOnce > 0) entries.push("Rebote Master");
  if(entity.effects.buffatk > 0) entries.push("Buff " + entity.effects.buffatk);
  if(entity.effects.curse > 0) entries.push("Maldição " + entity.effects.curse);
  if(entity.effects.stunTurns > 0) entries.push("Stun " + entity.effects.stunTurns);
  if(entity.effects.comboNext > 0) entries.push("Combo");
  if(entries.length === 0) entries.push("Sem efeitos");
  entries.forEach(text => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = text;
    wrap.appendChild(chip);
  });
}

function renderHand(){
  const b = gameState.battle;
  const hand = el("hand");
  hand.innerHTML = "";
  if(!b) return;

  const canPlay = b.turn === "player" && !b.locked;
  if(b.player.hand.length === 0){
    hand.innerHTML = "<div class='muted'>Sem cartas na mão.</div>";
    return;
  }

  b.player.hand.forEach((cardId, index) => {
    const card = getCard(cardId);
    if(!card) return;
    const vis = getCardVisual(card);
    const enoughEnergy = b.player.energy >= card.cost;
    const cardEl = document.createElement("div");
    cardEl.className = "card " + vis.css + (canPlay ? "" : " disabled") + (enoughEnergy ? "" : " not-enough-energy");
    cardEl.innerHTML = `
      <div class="card-head"><span class="icon">${vis.icon}</span><span class="badge">${vis.label}</span></div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-foot"><span>Custo ${card.cost}</span><span>${card.rarity}</span></div>
    `;
    cardEl.onclick = function(){
      if(!canPlay || !enoughEnergy) return;
      playPlayerCard(index);
    };
    hand.appendChild(cardEl);
  });
}

function renderBattle(){
  const b = gameState.battle;
  if(!b) return;
  el("turnText").textContent = "Turno: " + (b.turn === "player" ? "Player" : b.enemy.name);
  el("playerHpText").textContent = b.player.hp;
  el("playerMaxHpText").textContent = b.player.maxHp;
  el("enemyHpText").textContent = b.enemy.hp;
  el("enemyMaxHpText").textContent = b.enemy.maxHp;
  el("enemyName").textContent = b.enemy.name;
  el("enemyTitleText").textContent = b.enemy.name;
  el("playerEnergyText").textContent = b.player.energy;
  el("playerMaxEnergyText").textContent = b.player.maxEnergy;
  el("enemyEnergyText").textContent = b.enemy.energy;
  el("enemyMaxEnergyText").textContent = b.enemy.maxEnergy;
  el("playerHpBar").style.width = ((b.player.hp / b.player.maxHp) * 100) + "%";
  el("enemyHpBar").style.width = ((b.enemy.hp / b.enemy.maxHp) * 100) + "%";
  el("playerHandCount").textContent = b.player.hand.length;
  el("enemyHandCount").textContent = b.enemy.hand.length;
  el("playerDeckCount").textContent = b.player.deck.length;
  el("enemyDeckCount").textContent = b.enemy.deck.length;
  renderEffectList("playerEffects", b.player);
  renderEffectList("enemyEffects", b.enemy);
  renderEnergyOrbs();
  syncEnemyBacks();
  setEnemyTheme(b.profile);
  applyPortraitMood("playerPortraitFrame","playerPortraitMood", b.player.hp, b.player.maxHp, "theme-player");
  const enemyTheme = b.profile.archetype === "tank" ? "theme-tank" : b.profile.archetype === "venom" ? "theme-venom" : "theme-vamp";
  applyPortraitMood("enemyPortraitFrame","enemyPortraitMood", b.enemy.hp, b.enemy.maxHp, enemyTheme);
  renderHand();
}

function applyStartOfTurn(entity){
  entity.energy = entity.maxEnergy;
  if(entity.effects.poison > 0){
    entity.hp = Math.max(0, entity.hp - entity.effects.poison);
    addLog(entity.name + " sofreu " + entity.effects.poison + " de dano de veneno.");
    flashBar(entity === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "damage");
    showBattleFx(entity === gameState.battle.player ? "player" : "enemy", "damage", "-" + entity.effects.poison);
  }
  if(entity.effects.regen > 0){
    entity.hp = Math.min(entity.maxHp, entity.hp + entity.effects.regen);
    addLog(entity.name + " recuperou " + entity.effects.regen + " HP de Imortal.");
    flashBar(entity === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "heal");
    showBattleFx(entity === gameState.battle.player ? "player" : "enemy", "heal", "+" + entity.effects.regen);
  }
}

function consumeDefense(target, rawDamage){
  if(target.effects.blockAll){
    addLog(target.name + " bloqueou todo o dano.");
    target.effects.blockAll = false;
    return 0;
  }
  if(target.effects.block > 0){
    const absorbed = Math.min(target.effects.block, rawDamage);
    target.effects.block -= absorbed;
    addLog(target.name + " bloqueou " + absorbed + " de dano.");
    return rawDamage - absorbed;
  }
  return rawDamage;
}

function recordOffense(target, offense){
  target.lastOffense = offense;
}

function strongerEffect(current, incoming){
  return incoming > current;
}

function applySingleEffect(effect, source, target){
  const atkMod = effectiveAttackMod(source);

  if(effect.kind === "damage"){
    let dmg = effect.value + atkMod;
    dmg = consumeDefense(target, dmg);
    target.hp = Math.max(0, target.hp - dmg);
    recordOffense(target, { kind:"damage", value: effect.value, finalValue:dmg });
    addLog(source.name + " causou " + dmg + " de dano.");
    flashBar(target === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "damage");
    showBattleFx(target === gameState.battle.player ? "player" : "enemy", "damage", "-" + dmg);
    applyRebote(source, target);
    return;
  }

  if(effect.kind === "heal"){
    source.hp = Math.min(source.maxHp, source.hp + effect.value);
    addLog(source.name + " recuperou " + effect.value + " HP.");
    flashBar(source === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "heal");
    showBattleFx(source === gameState.battle.player ? "player" : "enemy", "heal", "+" + effect.value);
    return;
  }

  if(effect.kind === "block"){
    if(effect.value > source.effects.block) source.effects.block = effect.value;
    addLog(source.name + " ganhou Block " + source.effects.block + ".");
    return;
  }

  if(effect.kind === "blockall"){
    source.effects.blockAll = true;
    addLog(source.name + " ativou Block Total.");
    return;
  }

  if(effect.kind === "poison"){
    if(strongerEffect(target.effects.poison, effect.value)){
      target.effects.poison = effect.value;
      addLog(target.name + " recebeu Veneno " + effect.value + ".");
      showBattleFx(target === gameState.battle.player ? "player" : "enemy", "debuff", "☠ " + effect.value);
    } else addLog("Veneno mais fraco ignorado.");
    recordOffense(target, { kind:"poison", value: effect.value });
    return;
  }

  if(effect.kind === "lifesteal"){
    let dmg = effect.damage + atkMod;
    dmg = consumeDefense(target, dmg);
    target.hp = Math.max(0, target.hp - dmg);
    source.hp = Math.min(source.maxHp, source.hp + effect.heal);
    recordOffense(target, { kind:"lifesteal", damage: effect.damage, heal: effect.heal });
    addLog(source.name + " causou " + dmg + " e recuperou " + effect.heal + " HP.");
    flashBar(target === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "damage");
    flashBar(source === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "heal");
    showBattleFx(target === gameState.battle.player ? "player" : "enemy", "damage", "-" + dmg);
    showBattleFx(source === gameState.battle.player ? "player" : "enemy", "heal", "+" + effect.heal);
    applyRebote(source, target);
    return;
  }

  if(effect.kind === "buffatk"){
    if(strongerEffect(source.effects.buffatk, effect.value)){
      source.effects.buffatk = effect.value;
      addLog(source.name + " recebeu Buff " + effect.value + ".");
      showBattleFx(source === gameState.battle.player ? "player" : "enemy", "buff", "✨ +" + effect.value);
    } else addLog("Buff mais fraco ignorado.");
    return;
  }

  if(effect.kind === "curse"){
    if(strongerEffect(target.effects.curse, effect.value)){
      target.effects.curse = effect.value;
      addLog(target.name + " recebeu Maldição " + effect.value + ".");
      showBattleFx(target === gameState.battle.player ? "player" : "enemy", "debuff", "☠ -" + effect.value);
    } else addLog("Maldição mais fraca ignorada.");
    recordOffense(target, { kind:"curse", value: effect.value });
    return;
  }

  if(effect.kind === "regen"){
    if(strongerEffect(source.effects.regen, effect.value)){
      source.effects.regen = effect.value;
      addLog(source.name + " recebeu Imortal " + effect.value + ".");
      showBattleFx(source === gameState.battle.player ? "player" : "enemy", "buff", "✚ " + effect.value);
    } else addLog("Imortal mais fraco ignorado.");
    return;
  }

  if(effect.kind === "rebote"){
    if(strongerEffect(source.effects.rebote, effect.value)){
      source.effects.rebote = effect.value;
      addLog(source.name + " recebeu Rebote " + effect.value + ".");
      showBattleFx(source === gameState.battle.player ? "player" : "enemy", "buff", "↩ " + effect.value);
    } else addLog("Rebote mais fraco ignorado.");
    return;
  }

  if(effect.kind === "reboteonce"){
    source.effects.reboteOnce = Math.max(source.effects.reboteOnce, effect.value);
    addLog(source.name + " recebeu Rebote Master.");
    return;
  }

  if(effect.kind === "cleanse"){
    source.effects[effect.targetEffect] = 0;
    addLog(source.name + " removeu o efeito " + effect.targetEffect + ".");
    showBattleFx(source === gameState.battle.player ? "player" : "enemy", "buff", "✦");
    return;
  }

  if(effect.kind === "removeEnemyEffect"){
    target.effects[effect.targetEffect] = 0;
    addLog(source.name + " removeu o efeito " + effect.targetEffect + " do inimigo.");
    showBattleFx(target === gameState.battle.player ? "player" : "enemy", "debuff", "✖");
    return;
  }

  if(effect.kind === "stunTurns"){
    target.effects.stunTurns = Math.max(target.effects.stunTurns, effect.value);
    addLog(target.name + " ficará sem agir por " + effect.value + " turno(s).");
    showBattleFx(target === gameState.battle.player ? "player" : "enemy", "debuff", "⛓");
    return;
  }

  if(effect.kind === "discardEnemy"){
    discardEnemyCards(target, effect.value);
    return;
  }

  if(effect.kind === "chaosEnemy"){
    chaosEnemyCards(target, effect.value);
    return;
  }

  if(effect.kind === "swapHands"){
    const temp = source.hand;
    source.hand = target.hand;
    target.hand = temp;
    addLog("As mãos foram trocadas.");
    return;
  }

  if(effect.kind === "troco"){
    if(source.lastOffense){
      addLog(source.name + " ativou Troco.");
      if(source.lastOffense.kind === "damage"){
        applySingleEffect({kind:"damage", value: source.lastOffense.value}, source, target);
      } else if(source.lastOffense.kind === "poison"){
        applySingleEffect({kind:"poison", value: source.lastOffense.value}, source, target);
      } else if(source.lastOffense.kind === "lifesteal"){
        applySingleEffect({kind:"damage", value: source.lastOffense.damage}, source, target);
      } else if(source.lastOffense.kind === "curse"){
        applySingleEffect({kind:"curse", value: source.lastOffense.value}, source, target);
      }
    } else addLog("Troco não tinha ataque anterior para devolver.");
    return;
  }

  if(effect.kind === "tradeCard"){
    tradeRandomCard(source, target);
    return;
  }

  if(effect.kind === "selfdamage"){
    source.hp = Math.max(0, source.hp - effect.value);
    addLog(source.name + " sacrificou " + effect.value + " HP.");
    flashBar(source === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "damage");
    showBattleFx(source === gameState.battle.player ? "player" : "enemy", "damage", "-" + effect.value);
    return;
  }

  if(effect.kind === "metamorph"){
    const copyId = source.hand.find(id => getCard(id));
    if(copyId){
      const copyCard = getCard(copyId);
      addLog(source.name + " copiou o efeito de " + copyCard.name + ".");
      copyCard.effects.forEach(e => applySingleEffect(e, source, target));
    } else addLog("Metamorfosis falhou por falta de carta para copiar.");
    return;
  }

  if(effect.kind === "combo"){
    source.effects.comboNext = 1;
    addLog(source.name + " preparou Combo para o próximo turno.");
    showBattleFx(source === gameState.battle.player ? "player" : "enemy", "buff", "🌀");
    return;
  }
}

function applyCard(card, source, target){
  addLog(source.name + " usou " + card.name + " (custo " + card.cost + ").");
  card.effects.forEach(effect => applySingleEffect(effect, source, target));
}

function applyRebote(attacker, defender){
  if(defender.effects.rebote > 0){
    attacker.hp = Math.max(0, attacker.hp - defender.effects.rebote);
    addLog(defender.name + " devolveu " + defender.effects.rebote + " de dano.");
    flashBar(attacker === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "damage");
    showBattleFx(attacker === gameState.battle.player ? "player" : "enemy", "damage", "-" + defender.effects.rebote);
  }
  if(defender.effects.reboteOnce > 0){
    attacker.hp = Math.max(0, attacker.hp - defender.effects.reboteOnce);
    addLog(defender.name + " ativou Rebote Master e devolveu " + defender.effects.reboteOnce + " de dano.");
    showBattleFx(attacker === gameState.battle.player ? "player" : "enemy", "damage", "-" + defender.effects.reboteOnce);
    defender.effects.reboteOnce = 0;
    flashBar(attacker === gameState.battle.player ? "playerHpBar" : "enemyHpBar", "damage");
  }
}

function discardEnemyCards(entity, amount){
  for(let i=0;i<amount;i++){
    if(entity.hand.length === 0) return;
    const idx = Math.floor(Math.random() * entity.hand.length);
    const removed = entity.hand.splice(idx,1)[0];
    entity.discard.push(removed);
  }
  addLog(entity.name + " descartou " + amount + " carta(s).");
}

function chaosEnemyCards(entity, amount){
  discardEnemyCards(entity, amount);
  drawCard(entity, amount);
  addLog(entity.name + " recebeu novas cartas aleatórias.");
}

function tradeRandomCard(source, target){
  if(target.hand.length === 0 || source.hand.length === 0){
    addLog("Troca falhou.");
    return;
  }
  const enemyIndex = Math.floor(Math.random() * target.hand.length);
  const ownIndex = Math.floor(Math.random() * source.hand.length);
  const enemyCard = target.hand.splice(enemyIndex,1)[0];
  const ownCard = source.hand.splice(ownIndex,1)[0];
  source.hand.push(enemyCard);
  target.hand.push(ownCard);
  addLog(source.name + " trocou uma carta com o inimigo.");
}

function getPlayerDeck(){ return buildDeckFromChoices(gameState.save.playerChoices); }
function getBotDeck(level){ return buildEnemyDeck(level, gameState.save.botChoices); }

function startBattle(){
  const level = gameState.save.level;
  const baseHp = getHpForLevel(level);
  const profile = getEnemyProfile(level);

  const playerHp = baseHp + (level === 1 ? 5 : 0) + (gameState.save.nextBattleHpBonus || 0);
  const enemyHp = baseHp + profile.hpBonus;

  const playerDeck = getPlayerDeck();
  const enemyDeck = getBotDeck(level);

  gameState.battle = {
    level,
    profile,
    turn: "player",
    locked: false,
    player: createEntity("Player", playerHp, playerDeck, ENERGY_PER_TURN),
    enemy: createEntity(profile.name, enemyHp, enemyDeck, ENERGY_PER_TURN + profile.energyBonus)
  };

  gameState.save.nextBattleHpBonus = 0;
  saveSave();

  drawCard(gameState.battle.player, 5);
  drawCard(gameState.battle.enemy, 5);
  gameState.save.pausedBattle = null;
  gameState.save.canContinue = true;
  gameState.save.lastNotice = "Sua jornada está ativa no nível " + level + ".";
  saveSave();

  el("battleLog").innerHTML = "";
  addLog("Batalha iniciada.");
  addLog("Player começa com " + playerHp + " HP. Bot começa com " + enemyHp + " HP.");
  addLog("Arquetipo inimigo: " + profile.archetype + ".");
  if(level <= 5) addLog("Nível inicial balanceado: bot sem reforço de arquétipo e IA simplificada.");

  applyStartOfTurn(gameState.battle.player);
  renderBattle();
  showScreen("battle");
}

function endPlayerTurn(){
  const b = gameState.battle;
  if(!b || b.turn !== "player") return;
  drawCard(b.player, 1);
  drawCard(b.enemy, 1);
  b.turn = "enemy";
  renderBattle();
  setTimeout(runEnemyTurn, 650);
}

function beginPlayerTurn(){
  const b = gameState.battle;
  applyStartOfTurn(b.player);
  if(checkBattleEnd()) return;
  if(b.player.effects.stunTurns > 0){
    b.player.effects.stunTurns -= 1;
    addLog("Player perdeu o turno por Defesa.");
    drawCard(b.player, 1);
    drawCard(b.enemy, 1);
    b.turn = "enemy";
    renderBattle();
    setTimeout(runEnemyTurn, 650);
    return;
  }
  b.turn = "player";
  if(b.player.effects.comboNext > 0){
    b.player.energy = b.player.maxEnergy + 2;
    b.player.effects.comboNext = 0;
    addLog("Combo ativo: Player ganhou energia extra neste turno.");
  }
  addLog("Seu turno.");
  renderBattle();
}

function playPlayerCard(handIndex){
  const b = gameState.battle;
  if(!b || b.turn !== "player") return;
  const cardId = b.player.hand[handIndex];
  const card = getCard(cardId);
  if(!card) return;
  if(b.player.energy < card.cost){
    addLog("Energia insuficiente para " + card.name + ".");
    return;
  }
  b.player.energy -= card.cost;
  b.player.hand.splice(handIndex,1);
  b.player.discard.push(cardId);
  applyCard(card, b.player, b.enemy);
  renderBattle();
  checkBattleEnd();
}

function scoreCardForBot(card, bot, player, profile, level){
  if(card.cost > bot.energy) return -999;
  let score = 0;

  // IA simplificada no early game.
  const simpleMode = level <= 5;

  card.effects.forEach(e => {
    if(e.kind === "damage") score += e.value;
    if(e.kind === "heal") score += (bot.hp < bot.maxHp * 0.7 ? e.value * 1.4 : 1);
    if(e.kind === "block") score += (bot.hp < bot.maxHp * 0.55 ? e.value : e.value * 0.45);
    if(e.kind === "blockall") score += (bot.hp < bot.maxHp * 0.45 ? 9 : 3);
    if(e.kind === "lifesteal") score += e.damage + (bot.hp < bot.maxHp ? e.heal : 1);
    if(e.kind === "poison") score += e.value * (simpleMode ? 1.2 : 2.2);
    if(e.kind === "buffatk") score += (profile.archetype === "vamp" ? e.value * 2.2 : e.value * 1.6);
    if(e.kind === "curse") score += (simpleMode ? 1 : e.value * 2);
    if(e.kind === "regen") score += (bot.hp < bot.maxHp * 0.7 ? e.value * 2 : e.value);
    if(e.kind === "rebote") score += (profile.archetype === "tank" ? e.value * 2 : e.value * 1.2);
    if(e.kind === "reboteonce") score += 6;
    if(e.kind === "stunTurns") score += 7 * e.value;
    if(e.kind === "discardEnemy") score += 4 * e.value;
    if(e.kind === "chaosEnemy") score += 4 * e.value;
    if(e.kind === "combo") score += 8;
    if(e.kind === "removeEnemyEffect"){
      if(player.effects[e.targetEffect] > 0) score += 7;
      else score += 1;
    }
    if(e.kind === "cleanse"){
      if(bot.effects[e.targetEffect] > 0) score += 7;
      else score += 1;
    }
    if(e.kind === "selfdamage") score -= e.value;
    if(e.kind === "tradeCard") score += 5;
    if(e.kind === "swapHands") score += (bot.hand.length < player.hand.length ? 5 : 2);
    if(e.kind === "troco") score += player.lastOffense ? 7 : 1;
  });

  if(!simpleMode){
    if(player.hp <= 12 && card.effects.some(e => ["damage","lifesteal","poison"].includes(e.kind))){
      score += 8; // finalizar
    }
    if(player.effects.poison >= 3 && card.effects.some(e => e.kind === "damage")){
      score += 2;
    }
    if(bot.effects.comboNext > 0 && card.effects.some(e => e.kind === "damage")){
      score += 3;
    }
  }

  if(profile.archetype === "tank"){
    if(card.type === "defense" || card.type === "buff") score += 2;
  } else if(profile.archetype === "venom"){
    if(card.type === "debuff") score += 3;
  } else if(profile.archetype === "vamp"){
    if(card.id.startsWith("vamp") || card.id.startsWith("atk")) score += 2;
  }

  score -= card.cost * 0.35;
  return score;
}

function runEnemyTurn(){
  const b = gameState.battle;
  if(!b) return;

  applyStartOfTurn(b.enemy);
  if(checkBattleEnd()) return;

  if(b.enemy.effects.stunTurns > 0){
    b.enemy.effects.stunTurns -= 1;
    addLog(b.enemy.name + " perdeu o turno por Defesa.");
    drawCard(b.player, 1);
    drawCard(b.enemy, 1);
    beginPlayerTurn();
    return;
  }

  if(b.enemy.effects.comboNext > 0){
    b.enemy.energy = b.enemy.maxEnergy + 2;
    b.enemy.effects.comboNext = 0;
    addLog(b.enemy.name + " ativou Combo.");
  }

  addLog("Turno do " + b.enemy.name + ".");

  while(true){
    let bestIndex = -1;
    let bestScore = -999;
    b.enemy.hand.forEach((id, idx) => {
      const c = getCard(id);
      if(!c) return;
      const s = scoreCardForBot(c, b.enemy, b.player, b.profile, b.level);
      if(s > bestScore){ bestScore = s; bestIndex = idx; }
    });

    if(bestIndex < 0 || bestScore < 0) break;

    const cardId = b.enemy.hand[bestIndex];
    const card = getCard(cardId);
    if(!card || card.cost > b.enemy.energy) break;

    b.enemy.energy -= card.cost;
    b.enemy.hand.splice(bestIndex,1);
    b.enemy.discard.push(cardId);
    applyCard(card, b.enemy, b.player);
    if(checkBattleEnd()) return;
  }

  drawCard(b.player, 1);
  drawCard(b.enemy, 1);
  beginPlayerTurn();
}

function renderChoice(){
  const grid = el("choiceGrid");
  grid.innerHTML = "";
  el("choiceLevel").textContent = gameState.save.level;

  gameState.pendingChoice.forEach((card, index) => {
    const vis = getCardVisual(card);
    const div = document.createElement("div");
    div.className = "card choice-card " + vis.css;
    div.innerHTML = `
      <div class="card-head"><span class="icon">${vis.icon}</span><span class="badge">${vis.label}</span></div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-foot"><span>Custo ${card.cost}</span><span>${card.rarity}</span></div>
      <button class="btn primary" onclick="chooseLevelCard(${index})">Escolher</button>
    `;
    grid.appendChild(div);
  });

  showScreen("choice");
}

function chooseLevelCard(index){
  const chosen = gameState.pendingChoice[index];
  const other = gameState.pendingChoice[index === 0 ? 1 : 0];
  if(!chosen || !other) return;

  gameState.save.playerChoices.push(chosen.id);
  gameState.save.botChoices.push(other.id);
  saveSave();

  el("resultTitle").textContent = "Nova carta";
  el("resultText").textContent = "Você escolheu " + chosen.name + ". O bot recebeu " + other.name + ".";
  el("resultStats").innerHTML = `
    <div class="stat-row"><span>Sua nova carta</span><strong>${chosen.name}</strong></div>
    <div class="stat-row"><span>Carta do bot</span><strong>${other.name}</strong></div>
    <button class="btn primary" onclick="continueAfterChoice()">Continuar</button>
  `;
  showScreen("result");
}

function continueAfterChoice(){
  if(shouldTriggerEvent(gameState.save.level)){
    startEvent();
  } else {
    startBattle();
  }
}

function startEvent(){
  const candidates = [];
  const playerDeck = buildDeckFromChoices(gameState.save.playerChoices);
  const starterInDeck = playerDeck.filter(id => STARTER_CARDS.some(c => c.id === id));
  if(starterInDeck.length > 0) candidates.push("removeWeak");
  if(gameState.save.playerChoices.length > 0) candidates.push("duplicate");
  candidates.push("hpBonus");
  if(starterInDeck.length > 0) candidates.push("transmute");

  const type = candidates[Math.floor(Math.random() * candidates.length)];
  gameState.pendingEvent = { type };
  renderEvent();
}

function renderEvent(){
  const type = gameState.pendingEvent.type;
  const title = el("eventTitle");
  const text = el("eventText");
  const choices = el("eventChoices");
  choices.innerHTML = "";
  el("eventSkipBtn").classList.add("hidden");

  if(type === "removeWeak"){
    title.textContent = "Evento: Purificação";
    text.textContent = "Escolha uma carta inicial fraca para remover permanentemente do seu deck base.";
    const playerDeck = [...new Set(buildDeckFromChoices(gameState.save.playerChoices).filter(id => STARTER_CARDS.some(c => c.id === id)))];
    playerDeck.forEach(id => {
      const card = getCard(id);
      const vis = getCardVisual(card);
      const div = document.createElement("div");
      div.className = "card choice-card " + vis.css;
      div.innerHTML = `<div class="card-name">${card.name}</div><div class="card-desc">${card.desc}</div><button class="btn primary" onclick="applyEvent('removeWeak','${id}')">Remover</button>`;
      choices.appendChild(div);
    });
  } else if(type === "duplicate"){
    title.textContent = "Evento: Eco";
    text.textContent = "Escolha uma carta desbloqueada para duplicar na sua coleção.";
    const unique = [...new Set(gameState.save.playerChoices)];
    unique.forEach(id => {
      const card = getCard(id);
      const vis = getCardVisual(card);
      const div = document.createElement("div");
      div.className = "card choice-card " + vis.css;
      div.innerHTML = `<div class="card-name">${card.name}</div><div class="card-desc">${card.desc}</div><button class="btn primary" onclick="applyEvent('duplicate','${id}')">Duplicar</button>`;
      choices.appendChild(div);
    });
  } else if(type === "hpBonus"){
    title.textContent = "Evento: Descanso";
    text.textContent = "Ganhe +6 HP apenas no próximo combate.";
    const div = document.createElement("div");
    div.className = "card choice-card buff";
    div.innerHTML = `<div class="card-name">Descansar</div><div class="card-desc">Receba +6 HP no próximo combate.</div><button class="btn primary" onclick="applyEvent('hpBonus','6')">Receber bônus</button>`;
    choices.appendChild(div);
  } else if(type === "transmute"){
    title.textContent = "Evento: Transmutação";
    text.textContent = "Troque uma carta inicial fraca por uma carta média aleatória.";
    const playerDeck = [...new Set(buildDeckFromChoices(gameState.save.playerChoices).filter(id => STARTER_CARDS.some(c => c.id === id)))];
    playerDeck.forEach(id => {
      const card = getCard(id);
      const div = document.createElement("div");
      div.className = "card choice-card special";
      div.innerHTML = `<div class="card-name">${card.name}</div><div class="card-desc">${card.desc}</div><button class="btn primary" onclick="applyEvent('transmute','${id}')">Transmutar</button>`;
      choices.appendChild(div);
    });
  }

  showScreen("event");
}

function applyEvent(type, payload){
  if(type === "removeWeak"){
    STARTER_CARDS.splice(STARTER_CARDS.findIndex(c => c.id === payload), 1);
  } else if(type === "duplicate"){
    gameState.save.playerChoices.push(payload);
  } else if(type === "hpBonus"){
    gameState.save.nextBattleHpBonus = Number(payload);
  } else if(type === "transmute"){
    STARTER_CARDS.splice(STARTER_CARDS.findIndex(c => c.id === payload), 1);
    const pool = LEVEL_POOL.filter(c => c.tier === "media");
    const gain = pool[Math.floor(Math.random() * pool.length)];
    gameState.save.playerChoices.push(gain.id);
  }
  saveSave();

  el("resultTitle").textContent = "Evento concluído";
  el("resultText").textContent = "O evento foi aplicado com sucesso.";
  el("resultStats").innerHTML = `<button class="btn primary" onclick="startBattle()">Ir para a próxima batalha</button>`;
  showScreen("result");
}

function skipEvent(){
  el("resultTitle").textContent = "Evento pulado";
  el("resultText").textContent = "Você ignorou o evento.";
  el("resultStats").innerHTML = `<button class="btn primary" onclick="startBattle()">Ir para a próxima batalha</button>`;
  showScreen("result");
}

function finishBattle(win){
  const previousLevel = gameState.save.level;
  if(win){
    gameState.save.wins += 1;
    if(gameState.save.level < MAX_LEVEL) gameState.save.level += 1;
    gameState.save.pausedBattle = null;
    gameState.save.canContinue = true;
    gameState.save.lastNotice = "Vitória. Sua jornada segue no nível " + gameState.save.level + ".";
    saveSave();

    el("resultTitle").textContent = "Vitória";
    el("resultText").textContent = gameState.save.level > previousLevel ? "Você venceu e subiu de nível." : "Você venceu no nível máximo.";
    el("resultStats").innerHTML = `
      <div class="stat-row"><span>Nível atual</span><strong>${gameState.save.level}</strong></div>
      <div class="stat-row"><span>Cartas desbloqueadas</span><strong>${STARTER_CARDS.length + gameState.save.playerChoices.length}</strong></div>
      <div class="stat-row"><span>Cartas ativas no deck</span><strong>${buildDeckFromChoices(gameState.save.playerChoices).length}</strong></div>
      <div class="stat-row"><span>HP atual da curva</span><strong>${getHpForLevel(gameState.save.level)}</strong></div>
      <div class="stat-row"><span>Energia por turno</span><strong>${ENERGY_PER_TURN}</strong></div>
    `;
    showScreen("result");

    if(gameState.save.level <= MAX_LEVEL && gameState.save.level > previousLevel){
      const taken = [...gameState.save.playerChoices, ...gameState.save.botChoices];
      const pair = getChoicePair(gameState.save.level, taken);
      if(pair.length === 2){
        gameState.pendingChoice = pair;
        setTimeout(renderChoice, 450);
      } else {
        el("resultStats").innerHTML += '<button class="btn primary" onclick="continueAfterChoice()">Continuar</button>';
      }
    }
  } else {
    gameState.save.losses += 1;
    gameState.save.pausedBattle = null;
    gameState.save.canContinue = true;
    gameState.save.lastNotice = "Você perdeu esta batalha, mas pode continuar sua jornada a partir do nível atual.";
    saveSave();
    goMenu();
  }
}

function checkBattleEnd(){
  const b = gameState.battle;
  if(!b) return false;
  if(b.enemy.hp <= 0){
    finishBattle(true);
    return true;
  }
  if(b.player.hp <= 0){
    finishBattle(false);
    return true;
  }
  return false;
}

function concedeBattle(){
  returnToMenu();
}

function resetSave(){
  const ok = confirm("Apagar todo o save?");
  if(!ok) return;
  gameState.save = defaultSave();
  saveSave();
  closeOptions();
  goMenu();
  alert("Save resetado.");
}

window.startBattle = startBattle;
window.openDeck = openDeck;
window.openOptions = openOptions;
window.closeOptions = closeOptions;
window.saveOptions = saveOptions;
window.exitGame = exitGame;
window.goMenu = goMenu;
window.concedeBattle = concedeBattle;
window.resetSave = resetSave;
window.chooseLevelCard = chooseLevelCard;
window.endPlayerTurn = endPlayerTurn;
window.continueAfterChoice = continueAfterChoice;
window.applyEvent = applyEvent;
window.skipEvent = skipEvent;
window.continueGame = continueGame;
window.startNewGame = startNewGame;
window.returnToMenu = returnToMenu;

clearDebug();
renderMenuStats();
