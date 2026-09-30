// js/tailwind.config.js — tokens del design system PILAS v1.0 (docs/design-system.md)
// Sirve para dos cosas:
//  1) En el navegador, con el Play CDN (desarrollo, sin build).
//  2) Con el CLI de Tailwind (tools/) para generar css/tailwind.css y que el prototipo abra SIN internet.
// Si cambian las emociones, editar aquí y en js/data.js.
const pilasTailwind = {
  theme: {
    extend: {
      colors: {
        background: "#FBF8F1",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#1F2240", soft: "#5A5D7A" }, // text-ink · text-ink-soft
        line: "#E4E0EF",
        primary: { DEFAULT: "#4C57A9", pressed: "#3B4488" }, // bg-primary · bg-primary-pressed
        emo: {
          calma:        { DEFAULT: "#6698CC", fill: "#4E7FB3" },
          alegria:      { DEFAULT: "#FFEC89", fill: "#F2CF3D" },
          ansiedad:     { DEFAULT: "#FFAD33", fill: "#E8901A" },
          aburrimiento: { DEFAULT: "#C28CAE", fill: "#A86F93" },
          tristeza:     { DEFAULT: "#967CC7", fill: "#7B61AE" },
        },
        state: {
          intencion: "#6BAA75",
          fuera: "#FFAD33", // usar SIEMPRE al 30%: bg-state-fuera/30
          error: "#CC1400", // SOLO errores técnicos
        },
      },
      fontFamily: {
        sans: ["Rubik", "system-ui", "sans-serif"],
      },
      fontSize: {
        "title-lg": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "title-md": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        label: ["14px", { lineHeight: "20px", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        input: "16px",
        card: "24px",
        sheet: "28px",
      },
      boxShadow: {
        pilas: "6px 6px 0 0 #D8D5E6", // solo la tarjeta protagonista
      },
    },
  },
};

if (typeof module !== "undefined") {
  module.exports = { content: ["./index.html", "./js/**/*.js"], ...pilasTailwind };
} else if (window.tailwind) {
  tailwind.config = pilasTailwind;
}
