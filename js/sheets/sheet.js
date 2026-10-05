// js/sheets/sheet.js — hoja inferior genérica: abrir y cerrar #sheet-layer. Extraído tal cual de app.js (sin cambios de lógica).
  // ---------- Hoja inferior genérica: abrir/cerrar #sheet-layer ----------
  // Los "open*" de abajo solo rellenan el contenido; showSheet() se encarga de
  // mostrar la capa y cancela cualquier cierre pendiente (evita que un cierre
  // en curso oculte una hoja que se acaba de reemplazar, p. ej. sheet-exit).
  let sheetHideTimeout = null;
  function showSheet() {
    const layer = $("#sheet-layer");
    clearTimeout(sheetHideTimeout);
    layer.hidden = false;
    requestAnimationFrame(() => layer.classList.add("sheet-open"));
    layer.querySelector("button")?.focus();
    return layer;
  }
  function closeSheet() {
    const layer = $("#sheet-layer");
    layer.classList.remove("sheet-open");
    clearTimeout(sheetHideTimeout);
    sheetHideTimeout = setTimeout(() => (layer.hidden = true), 200);
  }
