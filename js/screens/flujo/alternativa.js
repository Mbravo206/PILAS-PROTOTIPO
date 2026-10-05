// js/screens/flujo/alternativa.js — pantalla alternativa (¿Y si pruebas otra cosa primero?). Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Alternativas + única pregunta de tiempo (llega preseleccionado, ver goAlternativa).
    alternativa() {
      const e = D.EMO[state.emotionIn];
      // Dos fichas cuadradas de tono suave: no compiten con los botones oscuros de otras decisiones.
      const opts = `<p class="text-label text-ink">Prueba una de estas</p>
        <div class="grid grid-cols-2 gap-sm">${alternativesFor().map((a, i) => `
          <button type="button" class="aspect-square rounded-card border-2 border-primary bg-white/60 text-ink text-label text-center p-md flex items-center justify-center transition duration-200 ease-out active:scale-[0.98] active:bg-white/80"
            data-action="pick-alt" data-value="${i}">${a}</button>`).join("")}</div>`;
      const times = D.times.map((t) => chip(t.label, { action: "pick-time", value: t.id, selected: state.timeId === t.id })).join("");
      return screen({
        title: "¿Y si pruebas otra cosa primero?",
        bg: e ? e.bg : "",
        body: `
          <div class="flex justify-center py-md">${avatar(state.emotionIn, 96)}</div>
          <h2 class="text-title-md text-ink mt-lg">¿Cuánto tiempo piensas usar la app?</h2>
          <div class="flex flex-wrap gap-sm mt-md">${times}</div>`,
        actions: opts + textButton("Igual quiero entrar", { action: "alt-enter" }),
      });
    },
});
