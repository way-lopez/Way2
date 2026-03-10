function renderChoice(){
  const grid = el("choiceGrid");
  grid.innerHTML = "";
  el("choiceLevel").textContent = gameState.save.level;

  gameState.pendingChoice.forEach((card, index) => {
    const vis = getCardVisual(card);
    const div = document.createElement("div");
    div.className = "card choice-card tall-choice " + vis.css;
    div.innerHTML = `
      ${buildCardInner(card, true)}
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

function resetSave(){
  const ok = confirm("Apagar todo o save?");
  if(!ok) return;
  gameState.save = defaultSave();
  saveSave();
  closeOptions();
  goMenu();
  alert("Save resetado.");
}


// Expose public actions used by HTML onclicks
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
window.openCardModal = openCardModal;
window.closeCardModal = closeCardModal;
window.toggleLog = toggleLog;

// Boot
gameState.save = loadSave();
clearDebug();
renderMenuStats();
