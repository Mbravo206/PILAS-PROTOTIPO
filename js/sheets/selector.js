// js/sheets/selector.js — hoja de selección: Agregar meta y Proponer un reto. Extraído tal cual de app.js (sin cambios de lógica).
  // ---------- Hoja genérica de selección: "Agregar meta" / "Proponer un reto" ----------
  let picker = null; // { title, help, options, picked, onSave }
  function openPicker(title, help, options, onSave) {
    picker = { title, help, options, picked: null, onSave };
    renderPicker();
    $("#sheet-layer").querySelector(".sheet-backdrop").dataset.action = "sheet-dismiss";
    showSheet();
  }
  function renderPicker() {
    const chips = picker.options.map((label, i) => chip(label, { action: "picker-choose", value: i, selected: picker.picked === i })).join("");
    $("#sheet-layer").querySelector(".sheet").innerHTML = `
      <div class="w-10 h-1 rounded-full bg-line mx-auto mb-lg" aria-hidden="true"></div>
      <h2 id="sheet-title" class="text-title-md text-ink">${picker.title}</h2>
      <p class="text-body text-ink-soft mt-xs">${picker.help}</p>
      <div class="flex flex-wrap gap-sm mt-lg">${chips}</div>
      <div class="flex flex-col gap-sm mt-xl">
        ${button("Guardar", { action: "picker-save", disabled: picker.picked === null })}
        ${button("Ahora no", { variant: "secondary", action: "sheet-dismiss" })}
      </div>`;
  }
