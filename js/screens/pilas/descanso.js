// js/screens/pilas/descanso.js — pantallas descanso, descanso-activo y descanso-fin. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Descanso — un rato sin redes que Sami elige, sin castigo si sale antes
    descanso() {
      const chips = D.breakTimes.map((t) => chip(t.label, { action: "descanso-pick-time", value: t.id, selected: state.descanso.timeId === t.id })).join("");
      // "Tus logros": estadísticas simuladas con barra y porcentaje. Solo describen, sin niveles.
      const stats = D.breakStats.map((st) => `
        <li class="py-sm">
          <div class="flex items-center justify-between">
            <span class="text-label text-ink">${st.label}</span><span class="text-label text-ink">${st.pct}%</span>
          </div>
          <div class="h-2 rounded-full bg-line mt-xs overflow-hidden" role="progressbar" aria-label="${st.label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.pct}">
            <div class="h-full rounded-full bg-primary" style="width:${st.pct}%"></div>
          </div>
        </li>`).join("");
      return `
        <div class="h-full flex flex-col">
          <div class="screen-body px-lg pt-lg">
            <h1 tabindex="-1" class="text-title-lg text-ink outline-none">Descanso</h1>
            <p class="text-body text-ink-soft mt-xs">Un rato sin redes. Si sales antes, no pasa nada.</p>

            <div class="bg-surface rounded-card border border-line shadow-pilas p-lg mt-lg">
              <p class="text-caption text-ink-soft">Sugerido para ti</p>
              <p class="text-title-md text-ink mt-xs">${D.breakSuggestion.minutes} min</p>
              <p class="text-label text-ink-soft mt-xs">${D.breakSuggestion.note}</p>
            </div>

            <h2 class="text-title-md text-ink mt-xl">Elige el tiempo</h2>
            <div class="flex flex-wrap gap-sm mt-sm">${chips}</div>
            <div class="mt-lg">${button("Empezar descanso", { action: "descanso-start", disabled: !state.descanso.timeId })}</div>

            <h2 class="text-title-md text-ink mt-xl">Tus logros</h2>
            <ul class="mt-sm bg-surface rounded-card border border-line px-md mb-lg">${stats}</ul>
          </div>
          ${bottomNav("descanso")}
        </div>`;
    },

    // Descanso activo — pausa a pantalla completa, sin bajar nada si sale antes
    "descanso-activo"() {
      return `
        <div class="h-full flex flex-col items-center px-lg text-center" style="background:${D.EMO.calma.bg}">
          <div class="flex-1 flex flex-col items-center justify-center">
            <div class="flex justify-center">${character("calma", 120)}</div>
            <h1 tabindex="-1" class="text-title-lg text-ink outline-none mt-xl">Descansando ${state.descanso.minutes} min</h1>
            <p class="text-body text-ink mt-sm">No pasa nada si sales antes.</p>
          </div>
          <div class="pb-xl flex flex-col gap-sm w-full">
            ${button("Ir al celular", { variant: "phone", icon: "smartphone", action: "descanso-go-home" })}
            ${button("Salir antes", { variant: "tonal", action: "descanso-end" })}
          </div>
        </div>`;
    },

    // Descanso fin — cierre simple, sin puntaje
    "descanso-fin"() {
      return `
        <div class="h-full flex flex-col items-center px-lg text-center">
          <div class="flex-1 flex flex-col items-center justify-center">
            <div class="flex justify-center">${character("calma", 120)}</div>
            <h1 tabindex="-1" class="text-title-lg text-ink outline-none mt-xl">Terminó tu descanso</h1>
            <p class="text-body text-ink mt-sm">Volviste cuando quisiste.</p>
          </div>
          <div class="pb-xl w-full">${button("Listo", { action: "descanso-close" })}</div>
        </div>`;
    },
});
