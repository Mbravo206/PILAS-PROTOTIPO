// tools/smoke.test.js — pruebas rápidas sin dependencias (node --test tools/)
// Verifican reglas del design system y del spec que se pueden chequear sin navegador.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

// Carga data.js y ui.js en un "window" falso
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read("js/data.js"), ctx);
vm.runInContext(read("js/ui.js"), ctx);
const D = ctx.window.PILAS_DATA;
const UI = ctx.window.UI;

test("cada emoción tiene color, relleno y copy de pausa", () => {
  assert.ok(D.emotions.length >= 2);
  for (const e of D.emotions) {
    assert.match(e.bg, /^#[0-9A-F]{6}$/i, e.id);
    assert.match(e.fill, /^#[0-9A-F]{6}$/i, e.id);
    assert.ok(e.pause && e.pause.endsWith("?"), `pause de ${e.id}`);
  }
});

test("ninguna emoción usa el rojo de error (#CC1400)", () => {
  for (const e of D.emotions) {
    assert.notEqual(e.bg.toUpperCase(), "#CC1400");
    assert.notEqual(e.fill.toUpperCase(), "#CC1400");
  }
});

test("el tiempo solo se pregunta con 3 opciones y todas tienen minutos", () => {
  assert.equal(D.times.length, 3);
  for (const t of D.times) assert.ok(t.minutes > 0, t.id);
});

test("Grupo muestra exactamente 2 premiados y hay 2 retos de base", () => {
  assert.equal(D.rewarded.length, 2);
  assert.equal(D.challenges.length, 2);
});

test("Tus logros son porcentajes entre 0 y 100", () => {
  assert.ok(D.breakStats.length >= 2);
  for (const s of D.breakStats) assert.ok(s.pct >= 0 && s.pct <= 100, s.label);
});

test("cada acción de data-action tiene su handler en app.js", () => {
  const src = read("js/app.js") + read("js/ui.js");
  const used = new Set([...src.matchAll(/action: "([a-z0-9-]+)"/g)].map((m) => m[1]));
  for (const m of src.matchAll(/data-action="([a-z0-9-]+)"/g)) used.add(m[1]);
  // "statusbar" y "note-type" los atienden listeners propios (triple toque / input), no `actions`.
  const own = new Set(["statusbar", "note-type"]);
  const block = read("js/app.js");
  const handlers = block.slice(block.indexOf("const actions = {"));
  for (const a of used) {
    if (own.has(a)) continue;
    assert.ok(handlers.includes(`"${a}":`), `sin handler: ${a}`);
  }
});

test("las entradas de ejemplo tienen el formato del registro", () => {
  const keys = ["id", "app", "emotionIn", "minutes", "realMinutes", "emotionOut", "exceeded", "date"];
  for (const e of D.sampleEntries()) for (const k of keys) assert.ok(k in e, k);
});

test("el botón primario usa bg-primary y el secundario no", () => {
  assert.match(UI.button("Seguir"), /bg-primary/);
  assert.doesNotMatch(UI.button("Ahora no", { variant: "secondary" }), /\bbg-primary\b(?!\/)/);
});

test("el botón de icono siempre lleva aria-label", () => {
  assert.match(UI.iconButton("x", "Cerrar", "close"), /aria-label="Cerrar"/);
});

test("el copy no tiene emojis ni botones en MAYÚSCULAS", () => {
  const src = read("js/app.js") + read("js/data.js");
  assert.doesNotMatch(src, /\p{Extended_Pictographic}/u);
  const labels = [...src.matchAll(/button\("([^"]+)"/g)].map((m) => m[1]);
  for (const l of labels) assert.notEqual(l, l.toUpperCase(), l);
});

test("los tokens del design system están en tailwind.config.js", () => {
  const cfg = require(path.join(root, "js/tailwind.config.js")).theme.extend;
  assert.equal(cfg.colors.primary.DEFAULT, "#4C57A9");
  assert.equal(cfg.colors.state.error, "#CC1400");
  assert.ok(cfg.boxShadow.pilas);
});
