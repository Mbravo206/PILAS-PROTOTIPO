# PILAS · Spec del prototipo vertical
> v0.6 · Grupo 7 · Leer junto con `design-system.md` y `pantallas.md` (misma carpeta).
> El spec de la feature de alineación con el Figma está en `docs/specs/2026-09-30-figma-flow-alignment/` (requirements.md y design.md).

## 1. Qué se construye

Prototipo móvil funcional de **una tarea**: abrir una red social con intención y salir sin culpa.

La app abre en el **celular simulado** (`home`), que demuestra la intercepción: en producción sería un Accessibility Service (Android) o Screen Time (iOS), porque HTML/CSS/JS no puede interceptar el lanzamiento de otra app. Desde ahí:

**home → (aviso de descanso o reto) → (nota de un amigo) → check-in → alternativas y tiempo → feed → (aviso o te pasaste) → salida → cierre → home**

El ícono de PILAS del celular abre **Hoy**; Hoy, Grupo, Descanso y Yo se navegan con la barra inferior. El detalle de cada pantalla está en `pantallas.md`.

**Fuera de alcance:** onboarding, registro semanal, ajustes completos, modo Pomodoro, login, backend.

## 2. Stack

| Decisión | Elección | Por qué |
|---|---|---|
| Lenguaje | HTML + CSS + JS vanilla | Sin build para correr; abre con doble clic |
| Estilos | Tailwind con los tokens de `js/tailwind.config.js`: `css/tailwind.css` compilado (offline) + Play CDN (desarrollo con internet) | El pitch no depende del wifi |
| Fuente | Rubik 400/500/700, archivos locales en `assets/fonts/` | Design system, offline |
| Iconos | Lucide, copia local en `js/vendor/` | Design system, offline |
| Datos | `localStorage` (con respaldo en memoria si falla) | Persistencia simple entre recargas |
| Navegación | SPA de un solo `index.html`, cambio de pantalla con JS | Un ejecutable que abre con doble clic |
| Publicación | Sitio estático en Vercel (https://pilas-prototipo.vercel.app). Cada push a `main` lo publica | Probar en celular sin descargar nada |

## 3. Estructura de archivos

```
pilas-prototipo/
├── index.html               # contenedor + una <section data-screen="..."> por pantalla
├── css/
│   ├── styles.css           # fuente local, marco de celular, hoja inferior, reduced motion
│   └── tailwind.css         # GENERADO, no editar a mano (tools/ → npm run build:css)
├── js/
│   ├── tailwind.config.js   # tokens del design system (colores, tipografía, espaciado, radios, sombra)
│   ├── data.js              # emociones, tiempos, alternativas, apps, grupo, retos, mensajes y datos de ejemplo
│   ├── ui.js                # componentes: button, textButton, iconButton, chip, emotionCard, character, avatar, personAvatar, flower, toggle…
│   ├── app.js               # estado + router + pantallas + acciones + timers + localStorage
│   └── vendor/lucide.min.js
├── assets/fonts/            # Rubik woff2
├── tools/                   # solo para regenerar css/tailwind.css y correr las pruebas
├── docs/                    # spec, design system, pantallas, specs de feature
└── .vercelignore            # qué NO se publica (docs, diseños, herramientas)
```

## 4. Presentación

- Marco de celular de 390 × 844 px centrado en el computador (pitch).
- En un celular real (≤ 500 px de ancho) ocupa la pantalla completa, sin marco.

## 5. Estado

```js
// js/app.js — sesión actual (se reinicia al volver al celular)
const state = {
  screen: "home",        // pantalla activa; la app arranca en el celular simulado
  app: null,             // red que se tocó
  emotionIn: null,       // emoción del check-in
  minutes: null,         // tiempo elegido; null = sin tiempo ("Indefinido" o "Ahora no")
  timeId: null,          // chip de tiempo elegido
  startedAt: null,       // timestamp al entrar al feed
  emotionOut: null,      // emoción al salir
  exceeded: false,       // se pasó del tiempo elegido
  alt: null,             // alternativa elegida
  saved: false,          // evita guardar dos veces la misma sesión
  currentNote: null,     // nota de amigo que se está mostrando
  replyChoice: null,     // frase elegida al responder
  replyChar: null,       // muñequito elegido al responder
  replySent: false,      // ya respondió a la nota actual
  // Perfil y grupo: solo se borran con "Reiniciar prototipo"
  joinedChallenges: {},  // retos en los que está Sami (empieza sin ninguno)
  customChallenges: [],  // retos que propuso
  noteQueue: [],         // notas de amigos pendientes de mostrar
  noteDraft: {},         // borrador de "Déjale algo a un amigo"
  noteConfirmation: null,// a quién le escribió (se muestra una vez en Hoy)
  customGoals: [], dismissedGoalIds: [],
  pausedApps: {},        // redes con pausa encendida (Instagram y TikTok)
  settings: { pauseBeforeOpen: true, shareTime: true },
  descanso: {},          // descanso activo: active, startedAt, minutes, timeId
  descansoHistory: [],   // descansos terminados, con su duración real
};
```

**Registro** en `localStorage` bajo `pilas.entries` (array). Se usa para preseleccionar el tiempo de la próxima vez; Hoy ya no lo muestra:
```js
{ id, app, emotionIn, minutes, realMinutes, emotionOut, exceeded, date }
```

## 6. Pantallas y comportamiento

Resumen. El objetivo, el contenido y el copy de cada una están en `pantallas.md`.

| `data-screen` / hoja | Entra desde | Acciones → destino | Criterio de aceptación |
|---|---|---|---|
| `home` | Arranque, cierre, "Volver al inicio", "Ir al celular", "Volver al celular" | Una red → aviso, nota o check-in · PILAS → `inicio` | Solo redes con pausa + PILAS, sin apps decorativas |
| Aviso de descanso o reto (hoja) | Tocar una red con descanso o reto activo | "Seguir descansando" / "Seguir el reto" → `home` · "Entrar igual" → sigue el flujo | "Entrar igual" siempre visible; nunca bloquea; un solo aviso a la vez |
| `nota` | Cola de notas de amigos | "Responderle" → `responder` · "Entrar igual" → check-in | Una vez por nota; el amigo no ve el uso |
| `responder` | `nota` | "Enviar" y "Volver" → `nota` | "Enviar" requiere una frase o un muñequito |
| Check-in (hoja) | Tras la nota (o directo) | Emoción + "Seguir" → `alternativa` · "Ahora no" → `entrando` | Una sola pregunta; "Seguir" deshabilitado hasta elegir |
| `alternativa` | Check-in | Una ficha → `alternativa-hecha` · "Igual quiero entrar" → `entrando` | Pregunta de tiempo con "Indefinido"; "Igual quiero entrar" visible |
| `alternativa-hecha` | `alternativa` | "Volver al celular" → `home` | — |
| `entrando` | Check-in ("Ahora no"), `alternativa` | Automática (1 s) → `feed` | Muestra la red y el tiempo |
| `feed` | `entrando`, `pasaste` | X → salida | Guarda `startedAt` una sola vez |
| Aviso de tiempo (hoja) | Feed, al cumplirse el tiempo | "Salir" → salida · "5 min más" (o tocar fuera) → `feed` | Hoja inferior; no sale con "Indefinido" |
| `pasaste` | Feed, tras los 5 min extra | "Salir" → salida · "Seguir" → `feed` | Minutos reales vs. elegidos |
| Salida (hoja) | X, aviso de tiempo, `pasaste` | Emoción o "Saltar" → guarda y `cierre` | Hoja sobre el feed con tarjetas de color |
| `cierre` | Salida | Automática (3 s) → `home` | Mensaje y color según la emoción; tarjeta de PILAS si llevó rato |
| `inicio` (Hoy) | Ícono PILAS, barra inferior | "Volver al inicio" → `home` · "Crear un foco" → `descanso` · "Escribir mensaje" → `dejarmensaje` | Sin totales, rachas ni lista de entradas |
| `grupo` | Barra inferior | Retos: "Le entro" / "Salir del reto" · "Proponer un reto" | Sin tiempos ajenos ni ranking |
| `descanso`, `descanso-activo`, `descanso-fin` | Barra inferior, "Crear un foco" | "Empezar descanso" → activo · "Salir antes" o fin automático → `descanso-fin` → `inicio` | Sin castigo si sale antes |
| `dejarmensaje` | Tarjeta en Hoy | Amigo + mensaje + "Enviar mensaje" → `inicio` · "Volver" → `inicio` | Requiere amigo y mensaje elegido o escrito |
| `yo` | Barra inferior | Interruptores de redes y ajustes · "Agregar meta" | Describe, no califica |

## 7. Modo demo (pitch)

- **Tiempo acelerado:** 1 minuto elegido = 5 segundos. `index.html?demo=1` o **triple toque en la barra de estado**. Se ve "modo demo" en la barra.
- **Reiniciar prototipo** (en Hoy): borra `localStorage`, deja a Sami sin reto y vuelve al celular.
- **Datos de ejemplo:** 2 entradas y 2 descansos precargados si no hay nada guardado.

## 8. Reglas que el código no puede romper

- Toda pantalla que interrumpe tiene salida visible ("Ahora no", "Seguir", "Saltar", "Entrar igual").
- Nunca se bloquea la entrada a la red.
- No aparece rojo salvo en errores técnicos.
- Sin contador regresivo visible en ninguna pantalla.
- Una acción principal por pantalla; las salidas discretas ("Entrar igual", "Igual quiero entrar") son texto plano pero siempre visibles y con área táctil de 44 px.
- Sin rachas, puntos, niveles ni trofeos; sin tiempos de otras personas.
- Áreas táctiles de mínimo 44 × 44 px (chips de 40 px usan `.hit-44`).
- Respeta `prefers-reduced-motion`.

## 9. Decisiones provisionales (validar en grupo)

| Tema | Qué hace hoy el código | Dónde cambiarlo |
|---|---|---|
| Arranque | Sami empieza sin ningún reto; el aviso de reto solo sale si se une a uno | `data.js → challenges.selfDefault` |
| Emociones | 4: Calma, Alegría, Ansiedad, Aburrimiento, en 2 × 2. Tristeza se quitó del selector. Provisionales hasta el diagrama de afinidades | `data.js → emotions` |
| Tiempo | 5, 10, 15 min o "Indefinido" (sin aviso). "Ahora no" también entra sin tiempo | `data.js → times` |
| Peso de las decisiones | La opción con intención va en botón oscuro; "Entrar igual" e "Igual quiero entrar" van en texto plano. **Riesgo:** puede leerse como patrón oscuro. Mitigación: siempre visible, 44 px, sin demora | `ui.js → textButton`, `app.js` |
| Aviso de descanso o reto | Tocar fuera equivale a "Seguir". "Entrar igual" termina el descanso y lo guarda en el historial, sin penalización | `app.js → openInterstitial` |
| Tocar fuera del aviso de tiempo | Cuenta como "5 min más" | `index.html → .sheet-backdrop` |
| Responder a un amigo | "Enviar" vuelve a la nota con una confirmación y un solo botón, "Entrar a ‹red›" | `app.js → actions["reply-send"]` |
| Cierre | 3 s; mensaje y color según la emoción de salida; tarjeta de PILAS si se pasó o llevó 20 min o más | `app.js → renderers.cierre` |
| Navegación inferior | 4 destinos: Hoy · Grupo · Descanso · Yo; la actual lleva una píldora de baja opacidad | `app.js → bottomNav` |
| Ajuste "Pausa antes de abrir redes" | Apagado: abrir una red entra directo, sin nota ni check-in | `app.js → actions["open-app"]` |
| Redes con pausa | Solo Instagram y TikTok, con la pausa encendida; el celular muestra las que estén encendidas | `data.js → apps` |
| Grupo | Chips "En curso" o "✓ Cumplió"; sin tiempos ajenos (el propio es privado y opcional); 2 premiados; 2 retos | `data.js → group, challenges, rewarded` |
| Avatares | Color propio por persona + inicial | `data.js → group.color`, `ui.js → personAvatar` |
| Hoy | Sin "Tu última vez" ni lista de entradas; tarjeta "Crea un foco" que lleva a Descanso con 2 min | `app.js → renderers.inicio` |
| Botones al celular | "Volver al inicio", "Ir al celular" y "Volver al celular" son amarillos con ícono de celular | `ui.js → button (variant phone)` |
| Descanso | "Tus logros": 3 estadísticas simuladas con barra y % | `data.js → breakStats` |
| Mensajes de amigos | Ligeros y sin compromisos ("Ey ey, ¡pilas con el cel!"); una nota puede traer una flor | `data.js → friendNotes` |
| Cara del personaje | `face="minima"` (dos ojos) | `ui.js → character()` |
| Alternativas | Las del borrador, pendientes de entrevistas | `data.js → alternatives` |

**Pendientes de código** (ver `docs/specs/2026-09-30-figma-flow-alignment/design.md`, "Known gaps"):
1. El temporizador del descanso comparte el `timer` de la sesión; al abrir una red se cancela y el descanso no termina solo hasta volver a su pantalla.
2. "Enviar mensaje" en `dejarmensaje` solo guarda el nombre del amigo para la confirmación, no el mensaje.

## 10. Criterios de "listo"

- [x] El flujo corre de principio a fin sin errores en consola (probado en Chromium, modo demo).
- [ ] Probado en otro computador (Chrome y un navegador más).
- [x] Abre con doble clic en `index.html`, sin servidor ni internet.
- [ ] Probado en un celular real.
- [x] Modo demo funciona.
- [x] Fuentes + ejecutable pesan mucho menos de 20 MB (sin `tools/node_modules`).
- [x] Publicado en Vercel.
