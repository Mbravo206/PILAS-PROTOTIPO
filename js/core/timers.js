// js/core/timers.js — timers sin contador visible. Extraído de app.js; el timer del descanso es aparte (ver abajo).
  // ---------- Timers (sin contador visible) ----------
  let timer = null;
  const clearTimer = () => { clearTimeout(timer); timer = null; };
  const schedule = (minutes, fn) => { clearTimer(); timer = setTimeout(fn, minutes * minuteMs()); };
  const realMinutes = () =>
    state.startedAt ? Math.max(1, Math.round((Date.now() - state.startedAt) / minuteMs())) : 0;

  // Timer propio del descanso: abrir una red (resetSession → clearTimer) no debe cancelar el fin del descanso.
  let descansoTimer = null;
  const clearDescansoTimer = () => { clearTimeout(descansoTimer); descansoTimer = null; };
  const scheduleDescanso = (minutes, fn) => { clearDescansoTimer(); descansoTimer = setTimeout(fn, minutes * minuteMs()); };
