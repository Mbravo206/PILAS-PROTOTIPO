// js/screens/flujo/responder.js — pantalla responder. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
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
});
