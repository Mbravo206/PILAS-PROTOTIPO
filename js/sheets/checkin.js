// js/sheets/checkin.js — check-in ¿Cómo te sientes?. Extraído tal cual de app.js (sin cambios de lógica).
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
