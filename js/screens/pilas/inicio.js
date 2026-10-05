// js/screens/pilas/inicio.js — pantalla inicio (Hoy). Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Hoy: reto, grupo, acceso a Descanso y notas a amigos; sin totales ni rachas
    inicio() {
      const h = new Date().getHours();
      const greet = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";

      const confirmation = state.noteConfirmation;
      state.noteConfirmation = null; // se muestra una sola vez, justo después de enviar

      return `
        <div class="h-full flex flex-col">
          <div class="screen-body px-lg pt-lg">
            <div class="flex items-center justify-between">
              <h1 tabindex="-1" class="text-title-lg text-ink outline-none">${greet}, Sami</h1>
              ${personAvatar(D.GROUP.sami, 40)}
            </div>
            <!-- Card featured: la única con shadow-pilas de esta pantalla -->
            <div class="mt-lg">${challengeCard()}</div>
            <div class="mt-xl">${groupSection()}</div>
            <div class="bg-surface rounded-card border border-line p-lg mt-xl">
              <h2 class="text-title-md text-ink">Crea un foco</h2>
              <p class="text-body text-ink-soft mt-sm">¿Aburrido/a o estresado/a? Prueba esto en 2 min.</p>
              <div class="mt-md">${button("Crear un foco", { variant: "secondary", action: "descanso-quick" })}</div>
            </div>

            <div class="bg-surface rounded-card border border-line p-lg mt-xl">
              <h2 class="text-title-md text-ink">Déjale algo a un amigo</h2>
              <p class="text-body text-ink-soft mt-sm">Le aparece antes de abrir una red. No ve nada de tu uso.</p>
              ${confirmation ? `<p class="text-label text-primary mt-sm">Le escribiste a ${confirmation}.</p>` : ""}
              <div class="mt-md">${button("Escribir mensaje", { variant: "secondary", action: "open-note-composer" })}</div>
            </div>

            <div class="flex flex-col gap-sm mt-xl mb-lg">
              ${button("Volver al inicio", { variant: "phone", icon: "smartphone", action: "open-home-demo" })}
              ${button("Reiniciar prototipo", { variant: "tonal", action: "reset-all" })}
            </div>
          </div>
          ${bottomNav("inicio")}
        </div>`;
    },
});
