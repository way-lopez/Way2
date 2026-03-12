
const LANG_STORAGE_KEY = "magic_of_despair_language_v1";

const UI_STRINGS = {
  pt: {
    document_title:"Magic Of Despair", lang_title:"Selecione seu idioma", lang_subtitle:"Escolha o idioma antes de entrar no menu principal.",
    continue:"Continuar", continue_battle:"Continuar batalha", continue_journey:"Continuar jornada", new_game:"Iniciar novo jogo",
    options:"Opções", cards:"Cartas", exit:"Sair", unlocked_cards:"Cartas desbloqueadas", active_deck:"Cartas ativas no deck",
    max_hand:"Mão máxima", energy_per_turn:"Energia por turno", level:"Nível", journey_state:"Estado da jornada",
    journey_new:"Nova run", journey_running:"Run em andamento", journey_paused:"Batalha pausada",
    deck_title:"Cartas liberadas", deck_intro:"O deck é automático. Ao subir de nível, você escolhe 1 carta; a outra vai para o bot.",
    deck_count:"Cartas no seu deck", current_level:"Nível atual", back:"Voltar", event_skip:"Pular",
    choice_title:"Escolha sua nova carta", choice_intro:"Escolha 1 carta. A outra será absorvida pelo deck inimigo.",
    enemy_hand:"Mão do inimigo", played_title:"Cartas jogadas nesta rodada", played_note:"Até 3 do player e 3 do bot",
    player_label:"Player", bot_label:"Bot", deck_arcane:"Deck Arcano", your_hand:"Sua mão", end_turn:"Encerrar turno",
    result:"Resultado", battle_grimoire:"Grimório da batalha", back_menu:"Voltar ao menu", view_cards:"Ver cartas",
    save_options:"Salvar opções", reset_save:"Resetar save", close:"Fechar", music_volume:"Volume de música",
    sfx_volume:"Volume de efeitos", language:"Idioma", card_modal_long:"Descrição detalhada", card_modal_tips:"Uso estratégico",
    card_modal_details:"Detalhes", empty:"vazio", cost:"custo",
    card_type_attack:"Ataque", card_type_defense:"Defesa", card_type_buff:"Buff", card_type_debuff:"Debuff", card_type_special:"Especial", card_type_support:"Suporte",
    rarity_initial:"Inicial", rarity_media:"Média", rarity_dificil:"Difícil",
    turn_player:"Turno: Player", turn_enemy:"Turno: {name}", no_cards_hand:"Sem cartas na mão.", choose:"Escolher",
    event_purification_title:"Evento: Purificação", event_purification_text:"Escolha uma carta inicial fraca para remover permanentemente do seu deck base.",
    event_echo_title:"Evento: Eco", event_echo_text:"Escolha uma carta desbloqueada para duplicar na sua coleção.",
    event_rest_title:"Evento: Descanso", event_rest_text:"Ganhe +6 HP apenas no próximo combate.", event_rest_name:"Descansar", event_rest_desc:"Receba +6 HP no próximo combate.", event_receive_bonus:"Receber bônus",
    event_transmute_title:"Evento: Transmutação", event_transmute_text:"Troque uma carta inicial fraca por uma carta média aleatória.",
    event_remove:"Remover", event_duplicate:"Duplicar", event_transmute:"Transmutar",
    event_done_title:"Evento concluído", event_done_text:"O evento foi aplicado com sucesso.",
    event_skipped_title:"Evento pulado", event_skipped_text:"Você ignorou o evento.", next_battle:"Ir para a próxima batalha",
    choice_new_card_title:"Nova carta", choice_you_picked:"Você escolheu {chosen}. O bot recebeu {other}.", your_new_card:"Sua nova carta", bot_card:"Carta do bot",
    victory:"Vitória", defeat:"Derrota", result_level_up:"Você venceu e subiu de nível.", result_max_level:"Você venceu no nível máximo.",
    cards_unlocked:"Cartas desbloqueadas", cards_active:"Cartas ativas no deck", current_hp_curve:"HP atual da curva", result_energy:"Energia por turno",
    summary:"Resumo", battle_record:"Registro da batalha", no_records:"Nenhuma carta registrada.",
    remove_effect_poison:"veneno", remove_effect_curse:"maldição", remove_effect_rebote:"rebote", remove_effect_buffatk:"buff", remove_effect_regen:"imortalidade",
    confirm_new_game:"Iniciar novo jogo? Isso apaga a jornada atual.", confirm_reset:"Apagar todo o save?", save_reset_done:"Save resetado.",
    exit_alert:"Para sair, feche a aba do navegador.", notice_paused:"Batalha pausada. Você pode continuar de onde parou ou iniciar um novo jogo.",
    notice_active:"Sua jornada está ativa no nível {level}.", notice_victory:"Vitória. Sua jornada segue no nível {level}.", notice_defeat:"Você perdeu esta batalha. A jornada continua disponível no menu.",
    battle_started:"Batalha iniciada.", battle_hp_start:"Player começa com {playerHp} HP. Bot começa com {enemyHp} HP.", battle_archetype:"Arquétipo inimigo: {arch}.",
    battle_early_balanced:"Nível inicial balanceado: bot sem reforço de arquétipo e IA simplificada.", insufficient_energy:"Energia insuficiente para {card}.",
    your_turn:"Seu turno.", combo_player:"Combo ativo: Player ganhou energia extra neste turno."
  },
  en: {
    document_title:"Magic Of Despair", lang_title:"Select your language", lang_subtitle:"Choose the language before entering the main menu.",
    continue:"Continue", continue_battle:"Resume battle", continue_journey:"Continue journey", new_game:"Start new game",
    options:"Options", cards:"Cards", exit:"Exit", unlocked_cards:"Unlocked cards", active_deck:"Active deck cards",
    max_hand:"Max hand", energy_per_turn:"Energy per turn", level:"Level", journey_state:"Journey status",
    journey_new:"New run", journey_running:"Run in progress", journey_paused:"Battle paused",
    deck_title:"Unlocked cards", deck_intro:"The deck is automatic. When you level up, you choose 1 card; the other goes to the bot.",
    deck_count:"Cards in your deck", current_level:"Current level", back:"Back", event_skip:"Skip",
    choice_title:"Choose your new card", choice_intro:"Choose 1 card. The other will be absorbed by the enemy deck.",
    enemy_hand:"Enemy hand", played_title:"Cards played this round", played_note:"Up to 3 from the player and 3 from the bot",
    player_label:"Player", bot_label:"Bot", deck_arcane:"Arcane deck", your_hand:"Your hand", end_turn:"End turn",
    result:"Result", battle_grimoire:"Battle grimoire", back_menu:"Back to menu", view_cards:"View cards",
    save_options:"Save options", reset_save:"Reset save", close:"Close", music_volume:"Music volume",
    sfx_volume:"Effects volume", language:"Language", card_modal_long:"Detailed description", card_modal_tips:"Strategic use",
    card_modal_details:"Details", empty:"empty", cost:"cost",
    card_type_attack:"Attack", card_type_defense:"Defense", card_type_buff:"Buff", card_type_debuff:"Debuff", card_type_special:"Special", card_type_support:"Support",
    rarity_initial:"Starter", rarity_media:"Medium", rarity_dificil:"Hard",
    turn_player:"Turn: Player", turn_enemy:"Turn: {name}", no_cards_hand:"No cards in hand.", choose:"Choose",
    event_purification_title:"Event: Purification", event_purification_text:"Choose a weak starter card to permanently remove from your base deck.",
    event_echo_title:"Event: Echo", event_echo_text:"Choose an unlocked card to duplicate in your collection.",
    event_rest_title:"Event: Rest", event_rest_text:"Gain +6 HP only in the next combat.", event_rest_name:"Rest", event_rest_desc:"Receive +6 HP in the next battle.", event_receive_bonus:"Receive bonus",
    event_transmute_title:"Event: Transmutation", event_transmute_text:"Swap a weak starter card for a random medium card.",
    event_remove:"Remove", event_duplicate:"Duplicate", event_transmute:"Transmute",
    event_done_title:"Event completed", event_done_text:"The event was applied successfully.",
    event_skipped_title:"Event skipped", event_skipped_text:"You ignored the event.", next_battle:"Go to the next battle",
    choice_new_card_title:"New card", choice_you_picked:"You chose {chosen}. The bot received {other}.", your_new_card:"Your new card", bot_card:"Bot card",
    victory:"Victory", defeat:"Defeat", result_level_up:"You won and leveled up.", result_max_level:"You won at the maximum level.",
    cards_unlocked:"Unlocked cards", cards_active:"Active deck cards", current_hp_curve:"Current HP curve", result_energy:"Energy per turn",
    summary:"Summary", battle_record:"Battle record", no_records:"No cards recorded.",
    remove_effect_poison:"poison", remove_effect_curse:"curse", remove_effect_rebote:"rebound", remove_effect_buffatk:"buff", remove_effect_regen:"immortality",
    confirm_new_game:"Start a new game? This will erase the current journey.", confirm_reset:"Delete the entire save?", save_reset_done:"Save reset.",
    exit_alert:"To leave, close the browser tab.", notice_paused:"Battle paused. You can continue where you stopped or start a new game.",
    notice_active:"Your journey is active at level {level}.", notice_victory:"Victory. Your journey continues at level {level}.", notice_defeat:"You lost this battle. The journey remains available in the menu.",
    battle_started:"Battle started.", battle_hp_start:"Player starts with {playerHp} HP. Bot starts with {enemyHp} HP.", battle_archetype:"Enemy archetype: {arch}.",
    battle_early_balanced:"Early game balanced: bot without archetype reinforcement and with simplified AI.", insufficient_energy:"Not enough energy for {card}.",
    your_turn:"Your turn.", combo_player:"Combo active: Player gained extra energy this turn."
  },
  es: {
    document_title:"Magic Of Despair", lang_title:"Selecciona tu idioma", lang_subtitle:"Elige el idioma antes de entrar al menú principal.",
    continue:"Continuar", continue_battle:"Continuar batalla", continue_journey:"Continuar aventura", new_game:"Iniciar nuevo juego",
    options:"Opciones", cards:"Cartas", exit:"Salir", unlocked_cards:"Cartas desbloqueadas", active_deck:"Cartas activas en el mazo",
    max_hand:"Mano máxima", energy_per_turn:"Energía por turno", level:"Nivel", journey_state:"Estado de la aventura",
    journey_new:"Nueva run", journey_running:"Run en progreso", journey_paused:"Batalla pausada",
    deck_title:"Cartas desbloqueadas", deck_intro:"El mazo es automático. Al subir de nivel, eliges 1 carta; la otra va al bot.",
    deck_count:"Cartas en tu mazo", current_level:"Nivel actual", back:"Volver", event_skip:"Omitir",
    choice_title:"Elige tu nueva carta", choice_intro:"Elige 1 carta. La otra será absorbida por el mazo enemigo.",
    enemy_hand:"Mano del enemigo", played_title:"Cartas jugadas en esta ronda", played_note:"Hasta 3 del jugador y 3 del bot",
    player_label:"Jugador", bot_label:"Bot", deck_arcane:"Mazo arcano", your_hand:"Tu mano", end_turn:"Terminar turno",
    result:"Resultado", battle_grimoire:"Grimorio de batalla", back_menu:"Volver al menú", view_cards:"Ver cartas",
    save_options:"Guardar opciones", reset_save:"Reiniciar guardado", close:"Cerrar", music_volume:"Volumen de música",
    sfx_volume:"Volumen de efectos", language:"Idioma", card_modal_long:"Descripción detallada", card_modal_tips:"Uso estratégico",
    card_modal_details:"Detalles", empty:"vacío", cost:"coste",
    card_type_attack:"Ataque", card_type_defense:"Defensa", card_type_buff:"Mejora", card_type_debuff:"Perjuicio", card_type_special:"Especial", card_type_support:"Soporte",
    rarity_initial:"Inicial", rarity_media:"Media", rarity_dificil:"Difícil",
    turn_player:"Turno: Jugador", turn_enemy:"Turno: {name}", no_cards_hand:"No hay cartas en la mano.", choose:"Elegir",
    event_purification_title:"Evento: Purificación", event_purification_text:"Elige una carta inicial débil para eliminarla permanentemente de tu mazo base.",
    event_echo_title:"Evento: Eco", event_echo_text:"Elige una carta desbloqueada para duplicarla en tu colección.",
    event_rest_title:"Evento: Descanso", event_rest_text:"Gana +6 HP solo en el próximo combate.", event_rest_name:"Descansar", event_rest_desc:"Recibe +6 HP en el próximo combate.", event_receive_bonus:"Recibir bonificación",
    event_transmute_title:"Evento: Transmutación", event_transmute_text:"Cambia una carta inicial débil por una carta media aleatoria.",
    event_remove:"Eliminar", event_duplicate:"Duplicar", event_transmute:"Transmutar",
    event_done_title:"Evento completado", event_done_text:"El evento se aplicó correctamente.",
    event_skipped_title:"Evento omitido", event_skipped_text:"Ignoraste el evento.", next_battle:"Ir a la próxima batalla",
    choice_new_card_title:"Nueva carta", choice_you_picked:"Elegiste {chosen}. El bot recibió {other}.", your_new_card:"Tu nueva carta", bot_card:"Carta del bot",
    victory:"Victoria", defeat:"Derrota", result_level_up:"Has ganado y subido de nivel.", result_max_level:"Has ganado en el nivel máximo.",
    cards_unlocked:"Cartas desbloqueadas", cards_active:"Cartas activas en el mazo", current_hp_curve:"Curva actual de HP", result_energy:"Energía por turno",
    summary:"Resumen", battle_record:"Registro de la batalla", no_records:"No hay cartas registradas.",
    remove_effect_poison:"veneno", remove_effect_curse:"maldición", remove_effect_rebote:"rebote", remove_effect_buffatk:"mejora", remove_effect_regen:"inmortalidad",
    confirm_new_game:"¿Iniciar un nuevo juego? Esto borrará la aventura actual.", confirm_reset:"¿Borrar todo el guardado?", save_reset_done:"Guardado reiniciado.",
    exit_alert:"Para salir, cierra la pestaña del navegador.", notice_paused:"Batalla pausada. Puedes continuar donde te detuviste o iniciar un nuevo juego.",
    notice_active:"Tu aventura está activa en el nivel {level}.", notice_victory:"Victoria. Tu aventura sigue en el nivel {level}.", notice_defeat:"Perdiste esta batalla. La aventura sigue disponible en el menú.",
    battle_started:"Batalla iniciada.", battle_hp_start:"El jugador empieza con {playerHp} HP. El bot empieza con {enemyHp} HP.", battle_archetype:"Arquetipo enemigo: {arch}.",
    battle_early_balanced:"Juego temprano equilibrado: bot sin refuerzo de arquetipo y con IA simplificada.", insufficient_energy:"No hay suficiente energía para {card}.",
    your_turn:"Tu turno.", combo_player:"Combo activo: el jugador ganó energía extra este turno."
  }
};

const ENEMY_NAMES = {"Mini Boss Tank":{"pt":"Mini Boss Tank","en":"Mini Boss Tank","es":"Mini Jefe Tank"},"Mini Boss Venom":{"pt":"Mini Boss Venom","en":"Mini Boss Venom","es":"Mini Jefe Venom"},"Boss Final Vamp":{"pt":"Boss Final Vamp","en":"Final Boss Vamp","es":"Jefe Final Vamp"},"Venom":{"pt":"Venom","en":"Venom","es":"Venom"},"Slime":{"pt":"Slime","en":"Slime","es":"Slime"},"Bandit":{"pt":"Bandit","en":"Bandit","es":"Bandido"},"Guardian":{"pt":"Guardian","en":"Guardian","es":"Guardián"},"Plague Mage":{"pt":"Plague Mage","en":"Plague Mage","es":"Mago de la Peste"},"Blood Acolyte":{"pt":"Blood Acolyte","en":"Blood Acolyte","es":"Acólito de Sangre"},"Titan":{"pt":"Titan","en":"Titan","es":"Titán"},"Hex Lord":{"pt":"Hex Lord","en":"Hex Lord","es":"Señor Hex"},"Night Lord":{"pt":"Night Lord","en":"Night Lord","es":"Señor Nocturno"},"tank":{"pt":"tank","en":"tank","es":"tank"},"venom":{"pt":"venom","en":"venom","es":"veneno"},"vamp":{"pt":"vamp","en":"vamp","es":"vamp"}};

function getCurrentLanguage(){
  if(window.currentLanguage) return window.currentLanguage;
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if(stored) return stored;
  if(window.gameState && gameState.save && gameState.save.options && gameState.save.options.language) return gameState.save.options.language;
  return "pt";
}
function setCurrentLanguage(lang){
  window.currentLanguage = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  if(window.gameState && gameState.save){
    gameState.save.options = gameState.save.options || {};
    gameState.save.options.language = lang;
  }
}
function formatText(template, vars){
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (vars && vars[key] !== undefined ? vars[key] : `{${key}}`));
}
function t(key, vars){
  const lang = getCurrentLanguage();
  const base = UI_STRINGS[lang] || UI_STRINGS.pt;
  return formatText((base[key] !== undefined ? base[key] : (UI_STRINGS.pt[key] !== undefined ? UI_STRINGS.pt[key] : key)), vars || {});
}
function getEnemyDisplayName(name){
  const lang = getCurrentLanguage();
  return (ENEMY_NAMES[name] && ENEMY_NAMES[name][lang]) || name;
}
function translateCardTypeLabel(type){
  return t("card_type_" + type);
}
function translateRarity(r){
  if(r === "inicial") return t("rarity_initial");
  if(r === "media") return t("rarity_media");
  if(r === "dificil") return t("rarity_dificil");
  return r || "";
}
function translateEffectKey(k){
  const map = {poison:"remove_effect_poison", curse:"remove_effect_curse", rebote:"remove_effect_rebote", buffatk:"remove_effect_buffatk", regen:"remove_effect_regen"};
  return map[k] ? t(map[k]) : k;
}
function translateLogText(text){
  const lang = getCurrentLanguage();
  if(lang === "pt") return text;
  const rules = [
    [/^Batalha iniciada\.$/, () => t("battle_started")],
    [/^Player começa com (\d+) HP\. Bot começa com (\d+) HP\.$/, (_,a,b) => t("battle_hp_start",{playerHp:a, enemyHp:b})],
    [/^Arquétipo inimigo: ([^.]+)\.$/, (_,a) => t("battle_archetype",{arch:getEnemyDisplayName(a)})],
    [/^Nível inicial balanceado: bot sem reforço de arquétipo e IA simplificada\.$/, () => t("battle_early_balanced")],
    [/^Energia insuficiente para (.+)\.$/, (_,a) => t("insufficient_energy",{card:a})],
    [/^Seu turno\.$/, () => t("your_turn")],
    [/^Combo ativo: Player ganhou energia extra neste turno\.$/, () => t("combo_player")]
  ];
  for(const [pattern, fn] of rules){
    const m = text.match(pattern);
    if(m) return fn(...m);
  }
  return text;
}
function applyStaticTranslations(){
  document.title = t("document_title");
  const set=(id,key)=>{const n=document.getElementById(id); if(n) n.textContent=t(key);};
  set("langTitle","lang_title"); set("langSubtitle","lang_subtitle"); set("menuOptionsBtn","options"); set("menuCardsBtn","cards"); set("menuExitBtn","exit");
  set("labelUnlocked","unlocked_cards"); set("labelDeckSize","active_deck"); set("labelMaxHand","max_hand"); set("labelEnergyTurn","energy_per_turn"); set("labelLevel","level"); set("labelJourney","journey_state");
  set("deckTitle","deck_title"); set("deckIntro","deck_intro"); set("deckCountLabel","deck_count"); set("deckLevelLabel","current_level"); set("deckBackBtn","back");
  set("choiceTitle","choice_title"); const ci=document.getElementById("choiceIntro"); if(ci) ci.innerHTML=t("choice_intro").replace("1","<strong>1</strong>"); set("choiceLevelLabel","current_level");
  set("enemyHandLabel","enemy_hand"); set("playedTitle","played_title"); set("playedNote","played_note"); set("playedPlayerLabel","player_label"); set("playedBotLabel","bot_label"); set("battleDeckLabel","deck_arcane");
  set("playerHandTitle","your_hand"); set("playerPortraitLabel","player_label"); set("endTurnBtn","end_turn"); set("battleBackBtn","back"); set("grimorioTitle","battle_grimoire"); set("resultMenuBtn","back_menu"); set("resultCardsBtn","view_cards");
  set("optionsTitle","options"); set("musicLabel","music_volume"); set("sfxLabel","sfx_volume"); set("optionsLanguageLabel","language"); set("saveOptionsBtn","save_options"); set("resetSaveBtn","reset_save"); set("closeOptionsBtn","close");
  set("cardModalLongTitle","card_modal_long"); set("cardModalTipsTitle","card_modal_tips");
  const continueBtn=document.getElementById("continueBtn");
  if(continueBtn) continueBtn.textContent = gameState && gameState.save && gameState.save.pausedBattle ? t("continue_battle") : t("continue");
  const newBtn=document.getElementById("newGameBtn"); if(newBtn) newBtn.textContent = t("new_game");
}
function renderAllLocalized(){
  applyStaticTranslations();
  try{ if(window.renderMenuStats) renderMenuStats(); }catch(e){}
  try{ if(window.gameState && gameState.battle && window.renderBattle) renderBattle(); }catch(e){}
  try{ if(document.getElementById("deck") && document.getElementById("deck").classList.contains("active") && window.openDeck) openDeck(); }catch(e){}
  try{ if(window.renderGrimorioPanel) renderGrimorioPanel(); }catch(e){}
}
function selectLanguage(lang){
  setCurrentLanguage(lang);
  if(window.gameState && gameState.save && window.saveSave) saveSave();
  renderAllLocalized();
  if(window.showScreen) showScreen("menu");
}
function setLanguageAndRefresh(lang){
  setCurrentLanguage(lang);
  if(window.gameState && gameState.save && window.saveSave) saveSave();
  renderAllLocalized();
}
window.selectLanguage = selectLanguage;
window.setLanguageAndRefresh = setLanguageAndRefresh;
