// js/screens/onEnter.js — efectos al entrar a cada pantalla. Extraído de app.js; descanso-activo usa el timer del descanso.
  // Efectos al entrar a cada pantalla
  const onEnter = {
    home() {
      const c = $("#home-clock"); if (c) c.textContent = clockText();
      const d = $("#home-date");
      if (d) d.textContent = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })
        .replace(/^\w/, (m) => m.toUpperCase());
    },
    entrando() { clearTimer(); timer = setTimeout(() => go("feed"), 1000); },
    feed() {
      if (!state.startedAt) {
        state.startedAt = Date.now();
        if (state.minutes) schedule(state.minutes, openSheet); // aviso al cumplirse el tiempo
      }
    },
    cierre() { clearTimer(); timer = setTimeout(() => go("home"), 3000); },
    "descanso-activo"() {
      // Recalcula lo que falta: volver a esta pantalla (p. ej. desde el nav) no debe alargar el descanso.
      const elapsedMinutes = (Date.now() - state.descanso.startedAt) / minuteMs();
      const remaining = state.descanso.minutes - elapsedMinutes;
      if (remaining <= 0) endDescanso(); else scheduleDescanso(remaining, autoEndDescanso);
    },
  };
