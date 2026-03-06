
const SAVE_KEY = 'wayly_upgrade_full_v1';

let gameState = {
  save: loadSave(),
  battle: null,
  pendingChoice: null,
  pendingEventAfterChoice: false
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
    removedStarters: [],
    enemyRemovedStarters: [],
    extraCopies: {},
    enemyExtraCopies: {},
    nextBattleHpBonus: 0
  };
}

function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    return {
      ...defaultSave(),
      ...parsed,
      options: { ...defaultSave().options, ...(parsed.options || {}) },
      removedStarters: parsed.removedStarters || [],
      enemyRemovedStarters: parsed.enemyRemovedStarters || [],
      extraCopies: parsed.extraCopies || {},
      enemyExtraCopies: parsed.enemyExtraCopies || {}
    };
  }catch(error){
    return defaultSave();
  }
}

function saveSave(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.save));
  renderMenuStats();
}

function showScreen(id){
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  el(id).classList.add('active');
}

function clearDebug(){
  const box = el('debugBox');
  if(box){
    box.style.display = 'none';
    box.textContent = '';
  }
}

function getNextBattleBonusText(){
  if((gameState.save.nextBattleHpBonus || 0) > 0) return '+' + gameState.save.nextBattleHpBonus + ' HP';
  return 'Nenhum';
}

function renderMenuStats(){
  const unlocked = STARTER_CARDS.length + gameState.save.playerChoices.length - gameState.save.removedStarters.length;
  el('statUnlocked').textContent = Math.max(0, unlocked);
  el('statDeckSize').textContent = buildDeckFromChoices(gameState.save.playerChoices, gameState.save.removedStarters, gameState.save.extraCopies).length;
  el('statDeckCap').textContent = MAX_ACTIVE_DECK_SIZE;
  el('statMaxHand').textContent = MAX_HAND_SIZE;
  el('statEnergy').textContent = ENERGY_PER_TURN;
  el('statLevel').textContent = gameState.save.level;
  el('statWins').textContent = gameState.save.wins;
  el('statLosses').textContent = gameState.save.losses;
  el('statNextBonus').textContent = getNextBattleBonusText();
}

function openDeck(){
  const grid = el('deckGrid');
  grid.innerHTML = '';
  const unlocked = new Set([...STARTER_CARDS.map(card => card.id), ...(gameState.save.playerChoices || [])]);
  const removed = new Set(gameState.save.removedStarters || []);
  el('deckCount').textContent = buildDeckFromChoices(gameState.save.playerChoices, gameState.save.removedStarters, gameState.save.extraCopies).length;
  el('deckLevel').textContent = gameState.save.level;

  ALL_CARDS.filter(card => !card.enemyOnly).forEach(card => {
    const isUnlocked = unlocked.has(card.id) && !removed.has(card.id);
    const div = document.createElement('div');
    div.className = 'deck-card' + (isUnlocked ? '' : ' locked');
    const typeClass = 'type-' + getCardCssType(card);
    div.innerHTML = `
      <div class="card-type ${typeClass}">${card.icon || '🃏'} ${card.type}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="small" style="margin-top:6px;">Raridade: ${card.rarity}</div>
      <div class="small">Estágio: ${card.stage || 'starter'}</div>
      <div class="small">Custo: ${card.cost}</div>
      <div class="small">Cópias base: ${card.copies}</div>
      <div class="small">${removed.has(card.id) ? 'Removida por evento' : (isUnlocked ? 'Liberada' : 'Bloqueada')}</div>
    `;
    grid.appendChild(div);
  });
  showScreen('deck');
}

function openOptions(){
  el('musicRange').value = gameState.save.options.music;
  el('sfxRange').value = gameState.save.options.sfx;
  el('optionsModal').classList.add('show');
}
function closeOptions(){ el('optionsModal').classList.remove('show'); }
function saveOptions(){
  gameState.save.options.music = Number(el('musicRange').value);
  gameState.save.options.sfx = Number(el('sfxRange').value);
  saveSave();
  closeOptions();
  alert('Opções salvas.');
}
function goMenu(){ renderMenuStats(); showScreen('menu'); }
function exitGame(){ alert('Para sair, feche a aba do navegador.'); }

function shuffle(array){
  const copy = array.slice();
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createEntity(name, maxHp, deck, energyBonus = 0){
  return {
    name,
    maxHp,
    hp: maxHp,
    energy: ENERGY_PER_TURN + energyBonus,
    maxEnergy: ENERGY_PER_TURN + energyBonus,
    deck: shuffle(deck),
    hand: [],
    discard: [],
    refillNextTurn: 0,
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

function addLog(text){
  const log = el('battleLog');
  const line = document.createElement('div');
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function flashStat(id, kind){
  const node = el(id);
  if(!node) return;
  node.classList.remove('flash-dmg', 'flash-heal');
  void node.offsetWidth;
  node.classList.add(kind === 'heal' ? 'flash-heal' : 'flash-dmg');
}

function drawCard(entity, amount = 1){
  for(let i = 0; i < amount; i++){
    if(entity.deck.length === 0){
      if(entity.discard.length > 0){
        entity.deck = shuffle(entity.discard);
        entity.discard = [];
      } else return;
    }
    const drawn = entity.deck.pop();
    if(entity.hand.length >= MAX_HAND_SIZE){
      entity.discard.push(drawn);
      addLog(entity.name + ' comprou uma carta, mas a mão estava cheia.');
      continue;
    }
    entity.hand.push(drawn);
  }
}

function renderEffectList(targetId, entity){
  const wrap = el(targetId);
  wrap.innerHTML = '';
  const effects = entity.effects;
  const entries = [];
  if(effects.block > 0) entries.push('🛡️ Block ' + effects.block);
  if(effects.blockAll) entries.push('🧱 Block Total');
  if(effects.poison > 0) entries.push('☠️ Veneno ' + effects.poison);
  if(effects.regen > 0) entries.push('🌿 Imortal ' + effects.regen);
  if(effects.rebote > 0) entries.push('↩️ Rebote ' + effects.rebote);
  if(effects.reboteOnce > 0) entries.push('💥 Rebote Master ' + effects.reboteOnce);
  if(effects.buffatk > 0) entries.push('✨ Buff ' + effects.buffatk);
  if(effects.curse > 0) entries.push('🔻 Maldição ' + effects.curse);
  if(effects.stunTurns > 0) entries.push('⛔ Defesa ' + effects.stunTurns);
  if(effects.comboNext > 0) entries.push('⚡ Combo');
  if(entries.length === 0) entries.push('Sem efeitos');
  entries.forEach(text => {
    const chip = document.createElement('div');
    chip.className = 'effect-chip';
    chip.textContent = text;
    wrap.appendChild(chip);
  });
}

function renderHand(){
  const battle = gameState.battle;
  const hand = el('hand');
  hand.innerHTML = '';
  if(!battle) return;
  const canPlay = battle.turn === 'player' && !battle.locked;
  if(battle.player.hand.length === 0){
    hand.innerHTML = "<div class='small'>Sem cartas na mão.</div>";
    return;
  }
  battle.player.hand.forEach((cardId, index) => {
    const card = getCard(cardId);
    if(!card) return;
    const enoughEnergy = battle.player.energy >= card.cost;
    const cardEl = document.createElement('div');
    cardEl.className = 'card' + (canPlay ? '' : ' disabled') + (enoughEnergy ? '' : ' not-enough-energy');
    const typeClass = 'type-' + getCardCssType(card);
    cardEl.innerHTML = `
      <div class="card-type ${typeClass}">${card.icon || '🃏'} ${card.type}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-foot"><span>Custo ${card.cost}</span><span>${card.rarity}</span></div>
    `;
    cardEl.onclick = () => {
      if(!canPlay) return;
      if(!enoughEnergy){
        addLog('Energia insuficiente para ' + card.name + '.');
        return;
      }
      playPlayerCard(index);
    };
    hand.appendChild(cardEl);
  });
}

function renderBattle(){
  const battle = gameState.battle;
  if(!battle) return;
  el('turnText').textContent = 'Turno: ' + (battle.turn === 'player' ? 'Player' : battle.enemy.name);
  el('playerHpText').textContent = battle.player.hp;
  el('playerMaxHpText').textContent = battle.player.maxHp;
  el('enemyHpText').textContent = battle.enemy.hp;
  el('enemyMaxHpText').textContent = battle.enemy.maxHp;
  el('enemyName').textContent = battle.enemy.name;
  el('playerEnergyText').textContent = battle.player.energy;
  el('playerMaxEnergyText').textContent = battle.player.maxEnergy;
  el('enemyEnergyText').textContent = battle.enemy.energy;
  el('enemyMaxEnergyText').textContent = battle.enemy.maxEnergy;
  el('playerHpBar').style.width = ((battle.player.hp / battle.player.maxHp) * 100) + '%';
  el('enemyHpBar').style.width = ((battle.enemy.hp / battle.enemy.maxHp) * 100) + '%';
  el('playerHandCount').textContent = battle.player.hand.length;
  el('enemyHandCount').textContent = battle.enemy.hand.length;
  el('playerDeckCount').textContent = battle.player.deck.length;
  el('enemyDeckCount').textContent = battle.enemy.deck.length;
  renderEffectList('playerEffects', battle.player);
  renderEffectList('enemyEffects', battle.enemy);
  renderHand();
}

function consumeDefense(target, rawDamage){
  if(target.effects.blockAll){
    addLog(target.name + ' bloqueou todo o dano.');
    target.effects.blockAll = false;
    return 0;
  }
  if(target.effects.block > 0){
    const absorbed = Math.min(target.effects.block, rawDamage);
    target.effects.block -= absorbed;
    addLog(target.name + ' bloqueou ' + absorbed + ' de dano.');
    return rawDamage - absorbed;
  }
  return rawDamage;
}

function effectiveAttackMod(attacker){
  return Math.max(0, (attacker.effects.buffatk || 0) - (attacker.effects.curse || 0));
}

function strongerEffect(current, incoming){
  return incoming > current;
}

function recordOffense(target, offense){
  target.lastOffense = offense;
}

function applyRebote(attacker, defender){
  if(defender.effects.rebote > 0){
    attacker.hp = Math.max(0, attacker.hp - defender.effects.rebote);
    addLog(defender.name + ' devolveu ' + defender.effects.rebote + ' de dano.');
    flashStat(attacker === gameState.battle.player ? 'playerHpText' : 'enemyHpText', 'dmg');
  }
  if(defender.effects.reboteOnce > 0){
    attacker.hp = Math.max(0, attacker.hp - defender.effects.reboteOnce);
    addLog(defender.name + ' ativou Rebote Master e devolveu ' + defender.effects.reboteOnce + ' de dano.');
    defender.effects.reboteOnce = 0;
    flashStat(attacker === gameState.battle.player ? 'playerHpText' : 'enemyHpText', 'dmg');
  }
}

function discardEnemyCards(entity, amount){
  for(let i = 0; i < amount; i++){
    if(entity.hand.length === 0) return;
    const idx = Math.floor(Math.random() * entity.hand.length);
    const removed = entity.hand.splice(idx, 1)[0];
    entity.discard.push(removed);
  }
  entity.refillNextTurn += amount;
  addLog(entity.name + ' descartou ' + amount + ' carta(s).');
}

function chaosEnemyCards(entity, amount){
  discardEnemyCards(entity, amount);
  entity.refillNextTurn += amount;
  addLog(entity.name + ' receberá novas cartas no próximo turno.');
}

function tradeRandomCard(source, target){
  if(target.hand.length === 0 || source.hand.length === 0){
    addLog('Troca falhou.');
    return;
  }
  const enemyIndex = Math.floor(Math.random() * target.hand.length);
  const ownIndex = Math.floor(Math.random() * source.hand.length);
  const enemyCard = target.hand.splice(enemyIndex, 1)[0];
  const ownCard = source.hand.splice(ownIndex, 1)[0];
  source.hand.push(enemyCard);
  target.hand.push(ownCard);
  addLog(source.name + ' trocou uma carta com o inimigo.');
}

function applySingleEffect(effect, source, target){
  const atkMod = effectiveAttackMod(source);
  const playerNode = source === gameState.battle.player ? 'playerHpText' : 'enemyHpText';
  const targetNode = target === gameState.battle.player ? 'playerHpText' : 'enemyHpText';

  if(effect.kind === 'damage'){
    let dmg = effect.value + atkMod;
    dmg = consumeDefense(target, dmg);
    target.hp = Math.max(0, target.hp - dmg);
    recordOffense(target, { kind:'damage', value: effect.value });
    addLog(source.name + ' causou ' + dmg + ' de dano.');
    flashStat(targetNode, 'dmg');
    applyRebote(source, target);
    return;
  }
  if(effect.kind === 'heal'){
    source.hp = Math.min(source.maxHp, source.hp + effect.value);
    addLog(source.name + ' recuperou ' + effect.value + ' HP.');
    flashStat(playerNode, 'heal');
    return;
  }
  if(effect.kind === 'block'){
    if(effect.value > source.effects.block) source.effects.block = effect.value;
    addLog(source.name + ' ganhou bloqueio ' + source.effects.block + '.');
    return;
  }
  if(effect.kind === 'blockall'){
    source.effects.blockAll = true;
    addLog(source.name + ' ativou Block Total.');
    return;
  }
  if(effect.kind === 'poison'){
    if(strongerEffect(target.effects.poison, effect.value)){
      target.effects.poison = effect.value;
      addLog(target.name + ' recebeu Veneno ' + effect.value + '.');
    } else addLog('Veneno mais fraco ignorado.');
    recordOffense(target, { kind:'poison', value: effect.value });
    return;
  }
  if(effect.kind === 'lifesteal'){
    let dmg = effect.damage + atkMod;
    dmg = consumeDefense(target, dmg);
    target.hp = Math.max(0, target.hp - dmg);
    source.hp = Math.min(source.maxHp, source.hp + effect.heal);
    recordOffense(target, { kind:'lifesteal', damage: effect.damage });
    addLog(source.name + ' causou ' + dmg + ' e recuperou ' + effect.heal + ' HP.');
    flashStat(targetNode, 'dmg');
    flashStat(playerNode, 'heal');
    applyRebote(source, target);
    return;
  }
  if(effect.kind === 'buffatk'){
    if(strongerEffect(source.effects.buffatk, effect.value)){
      source.effects.buffatk = effect.value;
      addLog(source.name + ' recebeu Buff ATK ' + effect.value + '.');
    } else addLog('Buff mais fraco ignorado.');
    return;
  }
  if(effect.kind === 'curse'){
    if(strongerEffect(target.effects.curse, effect.value)){
      target.effects.curse = effect.value;
      addLog(target.name + ' recebeu Maldição ' + effect.value + '.');
    } else addLog('Maldição mais fraca ignorada.');
    recordOffense(target, { kind:'curse', value: effect.value });
    return;
  }
  if(effect.kind === 'regen'){
    if(strongerEffect(source.effects.regen, effect.value)){
      source.effects.regen = effect.value;
      addLog(source.name + ' recebeu Imortal ' + effect.value + '.');
    } else addLog('Imortal mais fraco ignorado.');
    return;
  }
  if(effect.kind === 'rebote'){
    if(strongerEffect(source.effects.rebote, effect.value)){
      source.effects.rebote = effect.value;
      addLog(source.name + ' recebeu Rebote ' + effect.value + '.');
    } else addLog('Rebote mais fraco ignorado.');
    return;
  }
  if(effect.kind === 'reboteonce'){
    source.effects.reboteOnce = Math.max(source.effects.reboteOnce, effect.value);
    addLog(source.name + ' recebeu Rebote Master.');
    return;
  }
  if(effect.kind === 'cleanse'){
    source.effects[effect.targetEffect] = 0;
    addLog(source.name + ' removeu o efeito ' + effect.targetEffect + '.');
    return;
  }
  if(effect.kind === 'removeEnemyEffect'){
    target.effects[effect.targetEffect] = 0;
    addLog(source.name + ' removeu o efeito ' + effect.targetEffect + ' do inimigo.');
    return;
  }
  if(effect.kind === 'stunTurns'){
    target.effects.stunTurns = Math.max(target.effects.stunTurns, effect.value);
    addLog(target.name + ' ficará sem agir por ' + effect.value + ' turno(s).');
    return;
  }
  if(effect.kind === 'discardEnemy'){ discardEnemyCards(target, effect.value); return; }
  if(effect.kind === 'chaosEnemy'){ chaosEnemyCards(target, effect.value); return; }
  if(effect.kind === 'swapHands'){
    const temp = source.hand;
    source.hand = target.hand;
    target.hand = temp;
    addLog('As mãos foram trocadas.');
    return;
  }
  if(effect.kind === 'troco'){
    if(source.lastOffense){
      addLog(source.name + ' ativou Troco.');
      if(source.lastOffense.kind === 'damage') applySingleEffect({kind:'damage', value: source.lastOffense.value}, source, target);
      if(source.lastOffense.kind === 'poison') applySingleEffect({kind:'poison', value: source.lastOffense.value}, source, target);
      if(source.lastOffense.kind === 'lifesteal') applySingleEffect({kind:'damage', value: source.lastOffense.damage}, source, target);
      if(source.lastOffense.kind === 'curse') applySingleEffect({kind:'curse', value: source.lastOffense.value}, source, target);
    } else addLog('Troco não tinha ataque anterior para devolver.');
    return;
  }
  if(effect.kind === 'tradeCard'){ tradeRandomCard(source, target); return; }
  if(effect.kind === 'selfdamage'){
    source.hp = Math.max(0, source.hp - effect.value);
    addLog(source.name + ' sacrificou ' + effect.value + ' HP.');
    flashStat(playerNode, 'dmg');
    return;
  }
  if(effect.kind === 'metamorph'){
    const copyId = source.hand.find(id => getCard(id));
    if(copyId){
      const copyCard = getCard(copyId);
      addLog(source.name + ' copiou o efeito de ' + copyCard.name + '.');
      copyCard.effects.forEach(e => applySingleEffect(e, source, target));
    } else addLog('Metamorfosis falhou por falta de carta para copiar.');
    return;
  }
  if(effect.kind === 'combo'){
    source.effects.comboNext = 1;
    addLog(source.name + ' preparou Combo para o próximo turno.');
    return;
  }
}

function applyCard(card, source, target){
  addLog(source.name + ' usou ' + card.name + ' (custo ' + card.cost + ').');
  card.effects.forEach(effect => applySingleEffect(effect, source, target));
}

function beginTurn(entity, firstTurn = false){
  entity.energy = entity.maxEnergy + (entity.effects.comboNext ? 2 : 0);
  entity.effects.comboNext = 0;
  if(!firstTurn){
    const draws = 1 + entity.refillNextTurn;
    entity.refillNextTurn = 0;
    drawCard(entity, draws);
  }
  if(entity.effects.poison > 0){
    entity.hp = Math.max(0, entity.hp - entity.effects.poison);
    addLog(entity.name + ' sofreu ' + entity.effects.poison + ' de dano de veneno.');
    flashStat(entity === gameState.battle.player ? 'playerHpText' : 'enemyHpText', 'dmg');
  }
  if(entity.effects.regen > 0){
    entity.hp = Math.min(entity.maxHp, entity.hp + entity.effects.regen);
    addLog(entity.name + ' recuperou ' + entity.effects.regen + ' HP de Imortal.');
    flashStat(entity === gameState.battle.player ? 'playerHpText' : 'enemyHpText', 'heal');
  }
}

function startBattle(){
  const level = gameState.save.level;
  const baseHp = getHpForLevel(level);
  const playerHp = baseHp + (gameState.save.nextBattleHpBonus || 0);
  const enemyProfile = getEnemyProfile(level);
  const playerDeck = buildDeckFromChoices(gameState.save.playerChoices, gameState.save.removedStarters, gameState.save.extraCopies);
  const enemyDeck = buildEnemyDeck(gameState.save, level);
  gameState.save.nextBattleHpBonus = 0;
  saveSave();
  gameState.battle = {
    level,
    turn: 'player',
    locked: false,
    enemyProfile,
    player: createEntity('Player', playerHp, playerDeck, 0),
    enemy: createEntity(enemyProfile.name, baseHp + enemyProfile.hpBonus, enemyDeck, enemyProfile.energyBonus || 0)
  };
  drawCard(gameState.battle.player, 5);
  drawCard(gameState.battle.enemy, 5);
  el('battleLog').innerHTML = '';
  addLog('Batalha iniciada.');
  addLog('HP do Player: ' + playerHp + '. HP do inimigo: ' + gameState.battle.enemy.maxHp + '.');
  addLog('Arquetipo inimigo: ' + enemyProfile.archetype + '. Energia base: ' + ENERGY_PER_TURN + '.');
  showScreen('battle');
  beginPlayerTurn(true);
}

function beginPlayerTurn(firstTurn = false){
  const battle = gameState.battle;
  beginTurn(battle.player, firstTurn);
  if(checkBattleEnd()) return;
  if(battle.player.effects.stunTurns > 0){
    battle.player.effects.stunTurns -= 1;
    addLog('Player perdeu o turno por Defesa.');
    battle.turn = 'enemy';
    renderBattle();
    setTimeout(runEnemyTurn, 650);
    return;
  }
  battle.turn = 'player';
  addLog('Seu turno.');
  renderBattle();
}

function endPlayerTurn(){
  const battle = gameState.battle;
  if(!battle || battle.turn !== 'player') return;
  battle.turn = 'enemy';
  renderBattle();
  setTimeout(runEnemyTurn, 650);
}

function playPlayerCard(handIndex){
  const battle = gameState.battle;
  if(!battle || battle.turn !== 'player') return;
  const cardId = battle.player.hand[handIndex];
  const card = getCard(cardId);
  if(!card) return;
  if(battle.player.energy < card.cost){
    addLog('Energia insuficiente para ' + card.name + '.');
    return;
  }
  battle.player.energy -= card.cost;
  battle.player.hand.splice(handIndex, 1);
  battle.player.discard.push(cardId);
  applyCard(card, battle.player, battle.enemy);
  renderBattle();
  checkBattleEnd();
}

function getArchetypeMultiplier(profile, kind){
  const prefs = profile.preferences || {};
  return prefs[kind] || 1;
}

function cardKindBucket(card){
  if(card.type === 'Defesa') return 'defense';
  if(card.id.includes('poison') || card.type === 'Debuff') return 'poison';
  if(card.id.includes('vamp') || card.id === 'bloodmoon') return 'vamp';
  if(card.type === 'Ataque') return 'attack';
  if(card.type === 'Suporte' || card.type === 'Buff') return 'heal';
  return 'debuff';
}

function scoreCardForBot(card, bot, player, profile){
  if(card.cost > bot.energy) return -999;
  let score = (card.power || 0) - (card.cost * 0.35);
  const bucket = cardKindBucket(card);
  score *= getArchetypeMultiplier(profile, bucket);

  if(player.hp <= 12 && (bucket === 'attack' || bucket === 'poison' || bucket === 'vamp')) score += 8;
  if(bot.hp <= Math.floor(bot.maxHp * 0.35) && (card.type === 'Defesa' || bucket === 'heal' || card.id.includes('block') || card.id.includes('heal'))) score += 10;
  if(bot.effects.poison > 0 && card.id === 'curepoison') score += 14;
  if(bot.effects.curse > 0 && card.id === 'revitalize') score += 10;
  if(player.effects.regen > 0 && (card.id === 'forcedheal' || card.id === 'exorcism')) score += 10;
  if(player.effects.rebote > 0 && card.id === 'nerfar') score += 8;
  if(player.effects.buffatk > 0 && card.id === 'rezet') score += 8;
  if(bot.effects.buffatk > 0 && (bucket === 'attack' || bucket === 'vamp')) score += 7;
  if(bot.effects.comboNext > 0 && (bucket === 'attack' || bucket === 'vamp')) score += 5;
  if(player.effects.poison >= 3 && (bucket === 'attack' || card.id === 'troco')) score += 4;
  if(card.id === 'troco' && bot.lastOffense) score += 4;
  if(card.id === 'combo' && bot.hand.some(id => { const c = getCard(id); return c && c.cost <= bot.energy && c.power >= 10; })) score += 6;
  return score;
}

function runEnemyTurn(){
  const battle = gameState.battle;
  if(!battle) return;
  beginTurn(battle.enemy, false);
  if(checkBattleEnd()) return;
  if(battle.enemy.effects.stunTurns > 0){
    battle.enemy.effects.stunTurns -= 1;
    addLog(battle.enemy.name + ' perdeu o turno por Defesa.');
    beginPlayerTurn();
    return;
  }
  addLog('Turno do ' + battle.enemy.name + '.');
  while(true){
    let bestIndex = -1;
    let bestScore = -999;
    battle.enemy.hand.forEach((id, index) => {
      const card = getCard(id);
      if(!card) return;
      const score = scoreCardForBot(card, battle.enemy, battle.player, battle.enemyProfile);
      if(score > bestScore){
        bestScore = score;
        bestIndex = index;
      }
    });
    if(bestIndex < 0 || bestScore < 0) break;
    const cardId = battle.enemy.hand[bestIndex];
    const card = getCard(cardId);
    if(!card || card.cost > battle.enemy.energy) break;
    battle.enemy.energy -= card.cost;
    battle.enemy.hand.splice(bestIndex, 1);
    battle.enemy.discard.push(cardId);
    applyCard(card, battle.enemy, battle.player);
    if(checkBattleEnd()) return;
  }
  beginPlayerTurn();
}

function renderChoice(){
  const grid = el('choiceGrid');
  grid.innerHTML = '';
  el('choiceLevel').textContent = gameState.save.level;
  gameState.pendingChoice.forEach((card, index) => {
    const div = document.createElement('div');
    div.className = 'deck-card choice-card';
    const typeClass = 'type-' + getCardCssType(card);
    div.innerHTML = `
      <div class="card-type ${typeClass}">${card.icon || '🃏'} ${card.type}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="small">Estágio: ${card.stage}</div>
      <div class="small">Custo: ${card.cost}</div>
      <button class="btn-main" onclick="chooseLevelCard(${index})">Escolher</button>
    `;
    grid.appendChild(div);
  });
  showScreen('choice');
}

function continueAfterLevelProgress(){
  if(gameState.pendingEventAfterChoice){
    gameState.pendingEventAfterChoice = false;
    renderEvent();
    return;
  }
  el('resultTitle').textContent = 'Nova carta';
  el('resultText').textContent = 'Preparação concluída para o próximo confronto.';
  el('resultStats').innerHTML = '<button class="btn-main" onclick="startBattle()">Próximo nível</button>';
  showScreen('result');
}

function chooseLevelCard(index){
  const chosen = gameState.pendingChoice[index];
  const other = gameState.pendingChoice[index === 0 ? 1 : 0];
  if(!chosen || !other) return;
  gameState.save.playerChoices.push(chosen.id);
  gameState.save.botChoices.push(other.id);
  saveSave();
  el('resultTitle').textContent = 'Nova carta';
  el('resultText').textContent = 'Você escolheu ' + chosen.name + '. O bot recebeu ' + other.name + '.';
  el('resultStats').innerHTML = `
    <div class="row"><span>Sua nova carta</span><strong>${chosen.name}</strong></div>
    <div class="row"><span>Carta do bot</span><strong>${other.name}</strong></div>
    <button class="btn-main" onclick="continueAfterLevelProgress()">Continuar</button>
  `;
  showScreen('result');
}

function autoRemoveWeakStarter(){
  const candidates = ['atk3', 'heal5', 'block4', 'buff2', 'curse2', 'reb2', 'imm1'];
  const currentRemoved = new Set(gameState.save.removedStarters || []);
  const pick = candidates.find(id => !currentRemoved.has(id));
  if(!pick) return null;
  gameState.save.removedStarters.push(pick);
  return getCard(pick);
}

function duplicateRandomOwnedCard(){
  const owned = [...STARTER_CARDS.map(c => c.id), ...(gameState.save.playerChoices || [])].filter(id => !(gameState.save.removedStarters || []).includes(id));
  if(owned.length === 0) return null;
  const id = owned[Math.floor(Math.random() * owned.length)];
  gameState.save.extraCopies[id] = (gameState.save.extraCopies[id] || 0) + 1;
  return getCard(id);
}

function transmuteStarter(){
  const removable = STARTER_CARDS.map(c => c.id).filter(id => !(gameState.save.removedStarters || []).includes(id));
  if(removable.length === 0) return null;
  const removedId = removable[Math.floor(Math.random() * removable.length)];
  const stage = getStageForLevel(gameState.save.level);
  const pool = LEVEL_POOL.filter(card => card.stage === stage && !card.enemyOnly);
  if(pool.length === 0) return null;
  const gained = pool[Math.floor(Math.random() * pool.length)];
  gameState.save.removedStarters.push(removedId);
  gameState.save.playerChoices.push(gained.id);
  return { removed: getCard(removedId), gained };
}

function renderEvent(){
  const options = getEventOptions(gameState.save);
  el('eventText').textContent = 'Escolha um evento para fortalecer sua run antes do próximo confronto.';
  const wrap = el('eventOptions');
  wrap.innerHTML = '';
  options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `<strong>${option.title}</strong><div class="small" style="margin:8px 0;">${option.desc}</div><button class="btn-main" onclick="applyEventChoice('${option.id}')">Escolher</button>`;
    wrap.appendChild(card);
  });
  showScreen('event');
}

function applyEventChoice(eventId){
  let message = '';
  if(eventId === 'purify'){
    const removed = autoRemoveWeakStarter();
    message = removed ? ('Carta removida do deck: ' + removed.name + '.') : 'Nenhuma carta fraca disponível para remover.';
  }
  if(eventId === 'duplicate'){
    const duplicated = duplicateRandomOwnedCard();
    message = duplicated ? ('Carta duplicada: ' + duplicated.name + '.') : 'Nenhuma carta disponível para duplicar.';
  }
  if(eventId === 'vigor'){
    gameState.save.nextBattleHpBonus = (gameState.save.nextBattleHpBonus || 0) + 8;
    message = 'Você receberá +8 HP no próximo combate.';
  }
  if(eventId === 'transmute'){
    const result = transmuteStarter();
    message = result ? ('Transmutação: saiu ' + result.removed.name + ' e entrou ' + result.gained.name + '.') : 'Transmutação falhou por falta de carta válida.';
  }
  saveSave();
  el('resultTitle').textContent = 'Evento concluído';
  el('resultText').textContent = message;
  el('resultStats').innerHTML = '<button class="btn-main" onclick="startBattle()">Próximo nível</button>';
  showScreen('result');
}

function finishBattle(win){
  const previousLevel = gameState.save.level;
  if(win){
    gameState.save.wins += 1;
    if(gameState.save.level < MAX_LEVEL) gameState.save.level += 1;
  } else {
    gameState.save.losses += 1;
  }
  saveSave();
  el('resultTitle').textContent = win ? 'Vitória' : 'Derrota';
  el('resultText').textContent = win ? (gameState.save.level > previousLevel ? 'Você venceu e subiu de nível.' : 'Você venceu no nível máximo.') : 'Você perdeu. Ajuste sua estratégia e tente novamente.';
  el('resultStats').innerHTML = `
    <div class="row"><span>Nível atual</span><strong>${gameState.save.level}</strong></div>
    <div class="row"><span>Cartas desbloqueadas</span><strong>${STARTER_CARDS.length + gameState.save.playerChoices.length - gameState.save.removedStarters.length}</strong></div>
    <div class="row"><span>Cartas ativas no deck</span><strong>${buildDeckFromChoices(gameState.save.playerChoices, gameState.save.removedStarters, gameState.save.extraCopies).length}</strong></div>
    <div class="row"><span>HP da curva atual</span><strong>${getHpForLevel(gameState.save.level)}</strong></div>
    <div class="row"><span>Vitórias / Derrotas</span><strong>${gameState.save.wins} / ${gameState.save.losses}</strong></div>
  `;
  showScreen('result');

  if(win && gameState.save.level <= MAX_LEVEL && gameState.save.level > previousLevel){
    const taken = [...gameState.save.playerChoices, ...gameState.save.botChoices];
    const pair = getChoicePair(gameState.save.level, taken);
    gameState.pendingEventAfterChoice = isEventLevel(gameState.save.level);
    if(pair.length === 2){
      gameState.pendingChoice = pair;
      setTimeout(renderChoice, 450);
    } else if(gameState.pendingEventAfterChoice){
      setTimeout(renderEvent, 450);
    } else {
      el('resultStats').innerHTML += '<button class="btn-main" onclick="startBattle()">Próximo nível</button>';
    }
  }
}

function checkBattleEnd(){
  const battle = gameState.battle;
  if(!battle) return false;
  if(battle.enemy.hp <= 0){ finishBattle(true); return true; }
  if(battle.player.hp <= 0){ finishBattle(false); return true; }
  return false;
}

function concedeBattle(){
  if(!gameState.battle) return;
  gameState.battle.player.hp = 0;
  checkBattleEnd();
}

function resetSave(){
  const ok = confirm('Apagar todo o save?');
  if(!ok) return;
  gameState.save = defaultSave();
  saveSave();
  closeOptions();
  goMenu();
  alert('Save resetado.');
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
window.applyEventChoice = applyEventChoice;
window.continueAfterLevelProgress = continueAfterLevelProgress;

clearDebug();
renderMenuStats();
