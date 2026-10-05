// js/core/state.js — datos, modo demo, perfil y estado de la sesión. Extraído tal cual de app.js (sin cambios de lógica).
  const D = window.PILAS_DATA;
  const { button, textButton, iconButton, character, chip, emotionCard, emotionDot, avatar, personAvatar, flower, drawing, toggle, pilasIcon } = window.UI;

  // ---------- Modo demo: 1 min elegido = 5 s reales ----------
  let demo = new URLSearchParams(location.search).get("demo") === "1";
  const minuteMs = () => (demo ? 5000 : 60000);

  // Perfil/grupo: no se borra al volver a Hoy, solo con "Reiniciar prototipo"
  function initialProfile() {
    return {
      joinedChallenges: Object.fromEntries(D.challenges.map((c) => [c.id, c.selfDefault])),
      customChallenges: [],
      noteQueue: [...D.friendNotes],
      noteDraft: { friendId: null, suggestion: null, custom: "" },
      noteConfirmation: null,
      customGoals: [],
      dismissedGoalIds: [],
      pausedApps: Object.fromEntries(D.apps.filter((a) => a.social).map((a) => [a.id, true])),
      settings: { pauseBeforeOpen: true, shareTime: true },
      descanso: { active: false, startedAt: null, minutes: null, timeId: null },
      descansoHistory: D.sampleBreaks(),
    };
  }

  // ---------- Estado de la sesión actual ----------
  const state = {
    screen: "home",
    app: null,        // red elegida al abrir el celular simulado
    emotionIn: null,  // "¿Cómo te sientes?" (hoja de check-in)
    minutes: null,    // null = sin tiempo ("Indefinido" o "Ahora no")
    timeId: null,     // chip de tiempo elegido
    startedAt: null,  // timestamp al entrar al feed
    emotionOut: null, // emoción al salir
    exceeded: false,
    alt: null,        // alternativa elegida
    saved: false,     // evita guardar dos veces la misma sesión
    currentNote: null, // nota de amigo que se está mostrando
    replyChoice: null, // respuesta rápida elegida al responder al amigo
    replyChar: null,   // muñequito elegido al responder al amigo
    replySent: false,  // ya le respondió a la nota actual (la nota se muestra con confirmación)
    ...initialProfile(),
  };

  function resetSession() {
    Object.assign(state, {
      app: null, emotionIn: null, minutes: null, timeId: null,
      startedAt: null, emotionOut: null, exceeded: false, alt: null, saved: false,
    });
    clearTimer();
  }
