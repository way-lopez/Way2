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

  el("resultTitle").textContent = t("choice_new_card_title");
  el("resultText").textContent = t("choice_you_picked",{chosen:chosen.name, other:other.name});
  el("resultStats").innerHTML = `
    <div class="stat-row"><span>${t("your_new_card")}</span><strong>${chosen.name}</strong></div>
    <div class="stat-row"><span>${t("bot_card")}</span><strong>${other.name}</strong></div>
    <button class="btn primary" onclick="continueAfterChoice()">${t("continue")}</button>
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
    title.textContent = t("event_purification_title");
    text.textContent = t("event_purification_text");
    const playerDeck = [...new Set(buildDeckFromChoices(gameState.save.playerChoices).filter(id => STARTER_CARDS.some(c => c.id === id)))];
    playerDeck.forEach(id => {
      const card = getCard(id);
      const vis = getCardVisual(card);
      const div = document.createElement("div");
      div.className = "card choice-card " + vis.css;
      div.innerHTML = `<div class="card-name">${card.name}</div><div class="card-desc">${card.desc}</div><button class="btn primary" onclick="applyEvent('removeWeak','${id}')>${t("event_remove")}</button>`;
      choices.appendChild(div);
    });
  } else if(type === "duplicate"){
    title.textContent = t("event_echo_title");
    text.textContent = t("event_echo_text");
    const unique = [...new Set(gameState.save.playerChoices)];
    unique.forEach(id => {
      const card = getCard(id);
      const vis = getCardVisual(card);
      const div = document.createElement("div");
      div.className = "card choice-card " + vis.css;
      div.innerHTML = `<div class="card-name">${card.name}</div><div class="card-desc">${card.desc}</div><button class="btn primary" onclick="applyEvent('duplicate','${id}')>${t("event_duplicate")}</button>`;
      choices.appendChild(div);
    });
  } else if(type === "hpBonus"){
    title.textContent = t("event_rest_title");
    text.textContent = t("event_rest_text");
    const div = document.createElement("div");
    div.className = "card choice-card buff";
    div.innerHTML = `<div class="card-name">${t("event_rest_name")}</div><div class="card-desc">${t("event_rest_desc")}</div><button class="btn primary" onclick="applyEvent('hpBonus','6')">${t("event_receive_bonus")}</button>`;
    choices.appendChild(div);
  } else if(type === "transmute"){
    title.textContent = t("event_transmute_title");
    text.textContent = t("event_transmute_text");
    const playerDeck = [...new Set(buildDeckFromChoices(gameState.save.playerChoices).filter(id => STARTER_CARDS.some(c => c.id === id)))];
    playerDeck.forEach(id => {
      const card = getCard(id);
      const div = document.createElement("div");
      div.className = "card choice-card special";
      div.innerHTML = `<div class="card-name">${card.name}</div><div class="card-desc">${card.desc}</div><button class="btn primary" onclick="applyEvent('transmute','${id}')>${t("event_transmute")}</button>`;
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

  el("resultTitle").textContent = t("event_done_title");
  el("resultText").textContent = t("event_done_text");
  el("resultStats").innerHTML = `<button class="btn primary" onclick="startBattle()">${t("next_battle")}</button>`;
  showScreen("result");
}

function skipEvent(){
  el("resultTitle").textContent = t("event_skipped_title");
  el("resultText").textContent = t("event_skipped_text");
  el("resultStats").innerHTML = `<button class="btn primary" onclick="startBattle()">${t("next_battle")}</button>`;
  showScreen("result");
}

function resetSave(){
  const ok = confirm(t("confirm_reset"));
  if(!ok) return;
  gameState.save = defaultSave();
  saveSave();
  closeOptions();
  goMenu();
  alert(t("save_reset_done"));
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
const storedLang = localStorage.getItem(LANG_STORAGE_KEY) || (gameState.save && gameState.save.options && gameState.save.options.language) || "";
if(storedLang){
  setCurrentLanguage(storedLang);
}
clearDebug();
applyStaticTranslations();
renderMenuStats();
showScreen(storedLang ? "menu" : "languageGate");