# PILAS · Spec del prototipo vertical
> v0.5 · Grupo 7 · Leer junto con `design-system.md` y `pantallas.md` (misma carpeta)
> Cambios frente a v0.2: alineación con el flujo del Figma de referencia — ver
> `docs/specs/2026-09-30-figma-flow-alignment/` (requirements.md).
> v0.4: la app **abre en el celular simulado (0)**; "Hoy" (13) se alcanza con el
> ícono PILAS. Los flujos de Instagram y TikTok terminan de vuelta en el celular.

## 1. Qué se construye

Prototipo móvil funcional de **una tarea**: abrir una red social con intención y salir sin culpa.
La app abre en el **celular simulado mínimo (0)**, que demuestra la
intercepción — en producción eso sería un Accessibility Service (Android) o
Screen Time (iOS); HTML/CSS/JS no puede interceptar el lanzamiento real de
otra app. Flujo desde ahí: **0 → (interstitial de descanso/reto) → (nota de
amigo) → check-in rápido → 9 → feed → (aviso) → ¿cómo sales? → 0**. El ícono
PILAS del celular abre "Hoy" (13).

**Fuera de alcance:** onboarding, registro semanal, ajustes, modo Pomodoro, login, backend.

## 2. Stack

| Decisión | Elección | Por qué |
|---|---|---|
| Lenguaje | HTML + CSS + JS vanilla | Sin build para correr; abre con doble clic |
| Estilos | Tailwind con los tokens de `js/tailwind.config.js`: `css/tailwind.css` compilado (offline) + Play CDN (desarrollo con internet) | El pitch no depende del wifi |
| Fuente | Rubik 400/500/700, archivos locales en `assets/fonts/` | Design system, offline |
| Iconos | Lucide, copia local en `js/vendor/` | Design system, offline |
| Datos | `localStorage` (con respaldo en memoria si falla) | Persistencia simple entre recargas |
| Navegación | SPA de un solo `index.html`, cambio de pantalla con JS | Un ejecutable que abre con doble clic |

## 3. Estructura de archivos

```
pilas-prototipo/
├── index.html               # contenedor + una <section data-screen="..."> por pantalla
├── css/
│   ├── styles.css           # fuente local, marco de celular, hoja inferior, reduced motion
│   └── tailwind.css         # GENERADO — no editar a mano (tools/ → npm run build:css)
├── js/
│   ├── tailwind.config.js   # tokens del design system (colores, tipografía, espaciado, radios, sombra)
│   ├── data.js              # emociones, tiempos, alternativas, apps, premiados, logros, datos de ejemplo
│   ├── ui.js                # componentes: button, iconButton, chip, emotionCard, character, emotionDot
│   ├── app.js               # estado + router + pantallas + acciones + timers + localStorage
│   └── vendor/lucide.min.js
├── assets/fonts/            # Rubik woff2
├── tools/                   # solo para regenerar css/tailwind.css
└── docs/                    # spec, design system, pantallas
```

## 4. Presentación

- Marco de celular de 390 × 844 px centrado en el computador (pitch).
- En un celular real (≤ 500 px de ancho) ocupa la pantalla completa, sin marco.

## 5. Estado

```js
// js/app.js
const state = {
  screen: "home", // pantalla activa — el celular simulado es la entrada
  app: null,        // red elegida al abrir el celular simulado
  emotionIn: null,  // "¿Cómo te sientes?" (hoja de check-in)
  intent: null,     // intención (7, o del check-in rápido)
  minutes: null,    // tiempo elegido (7) · null = sin tiempo
  timeId: null,     // chip de tiempo elegido
  startedAt: null,  // timestamp al entrar al feed
  emotionOut: null, // emoción de salida (11)
  exceeded: false,  // si se pasó del tiempo
  alt: null,        // alternativa elegida (8)
  saved: false,     // evita guardar dos veces
  replyChoice: null,    // respuesta rápida al responder a un amigo
  noteDraft: {...},     // borrador de "Dejarle algo a un amigo"
  descanso: {...},      // descanso activo (rato sin redes)
  descansoHistory: [],  // historial de descansos
};
```

**Registro** en `localStorage` bajo `pilas.entries` (array):
```js
{ id, app, emotionIn, intent, minutes, realMinutes, emotionOut, exceeded, date }
```

## 6. Pantallas y comportamiento

| # | `data-screen` | Entra desde | Acciones → destino | Criterio de aceptación |
|---|---|---|---|---|
| 13 | `inicio` | Ícono PILAS del celular / pestaña "Hoy" | "Volver al inicio" → 0 · "Reiniciar prototipo" | Sin lista de entradas del día; sin totales ni rachas |
| 0 | `home` | Arranque de la app / `cierre` / "Volver al inicio" en Hoy | Tocar Instagram o TikTok → interstitial o check-in · PILAS → 13 | Solo redes con pausa + PILAS, sin apps decorativas |
| — | interstitial (hoja) | Tocar una red con descanso o reto activo | "Seguir descansando/el reto" → 0 · "Entrar igual" → sigue el flujo | Mismo peso visual, nunca bloquea |
| `nota` | `nota` | Cola de notas de amigos | "Responderle" → `responder` · "Entrar igual" → check-in | Una sola vez por nota, no ve el uso |
| — | `responder` | `nota` | Elegir respuesta + "Enviar" → check-in · "Volver" → `nota` | "Enviar" requiere una respuesta elegida |
| — | check-in (hoja) | Tras la nota (o directo) | "¿Cómo te sientes?": emoción + "Seguir" → 8 · "Ahora no" → 9 | Una sola pregunta; "Seguir" deshabilitado hasta elegir. Sin "¿A qué vas?" |
| 8 | `alternativa` | check-in | Alternativa → 8b → 0 · "Igual quiero entrar" → 9 | "¿Y si pruebas otra cosa primero?" + única pregunta de tiempo (5/10/15, preseleccionado). Mismo peso visual |
| 9 | `entrando` | check-in ("Ahora no"), 8 | Automática (1 s) → feed | Muestra la red y el tiempo |
| — | `feed` | 9, 12 | Scroll · botón X → hoja "¿Cómo te sientes después?" | Guarda `startedAt` una sola vez |
| 10 | hoja `#sheet-layer` | Feed al cumplirse el tiempo | "Salir" → hoja "¿Cómo te sientes después?" · "5 min más" (o tocar fuera) → feed | Hoja inferior, no pantalla completa |
| 12 | `pasaste` | Feed tras los 5 min extra | "Salir" → hoja "¿Cómo te sientes después?" · "Seguir" → feed (vuelve a avisar en 5 min) | Minutos reales vs. elegidos |
| — | "¿Cómo te sientes después?" (hoja) | 10, 12, X del feed | Emoción o "Saltar" → guarda y `cierre` (auto, 1.5 s) → 0 | Hoja sobre el feed con tarjetas de color, se cierra sola |
| — | `cierre` | hoja "¿Cómo te sientes después?" | Automática (1.5 s) → 0 | "Es tu decisión, sigue así." + frase corta; si se pasó, "Listo. Mañana es otro día." Sin botón manual |
| — | `descanso` / `descanso-activo` / `descanso-fin` | Nav "Descanso" | "Empezar descanso" → activo · "Salir antes" o fin automático → `descanso-fin` → 13 | Sin castigo si sale antes |
| — | `dejarmensaje` | Card en Hoy | Amigo + mensaje + "Enviar mensaje" → 13 (confirmación) · "Volver" → 13 | Requiere amigo y mensaje elegido/escrito |

## 7. Modo demo (pitch)

- **Tiempo acelerado:** 1 minuto elegido = 5 segundos. `index.html?demo=1` o **triple toque en la barra de estado**. Se ve "modo demo" en la barra.
- **Reiniciar prototipo** (pantalla 13): borra `localStorage` y vuelve a 0 (celular).
- **Datos de ejemplo:** 2 entradas precargadas si no hay nada guardado.

## 8. Reglas que el código no puede romper

- Toda pantalla que interrumpe tiene salida visible ("Ahora no", "Seguir", "Saltar").
- Nunca se bloquea la entrada a la red.
- No aparece rojo salvo en errores técnicos.
- No hay contador regresivo visible en 6, 7 ni 8 (ni en el feed).
- Una sola acción primaria por pantalla.
- Áreas táctiles de mínimo 44 × 44 px (chips de 40 px usan `.hit-44`).
- Respeta `prefers-reduced-motion`.

## 9. Decisiones provisionales tomadas en el código (validar en grupo)

| Tema | Qué hace hoy el código | Dónde cambiarlo |
|---|---|---|
| "Sin tiempo" | Vuelve como chip "Indefinido" (pantalla 8) y también ocurre con "Ahora no": no hay aviso de tiempo, se sale con la X del feed | `data.js → times` |
| 4 emociones en 2 columnas | Se quitó Tristeza: queda una grilla 2 × 2; tarjetas siempre de color, con la carita sobre un círculo blanco | `app.js → renderCheckin`, `ui.js → emotionCard` |
| Navegación inferior | 4 destinos: Hoy · Grupo · Descanso · Yo (todos funcionan). El design system (§ BottomNav) aún dice Hoy · Emociones · Intenciones · Yo — desactualizado | `app.js → bottomNav` |
| Ajuste "Pausa antes de abrir redes" | Apagado: abrir una red entra directo, sin nota ni check-in | `app.js → actions["open-app"]` |
| Grupo | "Los premiados de hoy" muestra 2 personas, sin puntos ni ranking; "Retos activos" muestra siempre 2 | `data.js → rewarded, challenges` |
| Descanso | "Tus logros": 3 estadísticas simuladas con barra y % (reemplaza "Tus descansos") | `data.js → breakStats` |
| Tocar fuera de la hoja 10 | Cuenta como "5 min más" | `index.html → .sheet-backdrop` |
| Cara del personaje | `face="minima"` (dos ojos) | `ui.js → character()` |
| Alternativas de la pantalla 8 | Las del borrador, pendientes de entrevistas | `data.js → alternatives` |

## 10. Criterios de "listo"

- [x] El flujo mínimo corre de principio a fin sin errores en consola (probado en Chromium, modo demo).
- [ ] Probado en otro computador (Chrome y un navegador más).
- [x] Abre con doble clic en `index.html`, sin servidor ni internet.
- [ ] Probado en un celular real.
- [x] Modo demo funciona.
- [x] Carpeta de fuentes + ejecutable pesa menos de 20 MB (~0,5 MB).
