// js/app.js — acciones (data-action), listeners y arranque.
// Flujo: celular simulado (home) → aviso o nota → check-in → alternativas y tiempo → feed → salida → cierre → home.
//
// Los archivos se cargan con <script> en este orden (ver index.html); comparten el mismo ámbito global:
//   data.js, components/ui.js · textos y datos de ejemplo; componentes (botón, chip, tarjetas, personajes)
//   core/state.js             · modo demo, perfil y estado (state)
//   core/timers.js, storage.js · avisos de tiempo y registro de entradas (localStorage)
//   core/router.js            · go(), screen() y el objeto renderers
//   screens/flujo/*.js        · una pantalla por archivo: abrir una red (home, nota, responder, alternativa, entrando, feed, pasaste, cierre)
//   screens/pilas/*.js        · una pantalla por archivo: dentro de PILAS (inicio, grupo, descanso, dejarmensaje, yo)
//   components/*.js           · todos los componentes: ui.js (botón, chip, tarjetas, personajes) y las piezas de Hoy, Grupo y Yo (bottomNav, focusRing, retos)
//   screens/onEnter.js        · efectos al entrar a una pantalla
//   sheets/*.js, core/flow.js · hojas inferiores (avisos, check-in, salida, selector) y pasos del flujo
//   app.js (este archivo)     · actions, listeners y arranque
  // ---------- Acciones (un solo listener) ----------
  // Cada clave es un valor de data-action en el HTML; el listener de abajo llama a la que corresponda.
  const actions = {
    // Abrir una red: aviso previo, nota de un amigo y respuesta
    "open-home-demo": () => go("home"),
    "open-app": (v) => {
      resetSession(); state.app = v;
      // Ajuste "Pausa antes de abrir redes" apagado: PILAS no interviene, entra directo.
      if (!state.settings.pauseBeforeOpen) return go("entrando");
      if (state.descanso.active) return openInterstitial("descanso");
      const joinedId = Object.keys(state.joinedChallenges).find((id) => state.joinedChallenges[id]);
      if (joinedId) {
        const c = [...D.challenges, ...state.customChallenges].find((x) => x.id === joinedId);
        return openInterstitial("reto", c);
      }
      continueOpenApp();
    },
    "interstitial-keep-descanso": () => { closeSheet(); go("home"); },
    "interstitial-keep-reto": () => { closeSheet(); go("home"); },
    "interstitial-enter": () => { closeSheet(); recordDescansoEnd(); continueOpenApp(); },

    "note-reply": () => go("responder"),
    "note-enter": () => afterNote(),
    "pick-reply": (v) => { state.replyChoice = Number(v); rerender(); },
    "pick-reply-char": (v) => { state.replyChar = v; rerender(); },
    "reply-send": () => { state.replySent = true; go("nota"); }, // vuelve a la nota; de ahí entra cuando quiera
    "reply-back": () => go("nota"),

    // Navegación dentro de PILAS, retos, metas y ajustes
    "open-pilas": () => go("inicio"),
    "go-grupo": () => go("grupo"),
    "go-inicio": () => go("inicio"),
    "go-descanso": () => {
      // El tiempo sugerido llega preseleccionado; Sami puede cambiarlo con los chips.
      if (!state.descanso.active && !state.descanso.timeId) state.descanso.timeId = String(D.breakSuggestion.minutes);
      go(state.descanso.active ? "descanso-activo" : "descanso");
    },
    // Acceso rápido desde Hoy: llega a Descanso con 2 min preseleccionados (si ya hay uno activo, lo retoma).
    "descanso-quick": () => {
      if (state.descanso.active) return go("descanso-activo");
      state.descanso.timeId = "2";
      go("descanso");
    },
    "go-yo": () => go("yo"),
    "toggle-challenge": (v) => { state.joinedChallenges[v] = !state.joinedChallenges[v]; rerender(); },
    "open-propose-challenge": () => openPicker("Proponer un reto", "Elige uno para tu grupo.", D.challengeSuggestions,
      // Grupo solo muestra el último reto propio: los anteriores se sueltan para que no queden unidos sin verse.
      (title) => { state.customChallenges.forEach((c) => { state.joinedChallenges[c.id] = false; }); const id = `custom-${Date.now().toString(36)}`; state.customChallenges.push({ id, title, friends: [] }); state.joinedChallenges[id] = true; }),
    "open-add-goal": () => openPicker("Agregar meta", "Elige una para este mes.", D.goalSuggestions,
      (title) => { state.customGoals.push({ id: `custom-${Date.now().toString(36)}`, title, current: 0, target: 1, unit: "veces" }); }),
    "picker-choose": (v) => { picker.picked = Number(v); renderPicker(); },
    "picker-save": () => { picker.onSave(picker.options[picker.picked]); closeSheet(); picker = null; rerender(); },
    "sheet-dismiss": () => { closeSheet(); picker = null; },
    "dismiss-goal": (v) => { state.dismissedGoalIds.push(v); rerender(); },
    "toggle-app-pause": (v) => { state.pausedApps[v] = !state.pausedApps[v]; rerender(); },
    "toggle-setting": (v) => { state.settings[v] = !state.settings[v]; rerender(); },

    // Déjale algo a un amigo
    "open-note-composer": () => { state.noteDraft = { friendId: null, suggestion: null, custom: "" }; go("dejarmensaje"); },
    "note-pick-friend": (v) => { state.noteDraft.friendId = v; rerender(); },
    "note-pick-suggestion": (v) => { state.noteDraft.suggestion = Number(v); rerender(); },
    "note-send": () => {
      const friend = D.GROUP[state.noteDraft.friendId];
      state.noteConfirmation = friend.name;
      state.noteDraft = { friendId: null, suggestion: null, custom: "" };
      go("inicio");
    },
    "note-back": () => { state.noteDraft = { friendId: null, suggestion: null, custom: "" }; go("inicio"); },

    // El tiempo se elige aquí y solo aquí
    "pick-time": (v) => { state.timeId = v; state.minutes = D.times.find((t) => t.id === v).minutes; rerender(); },

    // Check-in en hoja: una emoción y sigue a las alternativas
    "checkin-pick-emotion": (v) => { checkin.emotion = v; renderCheckin(); },
    "checkin-enter": () => { state.emotionIn = checkin.emotion; closeSheet(); checkin = null; goAlternativa(); },
    "checkin-skip": () => { closeSheet(); checkin = null; go("entrando"); }, // nunca se bloquea la entrada

    "pick-alt": (v) => { state.alt = Number(v); go("alternativa-hecha"); },
    "alt-enter": () => go("entrando"),

    "feed-exit": () => { clearTimer(); openExitSheet(); },
    "sheet-exit": () => { clearTimer(); openExitSheet(); }, // reemplaza el contenido de la hoja, ya abierta
    "sheet-more": () => { closeSheet(); schedule(5, () => go("pasaste")); },
    "over-exit": () => { clearTimer(); go("feed", { soft: true }); openExitSheet(); },
    "over-continue": () => { go("feed"); schedule(5, () => go("pasaste")); },

    // ¿Cómo te sientes después?: guarda y pasa al cierre
    "checkout-pick": (v) => { state.emotionOut = v; saveCurrentEntry(); closeExitSheetAndShowClosing(); },
    "checkout-skip": () => { saveCurrentEntry(); closeExitSheetAndShowClosing(); },

    "go-today": () => go("inicio"),

    // Descanso
    "descanso-pick-time": (v) => { state.descanso.timeId = v; rerender(); },
    "descanso-start": () => {
      const t = D.breakTimes.find((t) => t.id === state.descanso.timeId);
      state.descanso.active = true; state.descanso.minutes = t.minutes; state.descanso.startedAt = Date.now();
      go("descanso-activo");
    },
    "descanso-go-home": () => go("home"),
    "descanso-end": () => endDescanso(),
    "descanso-close": () => go("inicio"),

    "reset-all": resetAll,
  };

  document.addEventListener("click", (ev) => {
    // Tocar personaje: parpadea una vez
    const ch = ev.target.closest(".character");
    if (ch) { ch.classList.remove("blink"); void ch.getBoundingClientRect(); ch.classList.add("blink"); }

    const el = ev.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const a = el.dataset.action;
    if (a === "statusbar") return tripleTap();
    actions[a]?.(el.dataset.value);
  });

  // Escape en la hoja inferior = tocar fuera de ella (cada hoja define esa acción en su fondo)
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape" || $("#sheet-layer").hidden) return;
    const a = $("#sheet-layer .sheet-backdrop").dataset.action;
    if (a) actions[a]?.();
  });

  // Texto libre de "Dejarle algo a un amigo": actualiza el estado y el botón sin
  // rehacer la pantalla completa (perdería el foco y la posición del cursor).
  document.addEventListener("input", (ev) => {
    if (!ev.target.matches('[data-action="note-type"]')) return;
    state.noteDraft.custom = ev.target.value;
    const sendBtn = document.querySelector('[data-action="note-send"]');
    if (sendBtn) sendBtn.disabled = !(state.noteDraft.friendId && (state.noteDraft.custom.trim() || state.noteDraft.suggestion != null));
  });

  // ---------- Botón oculto de demo: triple toque en la barra de estado ----------
  let taps = [];
  function tripleTap() {
    const now = Date.now();
    taps = [...taps.filter((t) => now - t < 600), now];
    if (taps.length >= 3) { taps = []; demo = !demo; updateDemoFlag(); }
  }
  const updateDemoFlag = () => ($("#demo-flag").hidden = !demo);

  // ---------- Reloj ----------
  const clockText = () => new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: false });
  function tick() { $("#clock").textContent = clockText(); const c = $("#home-clock"); if (c) c.textContent = clockText(); }

  // ---------- Arranque ----------
  updateDemoFlag();
  tick(); setInterval(tick, 30000);
  loadEntries(); // precarga los datos de ejemplo si no hay nada guardado
  go("home"); // la app abre en el celular simulado; Hoy se alcanza con el ícono PILAS
