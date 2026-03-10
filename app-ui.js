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

function buildCardInner(card, detailed){
  const vis = getCardVisual(card);
  const eye = detailed ? "" : `<button class="card-eye" onclick="event.stopPropagation(); openCardModal('${card.id}')" aria-label="Ver detalhes da carta">👁</button>`;
  const effectText = detailed ? card.desc : getCardShortEffect(card);
  return `
    <div class="card-preview">
      <div class="card-head">
        <span class="icon">${vis.icon}</span>
        <span class="badge">${vis.label}</span>
      </div>
      <div class="card-art">
        <div class="card-art-badge">C${card.cost}</div>
        ${eye}
      </div>
      <div class="card-mini-name">${card.name}</div>
      <div class="card-mini-effect">${effectText}</div>
      <div class="card-mini-foot"><span>${detailed ? card.rarity : ""}</span><span>${detailed ? "Detalhes" : ""}</span></div>
    </div>
  `;
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
    cardEl.innerHTML = buildCardInner(card, false);
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
  renderPlayedHistory();

  if(b.turn){
    gameState.save.pausedBattle = snapshotBattle();
    gameState.save.canContinue = true;
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.save));
  }
}

function toggleLog(){
  const log = el("battleLog");
  const panel = log ? log.closest(".log-panel") : null;
  if(!log) return;
  log.classList.toggle("collapsed");
  if(panel) panel.classList.toggle("compact-log");
}

function openCardModal(cardId){
  const card = getCard(cardId);
  if(!card) return;
  const modal = el("cardModal");
  const visual = el("cardModalVisual");
  if(!modal || !visual) return;
  const vis = getCardVisual(card);
  visual.className = "card card-modal-visual " + vis.css;
  visual.innerHTML = buildCardInner(card, true);
  el("cardModalTitle").textContent = card.name;
  el("cardModalType").textContent = vis.label;
  el("cardModalCost").textContent = "Custo " + card.cost;
  el("cardModalRarity").textContent = card.rarity;
  el("cardModalDesc").textContent = card.desc;
  el("cardModalLong").textContent = getCardDetailedText(card);
  el("cardModalTips").textContent = getCardStrategyText(card);
  modal.classList.remove("hidden");
}

function closeCardModal(){
  const modal = el("cardModal");
  if(modal) modal.classList.add("hidden");
}