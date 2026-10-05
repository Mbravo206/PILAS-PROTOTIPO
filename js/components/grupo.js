// js/components/grupo.js — tarjetas, filas y retos de Hoy y Grupo. Extraído tal cual de app.js (sin cambios de lógica).
  // Reto de hoy — Card featured (única con shadow-pilas de Inicio). Nunca bloquea ni cuenta atrás.
  function challengeCard() {
    const c = D.challenges[0];
    const joined = c.friends.map((id) => D.GROUP[id]);
    const names = joined.map((m) => m.name).join(" y ");
    return `
      <div class="bg-surface rounded-card border border-line shadow-pilas p-lg">
        <p class="text-caption text-ink-soft">Reto de hoy</p>
        <h2 class="text-title-md text-ink mt-xs">${c.title}</h2>
        <div class="flex items-center gap-sm mt-md">
          <span class="flex -space-x-2">${joined.map((m) => personAvatar(m, 28)).join("")}</span>
          ${names ? `<p class="text-label text-ink-soft">${names} ya le entraron</p>` : ""}
        </div>
        <div class="mt-lg">${challengeButton(c.id, "Estás en el reto", "Unirme al reto", "tonal")}</div>
      </div>`;
  }

  // Vista previa de "Tu grupo" en Inicio: primeros 4, enlaza a Grupo completo.
  function groupSection() {
    return `
      <div class="flex items-center justify-between">
        <h2 class="text-title-md text-ink">Tu grupo</h2>
        <button type="button" class="hit-44 relative text-label text-primary transition duration-200 ease-out active:text-primary-pressed" data-action="go-grupo">Los del colegio</button>
      </div>
      <ul class="mt-sm bg-surface rounded-card border border-line px-md">${groupRows(D.group.slice(0, 4))}</ul>`;
  }

  // Estado de cada persona frente a los retos: "cumplio" | "enCurso" | null. Sin puntos ni ranking.
  function retoStatus(m) {
    if (m.self) return Object.values(state.joinedChallenges).some(Boolean) ? "enCurso" : null;
    const mine = D.challenges.filter((c) => c.friends.includes(m.id));
    if (!mine.length) return null;
    return mine.some((c) => c.done.includes(m.id)) ? "cumplio" : "enCurso";
  }

  // Estado en texto con check sobre fondo plano (chip), nunca un botón relleno.
  function retoChip(status) {
    if (!status) return "";
    const done = status === "cumplio";
    return `<span class="inline-flex items-center gap-xs px-sm h-7 rounded-full bg-line/60 text-caption text-ink shrink-0">
      ${done ? `<i data-lucide="check" class="draw-check w-4 h-4" stroke-width="2" aria-hidden="true"></i>` : ""}${done ? "Cumplió" : "En curso"}</span>`;
  }

  // Filas de "Tu grupo": solo si cada quien está en el reto o lo cumplió, sin tiempos de los demás.
  // El tiempo propio es opcional y privado: solo aparece en la fila de Sami si comparte el ajuste.
  function groupRows(members) {
    return members.map((m) => `
      <li class="min-h-[56px] flex items-center gap-md py-sm border-b border-line last:border-0">
        ${personAvatar(m, 36)}
        <span class="flex-1">
          <span class="block text-label text-ink">${m.name}${m.self ? ` <span class="text-caption text-ink-soft">Tú</span>` : ""}</span>
          ${m.self && state.settings.shareTime ? `<span class="block text-caption text-ink-soft">Hoy ${m.timeLabel} · solo tú lo ves</span>` : ""}
        </span>
        ${retoChip(retoStatus(m))}
      </li>`).join("");
  }

  // Retos activos: cada uno con su propia adhesión
  function challengesSection() {
    // Siempre exactamente 2: los 2 del grupo, o el primero + el último que propuso Sami.
    const base = D.challenges.slice(0, 2);
    const custom = state.customChallenges[state.customChallenges.length - 1];
    const list = custom ? [base[0], custom] : base;
    const cards = list.map((c) => {
      const selfIn = !!state.joinedChallenges[c.id];
      const friends = (c.friends || []).map((id) => D.GROUP[id]);
      const names = [...friends.map((m) => m.name), ...(selfIn ? ["tú"] : [])];
      const label = names.length === 0 ? ""
        : names.length === 1 ? `${names[0]} ya le entró`
        : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]} ya le entraron`;
      return `
        <div class="bg-surface rounded-card border border-line p-lg">
          <p class="text-label text-ink font-medium">${c.title}</p>
          <div class="flex items-center gap-sm mt-sm">
            <span class="flex -space-x-2">${friends.map((m) => personAvatar(m, 24)).join("")}${selfIn ? personAvatar(D.GROUP.sami, 24) : ""}</span>
            ${label ? `<p class="text-caption text-ink-soft">${label}</p>` : ""}
          </div>
          <div class="mt-md">${challengeButton(c.id, "Estás en el reto", "Le entro", "secondary")}</div>
        </div>`;
    }).join("");
    return `<div class="flex flex-col gap-sm">${cards}</div>`;
  }

  // Reto: sin unirse, un botón; unido, solo un chip de estado con check (fondo plano, no es un botón)
  // y una salida discreta "Salir del reto". La salida es texto subrayado, no compite con nada.
  function challengeButton(id, onLabel, offLabel, offVariant) {
    const on = !!state.joinedChallenges[id];
    if (!on) return button(offLabel, { variant: offVariant, pressed: false, action: "toggle-challenge", value: id });
    return `
      <div class="flex items-center justify-between gap-sm">
        <span class="inline-flex items-center gap-xs px-md h-9 rounded-full bg-line/60 text-label text-ink">
          <i data-lucide="check" class="draw-check w-4 h-4" stroke-width="2" aria-hidden="true"></i>${onLabel}</span>
        <button type="button" class="hit-44 relative text-caption text-ink underline underline-offset-2 transition duration-200 ease-out active:opacity-70"
          data-action="toggle-challenge" data-value="${id}">Salir del reto</button>
      </div>`;
  }

  // "Los premiados de hoy" (Grupo): 2 personas reconocidas, sin puntos, sin ranking, sin orden.
  function rewardedSection() {
    const rows = D.rewarded.map((r) => {
      const m = D.GROUP[r.id];
      return `
        <li class="min-h-[64px] flex items-center gap-md py-sm border-b border-line last:border-0">
          ${personAvatar(m, 40)}
          <span class="flex-1">
            <span class="block text-label text-ink">${m.name}</span>
            <span class="block text-caption text-ink-soft">${r.note}</span>
          </span>
          <i data-lucide="sparkles" class="w-5 h-5 text-primary shrink-0" stroke-width="1.5" aria-hidden="true"></i>
        </li>`;
    }).join("");
    return `<ul class="bg-surface rounded-card border border-line px-md">${rows}</ul>
      <p class="text-caption text-ink-soft mt-sm">Sin puntos ni ranking: es solo para celebrarlos.</p>`;
  }
