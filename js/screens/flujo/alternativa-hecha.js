// js/screens/flujo/alternativa-hecha.js — pantalla alternativa-hecha. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Confirmación de la alternativa elegida
    "alternativa-hecha"() {
      return `
        <div class="h-full flex flex-col items-center px-lg text-center">
          <div class="flex-1 flex flex-col items-center justify-center">
            <div class="flex justify-center">${character(state.emotionIn, 120)}</div>
            <h1 tabindex="-1" class="text-title-lg text-ink outline-none mt-xl">${alternativesFor()[state.alt] || "Buena elección"}</h1>
            <p class="text-body text-ink-soft mt-sm">Cuando quieras, vuelves a tu celular.</p>
          </div>
          <div class="pb-xl w-full">${button("Volver al celular", { variant: "phone", icon: "smartphone", action: "open-home-demo" })}</div>
        </div>`;
    },
});
