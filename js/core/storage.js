// js/core/storage.js — persistencia en localStorage y reinicio. Extraído de app.js; resetAll también cancela el timer del descanso.
  // ---------- Persistencia: localStorage "pilas.entries" ----------
  const KEY = "pilas.entries";
  let memoryFallback = null; // si localStorage falla (modo privado, file:// en algunos navegadores)

  function loadEntries() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === null) { const seed = D.sampleEntries(); saveEntries(seed); return seed; }
      return JSON.parse(raw) || [];
    } catch (_) {
      return memoryFallback || (memoryFallback = D.sampleEntries());
    }
  }
  function saveEntries(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) { memoryFallback = list; }
  }
  function saveCurrentEntry() {
    if (state.saved) return;
    const real = realMinutes();
    state.exceeded = state.minutes != null && real > state.minutes;
    const entry = {
      id: Date.now().toString(36),
      app: state.app, emotionIn: state.emotionIn,
      minutes: state.minutes, realMinutes: real, emotionOut: state.emotionOut,
      exceeded: state.exceeded, date: new Date().toISOString(),
    };
    saveEntries([...loadEntries(), entry]);
    state.saved = true;
  }
  // Última entrada guardada: preselecciona el tiempo de las alternativas
  function mostRecentEntry() {
    const entries = loadEntries();
    return entries.length ? entries.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
  }
  const timeIdForMinutes = (m) => (m == null ? null : (D.times.find((t) => t.minutes === m) || {}).id ?? null);

  function resetAll() {
    try { localStorage.removeItem(KEY); } catch (_) {}
    memoryFallback = null;
    resetSession();
    clearDescansoTimer();
    Object.assign(state, initialProfile());
    go("home");
  }
