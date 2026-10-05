// js/sheets/avisoDescanso.js — aviso antes de abrir una red durante un descanso o un reto. Extraído tal cual de app.js (sin cambios de lógica).
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
