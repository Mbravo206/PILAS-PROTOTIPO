// js/screens/flujo/nota.js — pantalla nota (nota de un amigo). Extraído de app.js; el contenido ahora hace scroll para que los botones no queden fuera de pantalla.
  const sentReplyText = () => [D.friendReplies[state.replyChoice], D.replyDolls.find((d) => d.id === state.replyChar)?.label].filter(Boolean).join(" · ");
Object.assign(renderers, {
    // Nota de un amigo antes de entrar: no bloquea y no ve tu uso
    nota() {
      const n = state.currentNote;
      const friend = D.GROUP[n.from];
      const e = D.EMO.alegria;
      return `
        <div class="h-full flex flex-col px-lg text-center" style="background:${e.bg}">
         <!-- El contenido hace scroll si no cabe (dibujo, flor, respuesta enviada) y los botones de abajo quedan siempre a la vista.
              my-auto lo centra cuando sí cabe, sin cortar la parte de arriba cuando no. -->
         <div class="flex-1 overflow-y-auto flex flex-col items-center">
         <div class="my-auto w-full flex flex-col items-center">
          <div class="flex justify-center">${character("alegria", 120)}</div>
          <div class="flex items-center justify-center gap-sm mt-xl">
            ${personAvatar(friend, 32)}
            <p class="text-label text-ink">${friend.name} te dejó algo antes de entrar</p>
          </div>
          <h1 tabindex="-1" class="text-title-lg text-ink outline-none mt-md">${n.message}</h1>
          ${n.drawing ? `<div class="bg-surface rounded-card border border-line p-md mt-lg mx-auto">${drawing(240)}<p class="text-caption text-ink-soft mt-sm">${friend.name} te mandó un dibujo</p></div>` : ""}
          ${n.gift === "flor" ? `<div class="bg-surface rounded-card border border-line p-md mt-lg mx-auto flex flex-col items-center gap-xs">${flower(96)}<p class="text-caption text-ink-soft">${friend.name} te mandó una flor</p></div>` : ""}
          ${state.replySent ? `<p class="text-label text-ink mt-lg">Le respondiste a ${friend.name}: ${sentReplyText()}.</p>` : ""}
          <p class="text-label text-ink-soft mt-lg">${friend.name} no ve si entras, cuánto tiempo ni cómo te sientes.</p>
         </div>
         </div>
          <div class="pb-xl flex flex-col gap-sm">
            ${state.replySent
              ? button(`Entrar a ${D.APP[state.app]?.name || "la red"}`, { action: "note-enter" })
              : button("Responderle", { action: "note-reply" }) + textButton("Entrar igual", { action: "note-enter" })}
          </div>
        </div>`;
    },
});
