// js/app.js — estado, router de pantallas, hojas inferiores y acciones del flujo.
// Flujo: celular simulado (home) → aviso o nota → check-in → alternativas y tiempo → feed → salida → cierre → home.
(function () {
  const D = window.PILAS_DATA;
  const { button, textButton, iconButton, character, chip, emotionCard, emotionDot, avatar, personAvatar, flower, toggle, pilasIcon } = window.UI;

  // ---------- Modo demo: 1 min elegido = 5 s reales ----------
  let demo = new URLSearchParams(location.search).get("demo") === "1";
  const minuteMs = () => (demo ? 5000 : 60000);

  // Perfil/grupo: no se borra al volver a Hoy, solo con "Reiniciar prototipo"
  function initialProfile() {
    return {
      joinedChallenges: Object.fromEntries(D.challenges.map((c) => [c.id, c.selfDefault])),
      customChallenges: [],
      noteQueue: [...D.friendNotes],
      noteDraft: { friendId: null, suggestion: null, custom: "" },
      noteConfirmation: null,
      customGoals: [],
      dismissedGoalIds: [],
      pausedApps: Object.fromEntries(D.apps.filter((a) => a.social).map((a) => [a.id, true])),
      settings: { pauseBeforeOpen: true, shareTime: true },
      descanso: { active: false, startedAt: null, minutes: null, timeId: null },
      descansoHistory: D.sampleBreaks(),
    };
  }

  // ---------- Estado de la sesión actual ----------
  const state = {
    screen: "home",
    app: null,        // red elegida al abrir el celular simulado
    emotionIn: null,  // "¿Cómo te sientes?" (hoja de check-in)
    minutes: null,    // null = sin tiempo ("Indefinido" o "Ahora no")
    timeId: null,     // chip de tiempo elegido
    startedAt: null,  // timestamp al entrar al feed
    emotionOut: null, // emoción al salir
    exceeded: false,
    alt: null,        // alternativa elegida
    saved: false,     // evita guardar dos veces la misma sesión
    currentNote: null, // nota de amigo que se está mostrando
    replyChoice: null, // respuesta rápida elegida al responder al amigo
    replyChar: null,   // muñequito elegido al responder al amigo
    replySent: false,  // ya le respondió a la nota actual (la nota se muestra con confirmación)
    ...initialProfile(),
  };

  function resetSession() {
    Object.assign(state, {
      app: null, emotionIn: null, minutes: null, timeId: null,
      startedAt: null, emotionOut: null, exceeded: false, alt: null, saved: false,
    });
    clearTimer();
  }

  // ---------- Timers (sin contador visible) ----------
  let timer = null;
  const clearTimer = () => { clearTimeout(timer); timer = null; };
  const schedule = (minutes, fn) => { clearTimer(); timer = setTimeout(fn, minutes * minuteMs()); };
  const realMinutes = () =>
    state.startedAt ? Math.max(1, Math.round((Date.now() - state.startedAt) / minuteMs())) : 0;

  // ---------- Persistencia: localStorage "pilas.entries" ----------
  const KEY = "pilas.entries";
  let memoryFallback = null; // si localStorage falla (modo privado, file:// en algunos navegadores)

  function loadEntries() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === null) { const seed = D.sampleEntries(); saveEntries(seed); return seed; }
      return JSON.parse(raw) || [];
    } catch (_) {
      return memoryFallback || (memoryFallback = D.sampleEntries());
    }
  }
  function saveEntries(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) { memoryFallback = list; }
  }
  function saveCurrentEntry() {
    if (state.saved) return;
    const real = realMinutes();
    state.exceeded = state.minutes != null && real > state.minutes;
    const entry = {
      id: Date.now().toString(36),
      app: state.app, emotionIn: state.emotionIn,
      minutes: state.minutes, realMinutes: real, emotionOut: state.emotionOut,
      exceeded: state.exceeded, date: new Date().toISOString(),
    };
    saveEntries([...loadEntries(), entry]);
    state.saved = true;
  }
  // Última entrada guardada: preselecciona el tiempo de las alternativas
  function mostRecentEntry() {
    const entries = loadEntries();
    return entries.length ? entries.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
  }
  const timeIdForMinutes = (m) => (m == null ? null : (D.times.find((t) => t.minutes === m) || {}).id ?? null);

  function resetAll() {
    try { localStorage.removeItem(KEY); } catch (_) {}
    memoryFallback = null;
    resetSession();
    Object.assign(state, initialProfile());
    go("home");
  }

  // ---------- Router ----------
  const $ = (sel) => document.querySelector(sel);
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

  const sentReplyText = () => [D.friendReplies[state.replyChoice], D.replyDolls.find((d) => d.id === state.replyChar)?.label].filter(Boolean).join(" · ");

  // ---------- Pantallas ----------
  const renderers = {
    // Celular simulado (mínimo): solo demuestra la intercepción al abrir una red.
    // En una app real esto sería un Accessibility Service (Android) o Screen Time (iOS):
    // HTML/CSS/JS no puede interceptar el lanzamiento de otra app de verdad.
    home() {
      const tile = (a) => a.isPilas
        ? pilasIcon(64)
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

    // Nota de un amigo antes de entrar: no bloquea y no ve tu uso
    nota() {
      const n = state.currentNote;
      const friend = D.GROUP[n.from];
      const e = D.EMO.alegria;
      return `
        <div class="h-full flex flex-col px-lg text-center" style="background:${e.bg}">
         <div class="flex-1 flex flex-col items-center justify-center">
          <div class="flex justify-center">${character("alegria", 120)}</div>
          <div class="flex items-center justify-center gap-sm mt-xl">
            ${personAvatar(friend, 32)}
            <p class="text-label text-ink">${friend.name} te dejó algo antes de entrar</p>
          </div>
          <h1 tabindex="-1" class="text-title-lg text-ink outline-none mt-md">${n.message}</h1>
          ${n.drawing ? `<div class="bg-surface rounded-card border border-line p-md mt-lg mx-auto"><p class="text-caption text-ink-soft">Te mandó un dibujo</p></div>` : ""}
          ${n.gift === "flor" ? `<div class="bg-surface rounded-card border border-line p-md mt-lg mx-auto flex flex-col items-center gap-xs">${flower(96)}<p class="text-caption text-ink-soft">${friend.name} te mandó una flor</p></div>` : ""}
          ${state.replySent ? `<p class="text-label text-ink mt-lg">Le respondiste a ${friend.name}: ${sentReplyText()}.</p>` : ""}
          <p class="text-label text-ink-soft mt-lg">${friend.name} no ve si entras, cuánto tiempo ni cómo te sientes.</p>
         </div>
          <div class="pb-xl flex flex-col gap-sm">
            ${state.replySent
              ? button(`Entrar a ${D.APP[state.app]?.name || "la red"}`, { action: "note-enter" })
              : button("Responderle", { action: "note-reply" }) + textButton("Entrar igual", { action: "note-enter" })}
          </div>
        </div>`;
    },

    // Responder al amigo: una respuesta rápida, sin abrir una bandeja de mensajes.
    responder() {
      const n = state.currentNote;
      const friend = D.GROUP[n.from];
      const chips = D.friendReplies.map((r, i) => chip(r, { action: "pick-reply", value: i, selected: state.replyChoice === i })).join("");
      // Muñequitos: respuesta sin palabras. Elegido = anillo primary.
      const dolls = D.replyDolls.map((e) => {
        const on = state.replyChar === e.id;
        return `<button type="button" class="hit-44 relative flex flex-col items-center gap-xs p-xs rounded-card border-2 transition duration-200 ease-out active:scale-[0.98] ${on ? "border-primary bg-line/60" : "border-transparent"}"
          aria-pressed="${on}" aria-label="Responder: ${e.label}" data-action="pick-reply-char" data-value="${e.id}">
          ${character(e.face, 52)}<span class="text-caption text-ink text-center">${e.label}</span></button>`;
      }).join("");
      return screen({
        title: `Respóndele a ${friend.name}`,
        body: `
          <div class="flex items-center gap-md bg-surface rounded-card border border-line p-md">
            ${personAvatar(friend, 40)}
            <p class="text-body text-ink">${n.message}</p>
          </div>
          <h2 class="text-title-md text-ink mt-xl">Dile algo corto</h2>
          <div class="flex flex-wrap gap-sm mt-sm">${chips}</div>
          <h2 class="text-title-md text-ink mt-xl">O mándale un muñequito</h2>
          <div class="grid grid-cols-4 gap-xs mt-sm">${dolls}</div>
          <p class="text-caption text-ink-soft mt-lg">${friend.name} lo ve antes de abrir una red. No ve nada de tu uso.</p>`,
        actions:
          button("Enviar", { action: "reply-send", disabled: state.replyChoice === null && !state.replyChar }) +
          button("Volver", { variant: "secondary", action: "reply-back" }),
      });
    },

    // Alternativas + única pregunta de tiempo (llega preseleccionado, ver goAlternativa).
    alternativa() {
      const e = D.EMO[state.emotionIn];
      // Dos fichas cuadradas de tono suave: no compiten con los botones oscuros de otras decisiones.
      const opts = `<p class="text-label text-ink">Prueba una de estas</p>
        <div class="grid grid-cols-2 gap-sm">${alternativesFor().map((a, i) => `
          <button type="button" class="aspect-square rounded-card border-2 border-primary bg-white/60 text-ink text-label text-center p-md flex items-center justify-center transition duration-200 ease-out active:scale-[0.98] active:bg-white/80"
            data-action="pick-alt" data-value="${i}">${a}</button>`).join("")}</div>`;
      const times = D.times.map((t) => chip(t.label, { action: "pick-time", value: t.id, selected: state.timeId === t.id })).join("");
      return screen({
        title: "¿Y si pruebas otra cosa primero?",
        bg: e ? e.bg : "",
        body: `
          <div class="flex justify-center py-md">${avatar(state.emotionIn, 96)}</div>
          <h2 class="text-title-md text-ink mt-lg">¿Cuánto tiempo piensas usar la app?</h2>
          <div class="flex flex-wrap gap-sm mt-md">${times}</div>`,
        actions: opts + textButton("Igual quiero entrar", { action: "alt-enter" }),
      });
    },

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

    // Entrando (1 s, automática)
    entrando() {
      const t = D.times.find((x) => x.id === state.timeId);
      const app = D.APP[state.app]?.name || "la red";
      const line = `Entrando a ${app}${t && t.minutes ? ` · ${t.minutes} min` : ""}`;
      return `
        <div class="h-full flex flex-col items-center justify-center gap-lg px-lg text-center">
          ${character(state.emotionIn, 96)}
          <h1 tabindex="-1" class="text-title-md text-ink outline-none">${line}</h1>
        </div>`;
    },

    // Feed simulado (placeholders)
    feed() {
      const app = D.APP[state.app]?.name || "Red";
      const posts = Array.from({ length: 8 }, (_, n) => `
        <article class="bg-surface rounded-card border border-line p-md">
          <div class="flex items-center gap-sm"><span class="w-9 h-9 rounded-full bg-line"></span><span class="h-3 w-28 rounded-full bg-line"></span></div>
          <div class="mt-md rounded-input bg-line" style="height:${n % 2 ? 180 : 260}px"></div>
          <div class="mt-md h-3 w-3/4 rounded-full bg-line"></div>
        </article>`).join("");
      return `
        <div class="h-full flex flex-col bg-background">
          <div class="px-md py-sm flex items-center justify-between border-b border-line">
            <span class="text-title-md text-ink">${app}</span>
            ${iconButton("x", `Salir de ${app}`, "feed-exit")}
          </div>
          <div class="screen-body px-md py-md flex flex-col gap-md">${posts}</div>
        </div>`;
    },

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

    // Cierre: 3 s y vuelve sola al celular (ver onEnter.cierre).
    // El mensaje y el color cambian con la emoción de salida; si llevas rato en redes habla PILAS.
    cierre() {
      const out = state.emotionOut;
      const msgs = {
        calma:        { msg: "Cuando te pones las pilas, tienes el control.", sub: "Sigue así, con calma." },
        alegria:      { msg: "Cuando te pones las pilas, tienes el control.", sub: "Qué bueno que salgas con alegría." },
        ansiedad:     { msg: "Tranqui, tú tienes el control.", sub: "Busca algo que te anime." },
        aburrimiento: { msg: "Tranqui, tú tienes el control.", sub: "Busca algo que te anime." },
      };
      const { msg, sub } = msgs[out] || { msg: "Es tu decisión, sigue así.", sub: "Elegir con calma también es avanzar." };
      const long = state.exceeded || realMinutes() >= 20; // "ya llevas bastante en redes"
      const body = long
        ? `<div class="bg-surface rounded-card border border-line p-md flex items-center gap-md text-left w-full">
             <span class="inline-block shrink-0 w-14 h-14">${pilasIcon(56)}</span>
             <p class="text-body text-ink">PILAS: llevas un buen rato en redes. Un descanso te puede caer bien.</p></div>`
        : `<div class="flex justify-center">${avatar(out || state.emotionIn, 140)}</div>`;
      return `
        <div class="h-full flex flex-col items-center justify-center text-center px-lg gap-md" style="background:${(D.EMO[out] || D.EMO.alegria).bg}">
          ${body}
          <h1 tabindex="-1" class="text-title-lg text-ink outline-none mt-md">${msg}</h1>
          <p class="text-body text-ink">${sub}</p>
        </div>`;
    },

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

    // Grupo: quién está en el reto, premiados y retos activos; sin ranking ni tiempos ajenos
    grupo() {
      return `
        <div class="h-full flex flex-col">
          <div class="screen-body px-lg pt-lg">
            <h1 tabindex="-1" class="text-title-lg text-ink outline-none">Tu grupo</h1>
            <p class="text-body text-ink-soft mt-xs">Los del colegio</p>
            <ul class="mt-lg flex flex-col gap-sm">${groupRows(D.group)}</ul>
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

    // Dejarle algo a un amigo: a quién y qué mensaje
    dejarmensaje() {
      const friends = D.group.filter((m) => !m.self);
      const friendChips = friends.map((m) => chip(m.name, { action: "note-pick-friend", value: m.id, selected: state.noteDraft.friendId === m.id })).join("");
      const sugChips = D.noteSuggestions.map((s, i) => chip(s, { action: "note-pick-suggestion", value: i, selected: state.noteDraft.suggestion === i })).join("");
      const canSend = !!state.noteDraft.friendId && !!(state.noteDraft.custom.trim() || state.noteDraft.suggestion != null);
      return screen({
        title: "Déjale algo a un amigo",
        subtitle: "Le aparece antes de abrir una red. No ve nada de tu uso.",
        body: `
          <h2 class="text-title-md text-ink">¿A quién?</h2>
          <div class="flex flex-wrap gap-sm mt-sm">${friendChips}</div>
          <h2 class="text-title-md text-ink mt-xl">Elige un mensaje</h2>
          <div class="flex flex-wrap gap-sm mt-sm">${sugChips}</div>
          <h2 class="text-title-md text-ink mt-xl">O escribe el tuyo</h2>
          <input type="text" class="w-full h-[52px] px-md rounded-input border-2 border-line bg-surface text-body text-ink mt-sm"
            placeholder="Escribe algo corto" value="${state.noteDraft.custom}" data-action="note-type" aria-label="Escribe tu propio mensaje" />`,
        actions:
          button("Enviar mensaje", { action: "note-send", disabled: !canSend }) +
          button("Volver", { variant: "secondary", action: "note-back" }),
      });
    },

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
          <span class="w-9 h-9 rounded-input inline-flex items-center justify-center" style="background:${a.color}">
            <i data-lucide="${a.icon}" class="w-5 h-5" style="color:#1F2240" stroke-width="1.5"></i></span>
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
  };

  // Anillo de progreso de "Tus horas de foco" (Yo). Decorativo, sin niveles ni comparación.
  function focusRing(pct, size = 72) {
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - Math.min(100, pct) / 100);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="shrink-0" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#E4E0EF" stroke-width="8"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#4C57A9" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="18" font-weight="700" fill="#1F2240">${pct}%</text>
    </svg>`;
  }

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
        <button type="button" class="hit-44 relative inline-flex items-center gap-xs text-label text-ink transition duration-200 ease-out active:opacity-70" data-action="go-grupo">Ver grupo<i data-lucide="chevron-right" class="w-4 h-4" stroke-width="2" aria-hidden="true"></i></button>
      </div>
      <ul class="mt-sm flex flex-col gap-sm">${groupRows(D.group.slice(0, 4))}</ul>`;
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
      ${done ? `<i data-lucide="check" class="w-4 h-4" stroke-width="2" aria-hidden="true"></i>` : ""}${done ? "Cumplió" : "En curso"}</span>`;
  }

  // Filas de "Tu grupo": estilo ranking pero sin ranking (sin números, sin orden, sin puntos).
  // La carita al frente solo describe el estado del reto; los tiempos ajenos nunca se muestran.
  // El tiempo propio es opcional y privado: solo aparece en la fila de Sami si comparte el ajuste.
  function groupRows(members) {
    return members.map((m) => {
      const status = retoStatus(m);
      const face = status === "cumplio" ? "laugh" : "smile";
      return `
      <li class="min-h-[64px] flex items-center gap-md px-md py-sm rounded-input ${m.self ? "bg-primary/20" : "bg-surface border border-line"}">
        <i data-lucide="${face}" class="w-6 h-6 shrink-0 ${status ? "text-ink" : "text-ink-soft"}" stroke-width="1.5" aria-hidden="true"></i>
        ${personAvatar(m, 36)}
        <span class="flex-1">
          <span class="block text-label text-ink">${m.name}${m.self ? ` <span class="text-caption text-ink-soft">Tú</span>` : ""}</span>
          ${m.self && state.settings.shareTime ? `<span class="block text-caption text-ink-soft">Hoy ${m.timeLabel} · solo tú lo ves</span>` : ""}
        </span>
        ${retoChip(status)}
      </li>`;
    }).join("");
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
          <i data-lucide="check" class="w-4 h-4" stroke-width="2" aria-hidden="true"></i>${onLabel}</span>
        <button type="button" class="hit-44 relative text-caption text-ink underline underline-offset-2 transition duration-200 ease-out active:opacity-70"
          data-action="toggle-challenge" data-value="${id}">Salir del reto</button>
      </div>`;
  }

  // "Los premiados de hoy" (Grupo): 2 personas reconocidas, sin puntos, sin ranking, sin orden.
  function rewardedSection() {
    const rows = D.rewarded.map((r) => {
      const m = D.GROUP[r.id];
      return `
        <li class="min-h-[64px] flex items-center gap-md p-sm bg-surface rounded-input border border-line">
          ${personAvatar(m, 40)}
          <span class="flex-1">
            <span class="block text-label text-ink">${m.name}</span>
            <span class="block text-caption text-ink-soft">${r.note}</span>
          </span>
          <i data-lucide="party-popper" class="w-6 h-6 text-ink-soft shrink-0" stroke-width="1.5" aria-hidden="true"></i>
        </li>`;
    }).join("");
    return `<ul class="bg-primary/20 rounded-card p-sm flex flex-col gap-sm">${rows}</ul>
      <p class="text-caption text-ink-soft mt-sm">Sin puntos ni ranking: es solo para celebrarlos.</p>`;
  }

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

  // Efectos al entrar a cada pantalla
  const onEnter = {
    home() {
      const c = $("#home-clock"); if (c) c.textContent = clockText();
      const d = $("#home-date");
      if (d) d.textContent = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })
        .replace(/^\w/, (m) => m.toUpperCase());
    },
    entrando() { clearTimer(); timer = setTimeout(() => go("feed"), 1000); },
    feed() {
      if (!state.startedAt) {
        state.startedAt = Date.now();
        if (state.minutes) schedule(state.minutes, openSheet); // aviso al cumplirse el tiempo
      }
    },
    cierre() { clearTimer(); timer = setTimeout(() => go("home"), 3000); },
    "descanso-activo"() {
      // Recalcula lo que falta: volver a esta pantalla (p. ej. desde el nav) no debe alargar el descanso.
      const elapsedMinutes = (Date.now() - state.descanso.startedAt) / minuteMs();
      const remaining = state.descanso.minutes - elapsedMinutes;
      if (remaining <= 0) endDescanso(); else schedule(remaining, endDescanso);
    },
  };

  // ---------- Hoja inferior genérica: abrir/cerrar #sheet-layer ----------
  // Los "open*" de abajo solo rellenan el contenido; showSheet() se encarga de
  // mostrar la capa y cancela cualquier cierre pendiente (evita que un cierre
  // en curso oculte una hoja que se acaba de reemplazar, p. ej. sheet-exit).
  let sheetHideTimeout = null;
  function showSheet() {
    const layer = $("#sheet-layer");
    clearTimeout(sheetHideTimeout);
    layer.hidden = false;
    requestAnimationFrame(() => layer.classList.add("sheet-open"));
    layer.querySelector("button")?.focus();
    return layer;
  }
  function closeSheet() {
    const layer = $("#sheet-layer");
    layer.classList.remove("sheet-open");
    clearTimeout(sheetHideTimeout);
    sheetHideTimeout = setTimeout(() => (layer.hidden = true), 200);
  }

  // ---------- Aviso de tiempo cumplido (hoja inferior) ----------
  function openSheet() {
    const layer = $("#sheet-layer");
    layer.querySelector(".sheet-backdrop").dataset.action = "sheet-more";
    layer.querySelector(".sheet").innerHTML = `
      <div class="w-10 h-1 rounded-full bg-line mx-auto mb-lg" aria-hidden="true"></div>
      <div class="flex items-center gap-md">${character(state.emotionIn, 48)}
        <h2 id="sheet-title" class="text-title-md text-ink">Ya van tus ${state.minutes} min. ¿Cómo vas?</h2></div>
      <div class="flex flex-col gap-sm mt-lg">
        ${button("Salir", { action: "sheet-exit" })}
        ${button("5 min más", { variant: "secondary", action: "sheet-more" })}
      </div>`;
    showSheet();
  }

  // ---------- Aviso antes de abrir una red durante un descanso o un reto ----------
  // "Seguir..." es el botón oscuro; "Entrar igual" es texto plano, pero siempre visible: nunca bloquea la entrada.
  function openInterstitial(kind, challenge) {
    const layer = $("#sheet-layer");
    const keepAction = kind === "descanso" ? "interstitial-keep-descanso" : "interstitial-keep-reto";
    const title = kind === "descanso"
      ? "Estás en un descanso. ¿Sigues así?"
      : `Estás en el reto "${challenge.title}". ¿Sigues así?`;
    const keepLabel = kind === "descanso" ? "Seguir descansando" : "Seguir el reto";
    layer.querySelector(".sheet-backdrop").dataset.action = keepAction;
    layer.querySelector(".sheet").innerHTML = `
      <div class="w-10 h-1 rounded-full bg-line mx-auto mb-lg" aria-hidden="true"></div>
      <h2 id="sheet-title" class="text-title-md text-ink">${title}</h2>
      <div class="flex flex-col gap-sm mt-lg">
        ${button(keepLabel, { action: keepAction })}
        ${textButton("Entrar igual", { action: "interstitial-enter" })}
      </div>`;
    showSheet();
  }

  // Cierra un descanso activo (manual, automático, o porque se entró a una red igual)
  // y lo guarda en el historial con el tiempo real, sin castigo.
  function recordDescansoEnd() {
    if (!state.descanso.active) return;
    clearTimer(); // cancela el auto-fin pendiente (p. ej. si se entró igual a la red)
    const real = state.descanso.startedAt ? Math.max(1, Math.round((Date.now() - state.descanso.startedAt) / minuteMs())) : 0;
    state.descansoHistory.push({ id: Date.now().toString(36), minutes: state.descanso.minutes, realMinutes: real, date: new Date().toISOString() });
    state.descanso = { active: false, startedAt: null, minutes: null, timeId: null };
  }
  function endDescanso() { clearTimer(); recordDescansoEnd(); go("descanso-fin"); }

  // Sigue el flujo normal de abrir una red: nota de un amigo (si hay) y luego el check-in.
  function continueOpenApp() {
    if (state.noteQueue.length) { state.currentNote = state.noteQueue.shift(); state.replyChoice = null; state.replyChar = null; state.replySent = false; go("nota"); return; }
    afterNote();
  }
  const afterNote = () => openCheckin();

  // Alternativas según cómo llega Sami
  const alternativesFor = () => D.alternatives[state.emotionIn] || D.alternatives.default;

  // El tiempo llega preseleccionado con el de la última vez (o 10 min): nunca bloquea entrar.
  function goAlternativa() {
    const id = timeIdForMinutes(mostRecentEntry()?.minutes) ?? "10";
    state.timeId = id;
    state.minutes = D.times.find((t) => t.id === id).minutes;
    go("alternativa");
  }

  // ---------- Check-in: "¿Cómo te sientes?", una sola pregunta en hoja ----------
  let checkin = null; // { emotion }
  function openCheckin() {
    checkin = { emotion: null };
    renderCheckin();
    $("#sheet-layer").querySelector(".sheet-backdrop").dataset.action = "checkin-skip";
    showSheet();
  }
  function renderCheckin() {
    const grid = D.emotions.map((e, i) => {
      const wide = D.emotions.length % 2 === 1 && i === D.emotions.length - 1 ? "col-span-2" : "";
      return `<div class="${wide}">${emotionCard(e, checkin.emotion === e.id, "checkin-pick-emotion", { compact: true })}</div>`;
    }).join("");
    $("#sheet-layer").querySelector(".sheet").innerHTML = `
      <div class="w-10 h-1 rounded-full bg-line mx-auto mb-lg" aria-hidden="true"></div>
      <h2 id="sheet-title" class="text-title-md text-ink">¿Cómo te sientes?</h2>
      <p class="text-body text-ink-soft mt-xs">Solo tú lo ves.</p>
      <div class="grid grid-cols-2 gap-sm mt-md">${grid}</div>
      <div class="flex flex-col gap-sm mt-xl">
        ${button("Seguir", { action: "checkin-enter", disabled: !checkin.emotion })}
        ${button("Ahora no", { variant: "secondary", action: "checkin-skip" })}
      </div>`;
  }

  // ---------- ¿Cómo te sientes después?: hoja sobre el feed; al elegir pasa al cierre ----------
  function openExitSheet() {
    const layer = $("#sheet-layer");
    const grid = D.emotions.map((e, i) => {
      const wide = D.emotions.length % 2 === 1 && i === D.emotions.length - 1 ? "col-span-2" : "";
      return `<div class="${wide}">${emotionCard(e, false, "checkout-pick", { compact: true })}</div>`;
    }).join("");
    layer.querySelector(".sheet-backdrop").dataset.action = "checkout-skip";
    layer.querySelector(".sheet").innerHTML = `
      <div class="w-10 h-1 rounded-full bg-line mx-auto mb-lg" aria-hidden="true"></div>
      <h2 id="sheet-title" class="text-title-md text-ink">¿Cómo te sientes después?</h2>
      <div class="grid grid-cols-2 gap-sm mt-md">${grid}</div>
      <div class="mt-xl">${button("Saltar", { variant: "secondary", action: "checkout-skip" })}</div>`;
    showSheet();
  }
  function closeExitSheetAndShowClosing() {
    closeSheet();
    go("cierre");
  }

  // ---------- Hoja genérica de selección: "Agregar meta" / "Proponer un reto" ----------
  let picker = null; // { title, help, options, picked, onSave }
  function openPicker(title, help, options, onSave) {
    picker = { title, help, options, picked: null, onSave };
    renderPicker();
    $("#sheet-layer").querySelector(".sheet-backdrop").dataset.action = "sheet-dismiss";
    showSheet();
  }
  function renderPicker() {
    const chips = picker.options.map((label, i) => chip(label, { action: "picker-choose", value: i, selected: picker.picked === i })).join("");
    $("#sheet-layer").querySelector(".sheet").innerHTML = `
      <div class="w-10 h-1 rounded-full bg-line mx-auto mb-lg" aria-hidden="true"></div>
      <h2 id="sheet-title" class="text-title-md text-ink">${picker.title}</h2>
      <p class="text-body text-ink-soft mt-xs">${picker.help}</p>
      <div class="flex flex-wrap gap-sm mt-lg">${chips}</div>
      <div class="flex flex-col gap-sm mt-xl">
        ${button("Guardar", { action: "picker-save", disabled: picker.picked === null })}
        ${button("Ahora no", { variant: "secondary", action: "sheet-dismiss" })}
      </div>`;
  }

  // ---------- Acciones (un solo listener) ----------
  const actions = {
    "open-home-demo": () => go("home"),
    "open-app": (v) => {
      resetSession(); state.app = v;
      // Ajuste "Pausa antes de abrir redes" apagado: PILAS no interviene, entra directo.
      if (!state.settings.pauseBeforeOpen) return go("entrando");
      if (state.descanso.active) return openInterstitial("descanso");
      const joinedId = Object.keys(state.joinedChallenges).find((id) => state.joinedChallenges[id]);
      if (joinedId) {
        const c = [...D.challenges, ...state.customChallenges].find((x) => x.id === joinedId);
        return openInterstitial("reto", c);
      }
      continueOpenApp();
    },
    "interstitial-keep-descanso": () => { closeSheet(); go("home"); },
    "interstitial-keep-reto": () => { closeSheet(); go("home"); },
    "interstitial-enter": () => { closeSheet(); recordDescansoEnd(); continueOpenApp(); },

    "note-reply": () => go("responder"),
    "note-enter": () => afterNote(),
    "pick-reply": (v) => { state.replyChoice = Number(v); rerender(); },
    "pick-reply-char": (v) => { state.replyChar = v; rerender(); },
    "reply-send": () => { state.replySent = true; go("nota"); }, // vuelve a la nota; de ahí entra cuando quiera
    "reply-back": () => go("nota"),

    "open-pilas": () => go("inicio"),
    "go-grupo": () => go("grupo"),
    "go-inicio": () => go("inicio"),
    "go-descanso": () => {
      // El tiempo sugerido llega preseleccionado; Sami puede cambiarlo con los chips.
      if (!state.descanso.active && !state.descanso.timeId) state.descanso.timeId = String(D.breakSuggestion.minutes);
      go(state.descanso.active ? "descanso-activo" : "descanso");
    },
    // Acceso rápido desde Hoy: llega a Descanso con 2 min preseleccionados (si ya hay uno activo, lo retoma).
    "descanso-quick": () => {
      if (state.descanso.active) return go("descanso-activo");
      state.descanso.timeId = "2";
      go("descanso");
    },
    "go-yo": () => go("yo"),
    "toggle-challenge": (v) => { state.joinedChallenges[v] = !state.joinedChallenges[v]; rerender(); },
    "open-propose-challenge": () => openPicker("Proponer un reto", "Elige uno para tu grupo.", D.challengeSuggestions,
      (title) => { const id = `custom-${Date.now().toString(36)}`; state.customChallenges.push({ id, title, friends: [] }); state.joinedChallenges[id] = true; }),
    "open-add-goal": () => openPicker("Agregar meta", "Elige una para este mes.", D.goalSuggestions,
      (title) => { state.customGoals.push({ id: `custom-${Date.now().toString(36)}`, title, current: 0, target: 1, unit: "veces" }); }),
    "picker-choose": (v) => { picker.picked = Number(v); renderPicker(); },
    "picker-save": () => { picker.onSave(picker.options[picker.picked]); closeSheet(); picker = null; rerender(); },
    "sheet-dismiss": () => { closeSheet(); picker = null; },
    "dismiss-goal": (v) => { state.dismissedGoalIds.push(v); rerender(); },
    "toggle-app-pause": (v) => { state.pausedApps[v] = !state.pausedApps[v]; rerender(); },
    "toggle-setting": (v) => { state.settings[v] = !state.settings[v]; rerender(); },

    // Déjale algo a un amigo
    "open-note-composer": () => { state.noteDraft = { friendId: null, suggestion: null, custom: "" }; go("dejarmensaje"); },
    "note-pick-friend": (v) => { state.noteDraft.friendId = v; rerender(); },
    "note-pick-suggestion": (v) => { state.noteDraft.suggestion = Number(v); rerender(); },
    "note-send": () => {
      const friend = D.GROUP[state.noteDraft.friendId];
      state.noteConfirmation = friend.name;
      state.noteDraft = { friendId: null, suggestion: null, custom: "" };
      go("inicio");
    },
    "note-back": () => { state.noteDraft = { friendId: null, suggestion: null, custom: "" }; go("inicio"); },

    // El tiempo se elige aquí y solo aquí
    "pick-time": (v) => { state.timeId = v; state.minutes = D.times.find((t) => t.id === v).minutes; rerender(); },

    // Check-in en hoja: una emoción y sigue a las alternativas
    "checkin-pick-emotion": (v) => { checkin.emotion = v; renderCheckin(); },
    "checkin-enter": () => { state.emotionIn = checkin.emotion; closeSheet(); checkin = null; goAlternativa(); },
    "checkin-skip": () => { closeSheet(); checkin = null; go("entrando"); }, // nunca se bloquea la entrada

    "pick-alt": (v) => { state.alt = Number(v); go("alternativa-hecha"); },
    "alt-enter": () => go("entrando"),

    "feed-exit": () => { clearTimer(); openExitSheet(); },
    "sheet-exit": () => { clearTimer(); openExitSheet(); }, // reemplaza el contenido de la hoja, ya abierta
    "sheet-more": () => { closeSheet(); schedule(5, () => go("pasaste")); },
    "over-exit": () => { clearTimer(); go("feed", { soft: true }); openExitSheet(); },
    "over-continue": () => { go("feed"); schedule(5, () => go("pasaste")); },

    // ¿Cómo te sientes después?: guarda y pasa al cierre
    "checkout-pick": (v) => { state.emotionOut = v; saveCurrentEntry(); closeExitSheetAndShowClosing(); },
    "checkout-skip": () => { saveCurrentEntry(); closeExitSheetAndShowClosing(); },

    "go-today": () => go("inicio"),

    // Descanso
    "descanso-pick-time": (v) => { state.descanso.timeId = v; rerender(); },
    "descanso-start": () => {
      const t = D.breakTimes.find((t) => t.id === state.descanso.timeId);
      state.descanso.active = true; state.descanso.minutes = t.minutes; state.descanso.startedAt = Date.now();
      go("descanso-activo");
    },
    "descanso-go-home": () => go("home"),
    "descanso-end": () => endDescanso(),
    "descanso-close": () => go("inicio"),

    "reset-all": resetAll,
  };

  document.addEventListener("click", (ev) => {
    // Tocar personaje: parpadea una vez
    const ch = ev.target.closest(".character");
    if (ch) { ch.classList.remove("blink"); void ch.getBoundingClientRect(); ch.classList.add("blink"); }

    const el = ev.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const a = el.dataset.action;
    if (a === "statusbar") return tripleTap();
    actions[a]?.(el.dataset.value);
  });

  // Texto libre de "Dejarle algo a un amigo": actualiza el estado y el botón sin
  // rehacer la pantalla completa (perdería el foco y la posición del cursor).
  document.addEventListener("input", (ev) => {
    if (!ev.target.matches('[data-action="note-type"]')) return;
    state.noteDraft.custom = ev.target.value;
    const sendBtn = document.querySelector('[data-action="note-send"]');
    if (sendBtn) sendBtn.disabled = !(state.noteDraft.friendId && (state.noteDraft.custom.trim() || state.noteDraft.suggestion != null));
  });

  // ---------- Botón oculto de demo: triple toque en la barra de estado ----------
  let taps = [];
  function tripleTap() {
    const now = Date.now();
    taps = [...taps.filter((t) => now - t < 600), now];
    if (taps.length >= 3) { taps = []; demo = !demo; updateDemoFlag(); }
  }
  const updateDemoFlag = () => ($("#demo-flag").hidden = !demo);

  // ---------- Reloj ----------
  const clockText = () => new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: false });
  function tick() { $("#clock").textContent = clockText(); const c = $("#home-clock"); if (c) c.textContent = clockText(); }

  // ---------- Arranque ----------
  updateDemoFlag();
  tick(); setInterval(tick, 30000);
  loadEntries(); // precarga los datos de ejemplo si no hay nada guardado
  go("home"); // la app abre en el celular simulado; Hoy se alcanza con el ícono PILAS
})();
