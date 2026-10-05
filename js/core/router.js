// js/core/router.js — router: go(), rerender(), screen(). Extraído tal cual de app.js (sin cambios de lógica).
  // ---------- Router ----------
  const $ = (sel) => document.querySelector(sel);
  // Texto escrito por la persona: se escapa antes de ir dentro de un atributo HTML.
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const screenEl = (name) => document.querySelector(`[data-screen="${name}"]`);

  function go(name, { soft = false } = {}) {
    state.screen = name;
    document.querySelectorAll(".screen").forEach((s) => { s.hidden = true; s.classList.remove("enter"); });
    const el = screenEl(name);
    el.innerHTML = renderers[name]();
    el.hidden = false;
    if (window.lucide) lucide.createIcons();
    if (soft) return; // re-render por selección: sin animación, sin mover el foco
    void el.offsetWidth; el.classList.add("enter");
    // Entrada escalonada (60 ms entre bloques, máx. 8): solo al llegar a una pantalla tras un toque.
    el.querySelectorAll(".screen-body > *").forEach((n, i) => {
      if (i > 7) return;
      n.style.animationDelay = `${i * 60}ms`;
      n.classList.add("up");
    });
    el.querySelector("h1")?.focus({ preventScroll: true });
    onEnter[name]?.();
  }
  const rerender = () => {
    const body = screenEl(state.screen).querySelector(".screen-body");
    const y = body ? body.scrollTop : 0;
    go(state.screen, { soft: true });
    const nb = screenEl(state.screen).querySelector(".screen-body");
    if (nb) nb.scrollTop = y;
  };

  // Esqueleto de pantalla: título + cuerpo con scroll + acciones abajo
  function screen({ title, subtitle = "", body = "", actions = "", bg = "" }) {
    return `
      <div class="flex flex-col h-full" style="${bg ? `background:${bg}` : ""}">
        <div class="screen-body px-lg pt-lg">
          ${title ? `<h1 tabindex="-1" class="text-title-lg text-ink outline-none">${title}</h1>` : ""}
          ${subtitle ? `<p class="text-body text-ink-soft mt-sm">${subtitle}</p>` : ""}
          <div class="mt-lg">${body}</div>
        </div>
        <div class="px-lg pt-md pb-xl flex flex-col gap-sm">${actions}</div>
      </div>`;
  }
const renderers = {};
