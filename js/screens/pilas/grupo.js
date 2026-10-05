// js/screens/pilas/grupo.js — pantalla grupo. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Grupo: quién está en el reto, premiados y retos activos; sin ranking ni tiempos ajenos
    grupo() {
      return `
        <div class="h-full flex flex-col">
          <div class="screen-body px-lg pt-lg">
            <h1 tabindex="-1" class="text-title-lg text-ink outline-none">Tu grupo</h1>
            <p class="text-body text-ink-soft mt-xs">Los del colegio</p>
            <ul class="mt-lg bg-surface rounded-card border border-line px-md">${groupRows(D.group)}</ul>
            <p class="text-caption text-ink-soft mt-sm">Aquí solo ves quién está en el reto. Tu tiempo lo ves solo tú.</p>

            <h2 class="text-title-md text-ink mt-xl">Los premiados de hoy</h2>
            <div class="mt-sm">${rewardedSection()}</div>

            <h2 class="text-title-md text-ink mt-xl">Retos activos</h2>
            <div class="mt-sm">${challengesSection()}</div>
            <div class="mt-md">${button("Proponer un reto", { action: "open-propose-challenge" })}</div>
            <div class="mb-lg"></div>
          </div>
          ${bottomNav("grupo")}
        </div>`;
    },
});
