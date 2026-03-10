
function classifyCardType(card){
  if(!card || !card.type) return "special";
  if(card.type === "support") return "buff";
  if(card.type === "attack") return "attack";
  if(card.type === "defense") return "defense";
  if(card.type === "buff") return "buff";
  if(card.type === "debuff") return "debuff";
  return "special";
}

function normalizePlayedItem(item){
  if(!item) return null;
  if(typeof item === "string") return { id: item };
  if(typeof item === "object" && item.id) return item;
  return null;
}

function pushPlayedCard(side, cardId){
  if(!gameState.roundPlayed || !gameState.roundPlayed[side]){
    gameState.roundPlayed = { player: [], enemy: [] };
  }
  gameState.roundPlayed[side].push({ id: cardId });
  gameState.roundPlayed[side] = gameState.roundPlayed[side].slice(-3);
}

function pushGrimorioEntry(text){
  gameState.battleHistory.push(text);
  if(gameState.battleHistory.length > 120) gameState.battleHistory.shift();
}

function iconForCard(card){
  const type = classifyCardType(card);
  if(type === "attack") return "⚔️";
  if(type === "defense") return "🛡️";
  if(type === "buff") return "✨";
  if(type === "debuff") return "☠️";
  return "✦";
}

function renderPlayedHistory(){
  const playerWrap = el("playerPlayedCards");
  const enemyWrap = el("enemyPlayedCards");
  if(!playerWrap || !enemyWrap) return;

  const renderSide = (wrap, items) => {
    wrap.innerHTML = "";
    const shown = Array.isArray(items) ? items.slice(-3) : [];
    for(let i = 0; i < 3; i++){
      const item = normalizePlayedItem(shown[i]);
      const div = document.createElement("div");
      if(!item){
        div.className = "played-slot empty";
        div.innerHTML = '<div class="slot-icon">✦</div><div class="slot-name">—</div><div class="slot-meta">vazio</div>';
      } else {
        const card = getCard(item.id);
        const css = classifyCardType(card);
        const title = card ? card.name : String(item.id || "Carta");
        const cost = card ? card.cost : "?";
        div.className = "played-slot " + css;
        div.innerHTML = `<div class="slot-icon">${iconForCard(card)}</div><div class="slot-name">${title}</div><div class="slot-meta">custo ${cost}</div>`;
      }
      wrap.appendChild(div);
    }
  };

  try{
    renderSide(playerWrap, gameState.roundPlayed?.player || []);
    renderSide(enemyWrap, gameState.roundPlayed?.enemy || []);
  }catch(err){
    showDebug("Erro ao renderizar os slots da rodada: " + (err && err.message ? err.message : err));
  }
}

function clearPlayedHistory(){
  gameState.roundPlayed = { player: [], enemy: [] };
  renderPlayedHistory();
}

function saveBattleGrimorio(win){
  gameState.save.lastBattleGrimorio = {
    win: !!win,
    level: gameState.save.level,
    log: [...gameState.battleHistory],
    playerCards: [...(gameState.roundPlayed?.player || [])],
    enemyCards: [...(gameState.roundPlayed?.enemy || [])]
  };
  saveSave();
}

function renderGrimorioPanel(){
  const panel = el("grimorioPanel");
  const content = el("grimorioContent");
  if(!panel || !content) return;
  const data = gameState.save.lastBattleGrimorio;
  if(!data || !Array.isArray(data.log) || data.log.length === 0){
    panel.classList.add("hidden");
    content.innerHTML = "";
    return;
  }
  panel.classList.remove("hidden");

  const summarizeCards = (arr) => {
    if(!arr || arr.length === 0) return "Nenhuma carta registrada.";
    return arr.slice(-3).map(item => {
      const card = getCard(item.id);
      return card ? card.name : (item.id || "Carta");
    }).join(", ");
  };

  content.innerHTML = `
    <div class="grimorio-block">
      <h4>Resumo</h4>
      <div class="stat-row"><span>Resultado</span><strong>${data.win ? "Vitória" : "Derrota"}</strong></div>
      <div class="stat-row"><span>Nível registrado</span><strong>${data.level}</strong></div>
      <div class="stat-row"><span>Últimas cartas do player</span><strong>${summarizeCards(data.playerCards)}</strong></div>
      <div class="stat-row"><span>Últimas cartas do bot</span><strong>${summarizeCards(data.enemyCards)}</strong></div>
    </div>
    <div class="grimorio-block">
      <h4>Registro da batalha</h4>
      <div class="grimorio-log">${data.log.map(line => `<div>${decorateLog(line)}</div>`).join("")}</div>
    </div>
  `;
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

function addLog(text){
  const log = el("battleLog");
  if(!log) return;
  const div = document.createElement("div");
  div.innerHTML = decorateLog(text);
  log.appendChild(div);
  pushGrimorioEntry(text);
  log.scrollTop = log.scrollHeight;
}