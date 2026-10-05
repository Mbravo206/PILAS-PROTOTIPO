// js/sheets/avisoTiempo.js — aviso de tiempo cumplido. Extraído tal cual de app.js (sin cambios de lógica).
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
