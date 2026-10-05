// js/screens/pilas/dejarmensaje.js — pantalla dejarmensaje. Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
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
            placeholder="Escribe algo corto" value="${esc(state.noteDraft.custom)}" data-action="note-type" aria-label="Escribe tu propio mensaje" />`,
        actions:
          button("Enviar mensaje", { action: "note-send", disabled: !canSend }) +
          button("Volver", { variant: "secondary", action: "note-back" }),
      });
    },
});
