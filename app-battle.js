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
    enemyActing: false,
    player: createEntity("Player", playerHp, playerDeck, ENERGY_PER_TURN),
    enemy: createEntity(profile.name, enemyHp, enemyDeck, ENERGY_PER_TURN + profile.energyBonus)
  };

  gameState.save.nextBattleHpBonus = 0;
  gameState.save.pausedBattle = null;
  gameState.save.canContinue = true;
  gameState.save.lastNotice = "Sua jornada está ativa no nível " + level + ".";
  saveSave();

  drawCard(gameState.battle.player, 5);
  drawCard(gameState.battle.enemy, 5);

  const log = el("battleLog");
  if(log) log.innerHTML = "";
  gameState.battleHistory = [];
  clearPlayedHistory();

  addLog("Batalha iniciada.");
  addLog("Player começa com " + playerHp + " HP. Bot começa com " + enemyHp + " HP.");
  addLog("Arquétipo inimigo: " + profile.archetype + ".");
  if(level <= 5) addLog("Nível inicial balanceado: bot sem reforço de arquétipo e IA simplificada.");

  applyStartOfTurn(gameState.battle.player);
  renderBattle();
  showScreen("battle");
}

function endPlayerTurn(){
  const b = gameState.battle;
  if(!b || b.turn !== "player" || b.locked) return;
  b.locked = true;
  drawCard(b.player, 1);
  drawCard(b.enemy, 1);
  b.turn = "enemy";
  renderBattle();
  setTimeout(runEnemyTurn, 650);
}

function beginPlayerTurn(){
  const b = gameState.battle;
  if(!b) return;
  b.locked = false;
  b.enemyActing = false;
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
  if(!b || b.turn !== "player" || b.locked) return;
  const cardId = b.player.hand[handIndex];
  const card = getCard(cardId);
  if(!card) return;
  if(b.player.energy < card.cost){
    addLog("Energia insuficiente para " + card.name + ".");
    return;
  }

  try{
    b.player.energy -= card.cost;
    b.player.hand.splice(handIndex,1);
    b.player.discard.push(cardId);
    pushPlayedCard("player", cardId);
    renderPlayedHistory();
    applyCard(card, b.player, b.enemy);
    renderBattle();
    checkBattleEnd();
  }catch(err){
    showDebug("Erro ao jogar carta do player: " + (err && err.message ? err.message : err));
    renderBattle();
  }
}

function runEnemyTurn(){
  const b = gameState.battle;
  if(!b || b.enemyActing) return;
  b.enemyActing = true;

  const finishEnemyTurn = () => {
    if(!gameState.battle) return;
    drawCard(b.player, 1);
    drawCard(b.enemy, 1);
    setTimeout(() => {
      clearPlayedHistory();
      beginPlayerTurn();
      renderBattle();
    }, 3000);
  };

  try{
    applyStartOfTurn(b.enemy);
    renderBattle();
    if(checkBattleEnd()) return;

    if(b.enemy.effects.stunTurns > 0){
      b.enemy.effects.stunTurns -= 1;
      addLog(b.enemy.name + " perdeu o turno por Defesa.");
      finishEnemyTurn();
      return;
    }

    if(b.enemy.effects.comboNext > 0){
      b.enemy.energy = b.enemy.maxEnergy + 2;
      b.enemy.effects.comboNext = 0;
      addLog(b.enemy.name + " ativou Combo.");
    }

    addLog("Turno do " + b.enemy.name + ".");

    const chooseEnemyCardIndex = () => {
      let bestIndex = -1;
      let bestScore = -999;
      b.enemy.hand.forEach((id, idx) => {
        const c = getCard(id);
        if(!c) return;
        const s = scoreCardForBot(c, b.enemy, b.player, b.profile, b.level);
        if(s > bestScore){
          bestScore = s;
          bestIndex = idx;
        }
      });
      return bestIndex;
    };

    const canPlayAny = () => {
      return b.enemy.hand.some((id) => {
        const c = getCard(id);
        return c && c.cost <= b.enemy.energy && scoreCardForBot(c, b.enemy, b.player, b.profile, b.level) >= 0;
      });
    };

    const performEnemyCard = () => {
      if(!gameState.battle) return;

      const bestIndex = chooseEnemyCardIndex();
      if(bestIndex < 0){
        finishEnemyTurn();
        return;
      }

      const cardId = b.enemy.hand[bestIndex];
      const card = getCard(cardId);
      if(!card || card.cost > b.enemy.energy){
        finishEnemyTurn();
        return;
      }

      try{
        b.enemy.energy -= card.cost;
        b.enemy.hand.splice(bestIndex,1);
        b.enemy.discard.push(cardId);
        pushPlayedCard("enemy", cardId);
        renderPlayedHistory();
        applyCard(card, b.enemy, b.player);
        renderBattle();
      }catch(err){
        showDebug("Erro na jogada do bot: " + (err && err.message ? err.message : err));
        finishEnemyTurn();
        return;
      }

      if(checkBattleEnd()) return;

      if(canPlayAny()){
        setTimeout(performEnemyCard, 900);
      } else {
        finishEnemyTurn();
      }
    };

    if(canPlayAny()){
      performEnemyCard();
    } else {
      finishEnemyTurn();
    }
  }catch(err){
    showDebug("Erro no turno do bot: " + (err && err.message ? err.message : err));
    finishEnemyTurn();
  }
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

function finishBattle(win){
  const previousLevel = gameState.save.level;

  if(win){
    gameState.save.wins += 1;
    if(gameState.save.level < MAX_LEVEL) gameState.save.level += 1;
    gameState.save.pausedBattle = null;
    gameState.save.canContinue = true;
    gameState.save.lastNotice = "Vitória. Sua jornada segue no nível " + gameState.save.level + ".";
    saveBattleGrimorio(true);
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
    renderGrimorioPanel();

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
    gameState.save.lastNotice = "Você perdeu esta batalha. A jornada continua disponível no menu.";
    saveBattleGrimorio(false);
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