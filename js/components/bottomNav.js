// js/components/bottomNav.js — navegación inferior. Extraído tal cual de app.js (sin cambios de lógica).
  // Navegación inferior: Hoy, Grupo, Descanso y Yo
  function bottomNav(active) {
    const items = [
      ["Hoy", "home", "go-inicio", "inicio"],
      ["Grupo", "users", "go-grupo", "grupo"],
      ["Descanso", "leaf", "go-descanso", "descanso"],
      ["Yo", "user", "go-yo", "yo"],
    ];
    const tabs = items.map(([label, icon, action, id]) => {
      const current = id === active;
      // La pestaña actual se nota: píldora de primary con baja opacidad detrás del ícono, ícono más grueso y etiqueta en negrita.
      return `<button type="button" class="flex-1 h-14 flex flex-col items-center justify-center gap-xs text-caption transition duration-200 ease-out active:scale-[0.94] ${current ? "text-ink font-bold" : "text-ink-soft"}"
        data-action="${action}" ${current ? 'aria-current="page"' : ""}>
        <span class="inline-flex items-center justify-center w-14 h-7 rounded-full transition duration-200 ease-out ${current ? "bg-primary/20" : ""}">
          <i data-lucide="${icon}" class="w-6 h-6" stroke-width="${current ? 2 : 1.5}"></i></span>${label}</button>`;
    }).join("");
    return `<nav class="flex border-t border-line bg-surface pb-sm" aria-label="Navegación principal">${tabs}</nav>`;
  }
