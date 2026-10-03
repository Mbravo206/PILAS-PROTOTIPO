// js/ui.js — componentes del design system como funciones que devuelven HTML.
// Todas las acciones usan data-action / data-value; app.js las escucha con un solo listener.
window.UI = (function () {
  const { EMO } = window.PILAS_DATA;
  const attrs = (action, value) =>
    `${action ? `data-action="${action}"` : ""} ${value != null ? `data-value="${value}"` : ""}`;

  // Botón · variantes: primary, secondary, tonal, active y phone. Alto 52px, pill, label 14/500.
  // Secundario y tonal llevan fondo blanco: sobre el color de una emoción no se pierden.
  // "phone" = vuelve al celular simulado (amarillo + ícono de celular).
  // "active" = estado ya activado (p. ej. "Estás en el reto"): verde de intención + check.
  function button(label, { variant = "primary", action, value, disabled = false, full = true, icon = null, pressed = null } = {}) {
    const base =
      "btn inline-flex items-center justify-center h-[52px] px-lg rounded-full text-label select-none " +
      "transition duration-200 ease-out active:scale-[0.98] " + (full ? "w-full " : "");
    const variants = {
      primary:
        "bg-primary text-white active:bg-primary-pressed " +
        "disabled:bg-line disabled:text-ink-soft disabled:active:scale-100",
      secondary: "bg-surface border-2 border-primary text-ink active:bg-line",
      tonal: "bg-surface border-2 border-primary/30 text-ink active:bg-line",
      active: "bg-state-intencion border-2 border-ink/20 text-ink active:brightness-95",
      phone: "bg-emo-alegria border-2 border-ink/20 text-ink active:brightness-95",
    };
    const ic = icon ? `<i data-lucide="${icon}" class="w-5 h-5 mr-sm pop" stroke-width="2" aria-hidden="true"></i>` : "";
    const pr = pressed == null ? "" : `aria-pressed="${pressed}"`;
    return `<button type="button" class="${base}${variants[variant]}" ${pr} ${attrs(action, value)} ${disabled ? "disabled" : ""}>${ic}${label}</button>`;
  }

  // Botón de texto · sin fondo, borde ni redondeo: la salida discreta de una decisión ("Entrar igual").
  // Sigue siendo visible (ink, subrayado) y con área táctil de 44px de alto y todo el ancho.
  function textButton(label, { action, value } = {}) {
    return `<button type="button" class="btn w-full h-11 text-label text-ink underline underline-offset-4 select-none transition duration-200 ease-out active:opacity-70" ${attrs(action, value)}>${label}</button>`;
  }

  // Botón de icono · 44×44, tonal, siempre con aria-label
  function iconButton(icon, ariaLabel, action) {
    return `<button type="button" class="btn w-11 h-11 rounded-full bg-line/60 active:bg-line inline-flex items-center justify-center transition duration-200 ease-out active:scale-[0.98]" aria-label="${ariaLabel}" ${attrs(action)}>
      <i data-lucide="${icon}" class="w-6 h-6 text-ink" stroke-width="1.5"></i></button>`;
  }

  // Boca por emoción. Trazo grueso (#1F2240) igual en todas, más una por defecto para "sin emoción" (PILAS).
  const MOUTHS = {
    calma: `<path d="M39 61q11 8 22 0" stroke="#1F2240" stroke-width="4" stroke-linecap="round" fill="none"/>`,
    alegria: `<path d="M33 58q17 20 34 0" stroke="#1F2240" stroke-width="4" stroke-linecap="round" fill="none"/>`,
    ansiedad: `<path d="M38 64l6-6 6 6 6-6 6 6" stroke="#1F2240" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    aburrimiento: `<line x1="39" y1="63" x2="61" y2="63" stroke="#1F2240" stroke-width="4" stroke-linecap="round"/>`,
    default: `<path d="M41 62q9 5 18 0" stroke="#1F2240" stroke-width="4" stroke-linecap="round" fill="none"/>`,
  };

  // Personaje · blob por emoción, con cara: ojos + boca que cambia según cómo llega/sale.
  // face: "minima" (ojos + boca) | "ninguna" (blob liso). "Tocar personaje" lo hace parpadear (css .blink).
  function character(emotionId, size = 64, face = "minima", extraClass = "") {
    const fill = EMO[emotionId]?.fill || "#4C57A9";
    const mouth = MOUTHS[emotionId] || MOUTHS.default;
    const face_ = face === "minima"
      ? `<circle cx="38" cy="46" r="5" fill="#1F2240"/><circle cx="62" cy="46" r="5" fill="#1F2240"/>${mouth}`
      : "";
    return `<svg class="character ${extraClass}" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 8c24 0 40 17 40 41S74 92 50 92 10 73 10 49 26 8 50 8z" fill="${fill}"/>${face_}</svg>`;
  }

  // Chip · alto 40px (área táctil 44 vía .hit-44). Con emoción: color + personaje 20px.
  // Presionar: escala 0.98 (regla del design system, § Micro-interacciones). `brightness`
  // en vez de un color fijo porque el fondo puede venir del `style` inline (color de emoción).
  function chip(label, { action, value, selected = false, emotionId = null } = {}) {
    const e = emotionId ? EMO[emotionId] : null;
    let cls = "hit-44 relative h-10 px-md rounded-full border-2 text-label inline-flex items-center gap-xs " +
      "transition duration-200 ease-out active:scale-[0.98] active:brightness-95 ";
    let style = "";
    // Elegido = relleno primary con texto blanco (se ve a simple vista); sin elegir = borde visible.
    if (selected && e) { cls += "text-ink border-transparent"; style = `background:${e.bg}`; }
    else if (selected) cls += "text-white border-primary bg-primary";
    else cls += "text-ink border-primary/30 bg-surface";
    const pop = selected && e ? `<span class="pop">${character(emotionId, 20)}</span>` : "";
    return `<button type="button" class="${cls}" style="${style}" aria-pressed="${selected}" ${attrs(action, value)}>${pop}${label}</button>`;
  }

  // EmotionCard · tarjeta de emoción, siempre con su color (icono llamativo, se ve sin tocarla).
  // Elegida: borde ink + personaje que "salta". compact = fila de 64px (hojas inferiores).
  function emotionCard(e, selected, action, { compact = false } = {}) {
    const ring = selected ? "border-ink" : "border-transparent";
    // Compacta (hojas, 2 columnas de ~164px): texto de 14px y menos relleno para que "Aburrimiento" quepa.
    const text = e.bigText ? "text-[18px] leading-6 font-bold" : compact ? "text-label" : "text-body font-medium";
    const layout = compact ? "min-h-[64px] flex-row items-center gap-sm p-sm" : "min-h-[112px] flex-col items-start justify-between p-md";
    return `<button type="button" class="emotion-card w-full rounded-card border-2 ${ring} flex ${layout} text-left text-ink transition duration-200 ease-out active:scale-[0.98]"
      style="background:${e.bg}" aria-pressed="${selected}" ${attrs(action, e.id)}>
      <span class="${selected ? "pop" : ""} inline-flex items-center justify-center rounded-full bg-surface shrink-0 ${compact ? "w-10 h-10" : "w-12 h-12"}">${character(e.id, compact ? 30 : 36, "minima", selected ? "react-" + e.id : "")}</span>
      <span class="${text} min-w-0">${e.label}</span></button>`;
  }

  // Punto de emoción para listas
  function emotionDot(emotionId) {
    const e = EMO[emotionId];
    if (!e) return `<span class="inline-block w-3 h-3 rounded-full border border-line" aria-hidden="true"></span>`;
    return `<span class="inline-block w-3 h-3 rounded-full" style="background:${e.bg}" aria-hidden="true"></span>`;
  }

  // Avatar con el personaje de una emoción, sobre surface con borde line
  function avatar(emotionId, size = 40) {
    return `<span class="inline-flex items-center justify-center rounded-full bg-surface border border-line overflow-hidden shrink-0" style="width:${size}px;height:${size}px">
      ${character(emotionId, Math.round(size * 0.8))}</span>`;
  }

  // Avatar de una persona del grupo: color propio (`member.color`) + su inicial.
  // Texto en ink; el morado (4.4:1, `bigText`) lleva la inicial en 18px/700, como el resto del design system.
  function personAvatar(member, size = 40) {
    const fs = Math.round(Math.max(size * 0.45, member.bigText ? 18 : 12));
    return `<span class="inline-flex items-center justify-center rounded-full border border-line shrink-0 font-bold text-ink select-none"
      style="width:${size}px;height:${size}px;background:${member.color};font-size:${fs}px;line-height:1" role="img" aria-label="${member.name}">${member.name[0]}</span>`;
  }

  // Flor de regalo: la que un amigo te manda en una nota. Mismo trazo grueso ink que el personaje.
  function flower(size = 96) {
    const petals = [0, 72, 144, 216, 288].map((a) =>
      `<ellipse cx="50" cy="26" rx="13" ry="18" fill="#C28CAE" stroke="#1F2240" stroke-width="3" transform="rotate(${a} 50 46)"/>`).join("");
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Una flor">
      <path d="M50 64v30" stroke="#1F2240" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M50 82q-16-2-20-14 14-2 20 14z" fill="#6698CC" stroke="#1F2240" stroke-width="3" stroke-linejoin="round"/>
      ${petals}<circle cx="50" cy="46" r="10" fill="#FFEC89" stroke="#1F2240" stroke-width="3"/></svg>`;
  }

  // Dibujo de Juan ("no te rías"): trazo torpe a mano alzada sobre una hoja. Autorretrato con pelo de pinchos y el sol.
  function drawing(width = 240) {
    return `<svg width="${width}" viewBox="0 0 240 200" role="img" aria-label="Dibujo de Juan: una cara sonriente con el pelo parado y un sol">
      <rect x="2" y="2" width="236" height="196" rx="6" fill="#FFFFFF" stroke="#E4E0EF" stroke-width="2"/>
      <circle cx="198" cy="40" r="17" fill="#FFEC89" stroke="#1F2240" stroke-width="3"/>
      <g stroke="#1F2240" stroke-width="3" stroke-linecap="round"><path d="M198 12v-6M198 74v-6M170 40h-6M232 40h-6M178 20l-4-4M218 60l4 4M218 20l4-4M178 60l-4 4"/></g>
      <path d="M62 62l-8-24 18 14 6-26 14 22 12-24 6 26 16-16-4 28" fill="none" stroke="#1F2240" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M60 66q-8 46 6 74 14 26 46 24 32-2 44-28 10-26-2-68-30-14-94-2z" fill="#FFAD33" stroke="#1F2240" stroke-width="3.4" stroke-linejoin="round"/>
      <circle cx="92" cy="104" r="6" fill="#1F2240"/><circle cx="130" cy="102" r="9" fill="#1F2240"/>
      <path d="M86 128q22 26 52 0" fill="none" stroke="#1F2240" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M118 140q4 14 14 8" fill="#C28CAE" stroke="#1F2240" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 182q50-10 160 0" fill="none" stroke="#6BAA75" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }

  // Etiqueta informativa (no interactiva): borde line, texto caption. P. ej. "En el reto"
  function tag(label) {
    return `<span class="inline-flex items-center px-sm h-7 rounded-full border border-line text-caption text-ink-soft">${label}</span>`;
  }

  // Interruptor · 52×32, role="switch". Pista con borde 2px en ambos estados; la perilla nunca
  // desaparece: blanca sobre primary (encendido), ink-soft sobre line (apagado).
  // Presionar: escala 0.98 en la pista, sin tocar el desliz del control (transform en el <span> hijo).
  function toggle(checked, { action, value, ariaLabel } = {}) {
    const track = checked ? "bg-primary border-primary active:brightness-95" : "bg-line border-ink-soft active:brightness-95";
    const knob = checked ? "translate-x-[22px] bg-white" : "translate-x-0 bg-ink-soft";
    return `<button type="button" role="switch" aria-checked="${checked}" aria-label="${ariaLabel || ""}"
      class="hit-44 relative inline-flex items-center w-[52px] h-8 rounded-full border-2 shrink-0 transition duration-200 ease-out active:scale-[0.98] ${track}"
      ${attrs(action, value)}>
      <span class="block w-6 h-6 rounded-full shadow-sm transition duration-200 ease-out ${knob}" aria-hidden="true"></span>
    </button>`;
  }

  // Ícono de la app PILAS (diseño de Figma). Vectorial, sin archivos externos.
  function pilasIcon(size = 64) {
    return `<div class="ico" style="width:${size}px;height:${size}px;border-radius:22.5%;overflow:hidden;position:relative;box-shadow:0 4px 8px -4px rgba(31,34,64,.35);">
      <svg viewBox="0 0 120 120" role="img" aria-label="PILAS" style="width:100%;height:100%;display:block;">
        <rect width="120" height="120" fill="#4C57A9"/>
        <circle cx="60" cy="58" r="50" fill="#6698CC" opacity=".5"/>
        <circle cx="60" cy="56" r="37" fill="#F2CF3D"/>
        <g fill="none" stroke="#1F2240" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M52 92 L51 107 L44 108"/><path d="M68 92 L69 107 L76 108"/>
          <path d="M24 56 Q10 48 15 28"/><path d="M8 38 L3 35"/><path d="M19 22 L20 16"/>
          <path d="M96 60 Q103 74 99 86"/>
          <circle cx="49" cy="52" r="3.6" fill="#1F2240" stroke="none"/><circle cx="71" cy="52" r="3.6" fill="#1F2240" stroke="none"/>
          <path d="M53 65 Q60 72 67 65"/>
        </g>
      </svg>
    </div>`;
  }

  return { button, textButton, iconButton, character, chip, emotionCard, emotionDot, avatar, personAvatar, flower, drawing, tag, toggle, pilasIcon };
})();
