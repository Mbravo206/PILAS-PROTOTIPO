// js/screens/flujo/home.js — pantalla home (celular simulado). Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Celular simulado (mínimo): solo demuestra la intercepción al abrir una red.
    // En una app real esto sería un Accessibility Service (Android) o Screen Time (iOS):
    // HTML/CSS/JS no puede interceptar el lanzamiento de otra app de verdad.
    home() {
      const tile = (a) => a.isPilas
        ? pilasIcon(64)
        : a.logo
          ? `<img src="${a.logo}" alt="" class="w-16 h-16 rounded-[22.5%]">`
          : `<span class="w-16 h-16 rounded-[22.5%] inline-flex items-center justify-center" style="background:${a.color}">
            <i data-lucide="${a.icon}" class="w-7 h-7" style="color:#1F2240" stroke-width="1.5"></i>
          </span>`;
      const socialApps = D.apps.filter((a) => a.social && state.pausedApps[a.id]);
      const icons = [...socialApps, D.APP.pilas].map((a) => `
        <button type="button" class="flex flex-col items-center gap-xs transition duration-200 ease-out active:scale-[0.94]" data-action="${a.isPilas ? "open-pilas" : "open-app"}" data-value="${a.id}" aria-label="Abrir ${a.name}">
          ${tile(a)}<span class="text-caption text-white">${a.name}</span>
        </button>`).join("");
      return `
        <div class="h-full flex flex-col relative overflow-hidden" style="background:linear-gradient(160deg,#3B4488 0%,#4C57A9 50%,#6698CC 100%)">
          <div class="px-lg pt-lg relative">
            <div class="rounded-card p-md text-center" style="background:rgba(255,255,255,0.16)">
              <p class="text-label text-white/80" id="home-date"></p>
              <p class="text-[44px] leading-none font-bold text-white" id="home-clock"></p>
            </div>
          </div>
          <p class="text-label text-white/90 text-center mt-xl relative px-lg">Así se vería el momento en que abres una red — toca un ícono para probarlo</p>
          <div class="px-lg mt-lg grid grid-cols-3 gap-y-lg justify-items-center relative">${icons}</div>
        </div>`;
    },
});
