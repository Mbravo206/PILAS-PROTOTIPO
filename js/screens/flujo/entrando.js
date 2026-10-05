// js/screens/flujo/entrando.js — pantalla entrando. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Entrando (1 s, automática)
    entrando() {
      const t = D.times.find((x) => x.id === state.timeId);
      const app = D.APP[state.app]?.name || "la red";
      const line = `Entrando a ${app}${t && t.minutes ? ` · ${t.minutes} min` : ""}`;
      return `
        <div class="h-full flex flex-col items-center justify-center gap-lg px-lg text-center">
          ${character(state.emotionIn, 96)}
          <h1 tabindex="-1" class="text-title-md text-ink outline-none">${line}</h1>
        </div>`;
    },
});
