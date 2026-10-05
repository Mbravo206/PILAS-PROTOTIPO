// js/screens/flujo/cierre.js — pantalla cierre. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
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
});
