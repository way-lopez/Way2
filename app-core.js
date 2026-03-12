
const SAVE_KEY = "magic_of_despair_modular_v2_i18n";

const gameState = {
  save: null,
  battle: null,
  pendingChoice: null,
  pendingEvent: null,
  battleHistory: [],
  roundPlayed: { player: [], enemy: [] }
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
    pausedBattle: null,
    canContinue: false,
    lastNotice: "",
    lastBattleGrimorio: null
  };
}

function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    const save = {
      ...defaultSave(),
      ...parsed,
      playerChoices: Array.isArray(parsed.playerChoices) ? parsed.playerChoices : [],
      botChoices: Array.isArray(parsed.botChoices) ? parsed.botChoices : [],
      options: { ...defaultSave().options, ...(parsed.options || {}) }
    };

    const validPaused =
      save.pausedBattle &&
      typeof save.pausedBattle === "object" &&
      save.pausedBattle.player &&
      save.pausedBattle.enemy &&
      Array.isArray(save.pausedBattle.player.hand) &&
      Array.isArray(save.pausedBattle.enemy.hand);

    if(!validPaused){
      save.pausedBattle = null;
    }

    if(!save.lastBattleGrimorio || typeof save.lastBattleGrimorio !== "object"){
      save.lastBattleGrimorio = null;
    }

    return save;
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
  const hasJourney = hasPaused || gameState.save.level > 1 || gameState.save.playerChoices.length > 0 || gameState.save.botChoices.length > 0;
  el("statJourney").textContent = hasPaused ? t("journey_paused") : (hasJourney ? t("journey_running") : t("journey_new"));

  const continueBtn = el("continueBtn");
  if(continueBtn){
    if(hasJourney){
      continueBtn.classList.remove("hidden");
      continueBtn.textContent = hasPaused ? t("continue_battle") : t("continue_journey");
    } else {
      continueBtn.classList.add("hidden");
    }
  }

  const note = el("menuNotice");
  if(note){
    if(hasJourney && gameState.save.lastNotice){
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
    div.innerHTML = buildCardInner(card, false);
    div.onclick = function(){ openCardModal(card.id); };
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

function goMenu(){
  renderMenuStats();
  showScreen("menu");
}

function exitGame(){ alert(t("exit_alert")); }

function snapshotBattle(){
  if(!gameState.battle) return null;
  return JSON.parse(JSON.stringify(gameState.battle));
}

function persistPausedBattle(){
  if(!gameState.battle) return;
  gameState.save.pausedBattle = snapshotBattle();
  gameState.save.canContinue = true;
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.save));
}

function clearPausedBattle(){
  gameState.save.pausedBattle = null;
  gameState.save.canContinue = gameState.save.level > 1 || gameState.save.playerChoices.length > 0 || gameState.save.botChoices.length > 0;
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.save));
}

function continueGame(){
  gameState.save.lastNotice = "";
  if(gameState.save.pausedBattle){
    gameState.battle = JSON.parse(JSON.stringify(gameState.save.pausedBattle));
    renderBattle();
    showScreen("battle");
    return;
  }
  startBattle();
}

function startNewGame(){
  const ok = confirm(t("confirm_new_game"));
  if(!ok) return;
  gameState.save = defaultSave();
  saveSave();
  startBattle();
}

function returnToMenu(){
  if(gameState.battle){
    gameState.save.lastNotice = t("notice_paused");
    persistPausedBattle();
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