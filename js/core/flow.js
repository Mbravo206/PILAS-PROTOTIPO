// js/core/flow.js — pasos del flujo: fin de descanso, nota, alternativas. Extraído de app.js; el fin de descanso usa su propio timer.
  // Cierra un descanso activo (manual, automático, o porque se entró a una red igual)
  // y lo guarda en el historial con el tiempo real, sin castigo.
  function recordDescansoEnd() {
    if (!state.descanso.active) return;
    clearDescansoTimer(); // cancela el auto-fin pendiente (p. ej. si se entró igual a la red)
    const real = state.descanso.startedAt ? Math.max(1, Math.round((Date.now() - state.descanso.startedAt) / minuteMs())) : 0;
    state.descansoHistory.push({ id: Date.now().toString(36), minutes: state.descanso.minutes, realMinutes: real, date: new Date().toISOString() });
    state.descanso = { active: false, startedAt: null, minutes: null, timeId: null };
  }
  function endDescanso() { clearDescansoTimer(); recordDescansoEnd(); go("descanso-fin"); }
  // Fin por tiempo cumplido. Si Sami está dentro de una red (p. ej. con "Pausa antes de abrir redes" apagada),
  // solo se registra el fin: no se lo saca del feed ni se cancela el aviso de tiempo de la red.
  const inNetwork = () => ["entrando", "feed", "pasaste", "cierre"].includes(state.screen);
  function autoEndDescanso() {
    if (!state.descanso.active) return;
    if (inNetwork()) recordDescansoEnd(); else endDescanso();
  }

  // Sigue el flujo normal de abrir una red: nota de un amigo (si hay) y luego el check-in.
  function continueOpenApp() {
    if (state.noteQueue.length) { state.currentNote = state.noteQueue.shift(); state.replyChoice = null; state.replyChar = null; state.replySent = false; go("nota"); return; }
    afterNote();
  }
  const afterNote = () => openCheckin();

  // Alternativas según cómo llega Sami
  const alternativesFor = () => D.alternatives[state.emotionIn] || D.alternatives.default;

  // El tiempo llega preseleccionado con el de la última vez (o 10 min): nunca bloquea entrar.
  function goAlternativa() {
    const id = timeIdForMinutes(mostRecentEntry()?.minutes) ?? "10";
    state.timeId = id;
    state.minutes = D.times.find((t) => t.id === id).minutes;
    go("alternativa");
  }
