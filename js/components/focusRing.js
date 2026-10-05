// js/components/focusRing.js — anillo de progreso de Yo. Extraído tal cual de app.js (sin cambios de lógica).
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
