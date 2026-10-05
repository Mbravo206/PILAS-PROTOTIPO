// js/screens/flujo/pasaste.js — pantalla pasaste. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Te pasaste: honesto, sin castigo
    pasaste() {
      return `
        <div class="h-full flex flex-col px-lg">
          <div class="flex-1 flex flex-col items-center justify-center text-center">
            <h1 tabindex="-1" class="text-title-lg text-ink outline-none">Llevas ${realMinutes()} min. Dijiste ${state.minutes}.</h1>
            <div class="rounded-card bg-state-fuera/30 p-lg flex items-center gap-md mt-lg text-left w-full">
              ${character(state.emotionIn, 56)}
              <p class="text-body text-ink">Puedes salir o seguir. Tú decides.</p></div>
          </div>
          <div class="pb-xl flex flex-col gap-sm">
            ${button("Salir", { action: "over-exit" })}
            ${button("Seguir", { variant: "secondary", action: "over-continue" })}
          </div>
        </div>`;
    },
});
