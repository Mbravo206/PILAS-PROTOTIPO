# PILAS · Prototipo vertical — Examen de Seguimiento 2026-2S (Grupo 7)

Prototipo móvil de **una tarea**: abrir una red social con intención y salir
sin culpa. Vertical = una sola tarea navegable de principio a fin.

Lee en este orden: **`SPEC.md`** (rumbo, criterios G1–G8) → `docs/spec.md`
(estado, pantallas, reglas técnicas) → `docs/design-system.md` (tokens,
componentes, voz) → `docs/pantallas.md` (objetivo y copy de cada pantalla).
Al retomar: lee además el `tasks.md` abierto en `docs/specs/`.

## Stack

- HTML + CSS + JS vanilla. Un solo `index.html`; cada pantalla es una
  `<section data-screen="...">` que pinta `js/app.js`.
- Tailwind v3 con los tokens de `js/tailwind.config.js`: `css/tailwind.css`
  compilado (offline) + Play CDN (clases nuevas al vuelo con internet).
- Rubik local (`assets/fonts/`), Lucide local (`js/vendor/`), `localStorage`.
- Se abre con doble clic en `index.html`. Modo demo: `index.html?demo=1` o
  triple toque en la barra de estado (1 min = 5 s).
- **Ejecutable = la misma carpeta** (no hay build de código; solo de CSS).

## Verificación

Los agentes `planner`, `task-verifier` y el workflow `converge-tasks` leen
estos comandos. Correr desde la raíz del proyecto.

```bash
# Static check (sintaxis JS):
node --check js/app.js && node --check js/ui.js && node --check js/data.js && node --check js/tailwind.config.js

# Test suite (reglas del design system/spec, sin navegador):
node --test tools/smoke.test.js

# Build (CSS offline; obligatorio si agregaste clases de Tailwind nuevas):
cd tools && npm install && npm run build:css
```

Lo visual y el flujo en navegador no tienen tests automáticos: cada tarea
declara su verificación manual en `tasks.md` y `task-verifier` la reporta como
`MANUAL`. Al final, `test-plan.md` se corre a mano en otro computador.

## Cómo está armado el código

- `js/app.js`: `state`, `go(screen)`, `renderers[screen]()` devuelve HTML,
  `onEnter[screen]()` efectos, `actions[...]` responde a `data-action`.
- `js/ui.js`: componentes (button, iconButton, chip, emotionCard, character,
  emotionDot). Úsalos en vez de escribir botones o chips a mano.
- `js/data.js`: contenido editable (emociones, intenciones, tiempos,
  alternativas, apps, datos de ejemplo).
- `js/tailwind.config.js`: tokens. Solo clases de tokens (`bg-primary`,
  `text-ink-soft`, `rounded-card`, `p-md`, `text-title-lg`…), nunca hex sueltos.

**Agregar una pantalla:** `<section class="screen" data-screen="x" hidden>` en
`index.html` → `renderers.x = () => screen({ title, body, actions })` → acciones
en `actions` → si hay clases nuevas, build de CSS.

**Aplicar un diseño de Figma:** el PNG va en `docs/figma/NN-nombre.png`. Ajusta
solo esa pantalla, con tokens y componentes existentes; si Figma trae un color
o tamaño que no está en los tokens, pregunta antes de inventarlo.

## Flujo de trabajo (spec-driven)

El proyecto base ya existe, así que se arranca en `/specify` (brainstorming
solo si aparece algo nuevo):
`/specify` (requirements.md → design.md, tomando `docs/spec.md` como fuente) →
`/planning-tasks` (tasks.md) → implementar tarea por tarea → `task-verifier`
antes de marcar Done → `/commit` → `/plan-test-cases` (3 casos manuales).
**Un solo spec de feature.** Si algo se atrasa, se recorta alcance.

## Reglas no negociables

- Una sola acción primaria por pantalla. Toda interrupción tiene salida visible.
- Nunca bloquear la entrada a la red. Sin conteos regresivos, rachas, puntos,
  niveles, trofeos ni patrones oscuros (deceptive.design).
- Rojo (`state-error`) solo para errores técnicos. `state-fuera` siempre al 30%.
- Todo el texto en `ink`; blanco solo sobre `primary`. Tristeza con texto 18px/700.
- Áreas táctiles ≥ 44px. Animación 200ms ease-out solo como respuesta a un
  toque; respetar `prefers-reduced-motion`.
- Copy: tuteo, frases cortas, botones que dicen qué pasa, sin emojis ni MAYÚSCULAS.

## Convenciones

- UI en español; nombres de código en inglés (los ids de pantalla y estados
  en español se mantienen como están). Comentarios en español.
- Datos de ejemplo ficticios: nunca datos reales de adolescentes entrevistados.
- Todo asset nuevo se registra en `docs/creditos.md`.
- Commits: mensaje enfocado en el porqué. Un commit por tarea terminada.
