// Copia la app (index.html, js/, css/, assets/) de fuentes/ a ../ejecutable/.
// Así ejecutable/ nunca se edita a mano: siempre es una copia de fuentes/.
// Uso: node tools/sync-ejecutable.js   (o: cd tools && npm run sync)
const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "..");
const dest = path.resolve(src, "..", "ejecutable");
const items = ["index.html", "js", "css", "assets"];

// Se borra solo lo que se va a copiar: .vercel/, .env.local y .gitignore (vínculo con Vercel) se conservan.
fs.mkdirSync(dest, { recursive: true });
for (const item of items) {
  fs.rmSync(path.join(dest, item), { recursive: true, force: true });
  fs.cpSync(path.join(src, item), path.join(dest, item), { recursive: true });
}
console.log("ejecutable/ actualizado desde fuentes/: " + items.join(", "));
