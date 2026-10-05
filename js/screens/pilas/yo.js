// js/screens/pilas/yo.js — pantalla yo. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Yo: perfil que describe, no califica
    yo() {
      const goalsList = [...D.goals, ...state.customGoals].filter((g) => !state.dismissedGoalIds.includes(g.id));
      const pct = Math.round((D.focus.current / D.focus.target) * 100);

      const goalRows = goalsList.map((g) => {
        const p = Math.min(100, Math.round((g.current / g.target) * 100));
        return `
          <div class="bg-surface rounded-card border border-line p-md">
            <div class="flex items-start justify-between gap-sm">
              <p class="text-label text-ink">${g.title}</p>
              <button type="button" class="w-11 h-11 -m-2 -mt-2 shrink-0 rounded-full inline-flex items-center justify-center transition duration-200 ease-out active:scale-[0.9] active:bg-line/60" data-action="dismiss-goal" data-value="${g.id}" aria-label="Quitar meta: ${g.title}">
                <i data-lucide="x" class="w-5 h-5 text-ink-soft" stroke-width="1.5"></i></button>
            </div>
            <div class="h-2 rounded-full bg-line mt-sm overflow-hidden"><div class="h-full rounded-full bg-primary" style="width:${p}%"></div></div>
            <p class="text-caption text-ink-soft mt-xs">${g.current} de ${g.target} ${g.unit}</p>
          </div>`;
      }).join("");

      const socialApps = D.apps.filter((a) => a.social);
      const appToggles = socialApps.map((a) => `
        <div class="min-h-[56px] flex items-center gap-md py-sm border-b border-line last:border-0">
          ${a.logo
            ? `<img src="${a.logo}" alt="" class="w-9 h-9 rounded-input">`
            : `<span class="w-9 h-9 rounded-input inline-flex items-center justify-center" style="background:${a.color}">
            <i data-lucide="${a.icon}" class="w-5 h-5" style="color:#1F2240" stroke-width="1.5"></i></span>`}
          <span class="flex-1 text-label text-ink">${a.name}</span>
          ${toggle(!!state.pausedApps[a.id], { action: "toggle-app-pause", value: a.id, ariaLabel: `Pausa antes de abrir ${a.name}` })}
        </div>`).join("");

      const achievementCards = D.achievements.map((a) => `
        <div class="bg-surface rounded-card border border-line p-md">
          <i data-lucide="${a.icon}" class="w-5 h-5 text-ink-soft" stroke-width="1.5"></i>
          <p class="text-label text-ink mt-sm">${a.text}</p>
        </div>`).join("");

      return `
        <div class="h-full flex flex-col">
          <div class="screen-body px-lg pt-lg">
            <div class="flex items-center gap-md">
              ${personAvatar(D.GROUP.sami, 56)}
              <div><h1 tabindex="-1" class="text-title-lg text-ink outline-none">Sami</h1>
                <p class="text-label text-ink-soft">Usas PILAS desde ${D.focus.since}</p></div>
            </div>

            <!-- Card featured: la única con shadow-pilas de esta pantalla -->
            <div class="bg-surface rounded-card border border-line shadow-pilas p-lg mt-lg flex items-center gap-lg">
              ${focusRing(pct)}
              <div>
                <p class="text-caption text-ink-soft">Tus horas de foco</p>
                <p class="text-title-md text-ink mt-xs">${D.focus.current} h de ${D.focus.target} h este mes</p>
                <p class="text-label text-ink-soft mt-xs">${D.focus.emoNote}</p>
              </div>
            </div>

            <h2 class="text-title-md text-ink mt-xl">Tus metas de septiembre</h2>
            <p class="text-body text-ink-soft mt-xs">Si no llegas, no pasa nada. El mes que viene empieza de nuevo.</p>
            <div class="flex flex-col gap-sm mt-md">${goalRows}</div>
            <div class="mt-md">${button("Agregar meta", { variant: "secondary", action: "open-add-goal" })}</div>

            <h2 class="text-title-md text-ink mt-xl">Redes con pausa</h2>
            <p class="text-body text-ink-soft mt-xs">PILAS no bloquea. Te hace una pausa y tú decides.</p>
            <div class="bg-surface rounded-card border border-line px-md mt-md">${appToggles}</div>

            <h2 class="text-title-md text-ink mt-xl">Lo que lograste este mes</h2>
            <p class="text-body text-ink-soft mt-xs">Solo tú lo ves.</p>
            <div class="grid grid-cols-2 gap-sm mt-md">${achievementCards}</div>

            <h2 class="text-title-md text-ink mt-xl">Ajustes</h2>
            <div class="bg-surface rounded-card border border-line px-md mt-md">
              <div class="min-h-[56px] flex items-center gap-md py-sm border-b border-line">
                <span class="flex-1 text-label text-ink">Pausa antes de abrir redes</span>
                ${toggle(state.settings.pauseBeforeOpen, { action: "toggle-setting", value: "pauseBeforeOpen", ariaLabel: "Pausa antes de abrir redes" })}
              </div>
              <div class="min-h-[56px] flex items-center gap-md py-sm border-b border-line">
                <span class="flex-1 text-label text-ink">Compartir mi tiempo con el grupo</span>
                ${toggle(state.settings.shareTime, { action: "toggle-setting", value: "shareTime", ariaLabel: "Compartir mi tiempo con el grupo" })}
              </div>
              <button type="button" class="min-h-[56px] w-full flex items-center gap-md py-sm text-left transition duration-200 ease-out active:bg-line/40" aria-label="Cambiar personaje (próximamente)">
                <span class="flex-1 text-label text-ink">Cambiar personaje</span>
                <i data-lucide="chevron-right" class="w-5 h-5 text-ink-soft" stroke-width="1.5"></i>
              </button>
            </div>
            <p class="text-caption text-ink-soft mt-sm mb-xl">Solo el tiempo. Tus emociones son solo tuyas.</p>
          </div>
          ${bottomNav("yo")}
        </div>`;
    },
});
