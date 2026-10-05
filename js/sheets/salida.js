// js/sheets/salida.js — salida ¿Cómo te sientes después?. Extraído tal cual de app.js (sin cambios de lógica).
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
