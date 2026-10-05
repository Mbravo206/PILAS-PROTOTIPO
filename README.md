# PILAS · Prototipo vertical

Examen de Seguimiento 2026-2S · Diseño Interactivo UJTL · Grupo 7

Prototipo móvil de **una sola tarea**: abrir una red social con intención y salir sin culpa. Publicado en https://pilas-prototipo.vercel.app (cada push a `main` lo actualiza).

## Si eres el profesor: por dónde empezar

1. **Probarlo (2 min):** doble clic en `index.html`. No necesita internet ni instalar nada. Toca Instagram o TikTok y recorre el flujo. Para ver los avisos de tiempo sin esperar, usa el **modo demo** (1 min = 5 s): abre `index.html?demo=1` o toca 3 veces la barra de estado.
2. **Entender qué se construyó (5 min):** lee [`SPEC.md`](SPEC.md): el reto, el usuario, las decisiones y los criterios de aceptación G1 a G8.
3. **Ver el código:** está en `js/`, con una pantalla por archivo en `js/screens/` (ver [Código](#código)). El mapa de todos los archivos está al inicio de `js/app.js`.

## Flujo del prototipo

Celular simulado → (aviso de descanso o reto) → (nota de un amigo) → ¿Cómo te sientes? → ¿Y si pruebas otra cosa primero? + tiempo → Feed → (aviso de tiempo) → ¿Cómo te sientes después? → Cierre → Celular

El ícono de PILAS del celular abre **Hoy**, con Grupo, Descanso y Yo en la barra inferior.

## Cómo funciona la app

Es una **sola página**: `index.html` trae el celular simulado y 16 `<section data-screen="...">` vacías. El código de `js/` rellena la que toca y muestra solo esa.

1. `go("nombre")` (en `js/core/router.js`) oculta todas las secciones, llama a `renderers[nombre]()` (devuelve el HTML de la pantalla, definido en su archivo de `js/screens/`) y muestra la sección.
2. Cada botón lleva `data-action="algo"`. Un único `click` en `document` busca esa acción en `actions` y la ejecuta; casi siempre termina en otro `go(...)`.
3. `state` recuerda la sesión (red, emoción de entrada y salida, tiempo). Las entradas terminadas se guardan en `localStorage` (`pilas.entries`).
4. Las hojas inferiores (avisos, check-in, salida, selectores) no son pantallas: se abren encima, en `#sheet-layer`.

| Grupo | Pantallas (`data-screen`) |
|---|---|
| Abrir una red con intención | `home`, `nota`, `responder`, `alternativa`, `alternativa-hecha`, `entrando`, `feed`, `pasaste`, `cierre` |
| Dentro de PILAS (ícono del celular) | `inicio` (Hoy), `grupo`, `descanso`, `descanso-activo`, `descanso-fin`, `dejarmensaje`, `yo` |

El diagrama completo del flujo y el copy de cada pantalla están en [`docs/pantallas.md`](docs/pantallas.md).

## Código

Es HTML, CSS y JavaScript sin frameworks. Cada pantalla es una `<section data-screen="...">` de `index.html` que el código de `js/` rellena (cada pantalla tiene su archivo en `js/screens/`).

| Quiero ver o cambiar... | Archivo |
|---|---|
| Una pantalla concreta (su HTML) | `js/screens/flujo/` (abrir una red) o `js/screens/pilas/` (Hoy, Grupo, Descanso, Yo) |
| Estado, navegación y guardado | `js/core/` (`state`, `router`, `storage`, `timers`, `flow`) |
| Hojas inferiores (avisos, check-in, salida, selector) | `js/sheets/` |
| Piezas de Hoy, Grupo y Yo, y la navegación inferior | `js/components/` (junto a `ui.js`) |
| Qué hace cada botón (`data-action`), listeners y arranque | `js/app.js` (con el mapa de todos los archivos) |
| Botones, chips, tarjetas y personajes (componentes) | `js/components/ui.js` |
| Textos, emociones, tiempos, retos y datos de ejemplo (ficticios) | `js/data.js` |
| Colores, tipografía y espaciado (tokens del design system) | `js/tailwind.config.js` |
| Marco de celular, animaciones y accesibilidad | `css/styles.css` |
| Pruebas automáticas del design system | `tools/smoke.test.js` |

Otras carpetas: `assets/` (tipografía Rubik, íconos, ilustraciones del feed y marca) y `tools/` (compilar el CSS y pruebas).

### Comandos

Desde `tools/` (la primera vez, `npm install`):

```bash
npm run build:css   # regenera css/tailwind.css (necesario si agregas clases de Tailwind nuevas)
npm run sync        # copia la app a ../ejecutable/ antes de entregar
npm test            # pruebas automáticas de las reglas del design system
```

La app no usa el Play CDN de Tailwind: solo el `css/tailwind.css` ya generado, así abre rápido y sin internet. Si agregas clases de Tailwind nuevas, corre `build:css` para que se vean.

## Documentación

**Qué se diseñó y por qué** (lo más útil para evaluar):

| Documento | Contenido |
|---|---|
| [`SPEC.md`](SPEC.md) | Rumbo del proyecto: reto, usuario, decisiones cerradas, alcance y criterios G1 a G8 |
| [`docs/spec-tecnico.md`](docs/spec-tecnico.md) | Estado actual, pantallas, reglas técnicas y decisiones aún provisionales |
| [`docs/pantallas.md`](docs/pantallas.md) | Objetivo y texto de cada pantalla |
| [`docs/design-system.md`](docs/design-system.md) | Colores, tipografía, componentes y voz de marca |
| [`docs/specs/`](docs/specs/) | Spec de la feature de alineación con el Figma (requirements y design, en inglés) |
| [`docs/creditos.md`](docs/creditos.md) | Licencias y créditos de todos los assets |

**Proceso de trabajo con IA** (el uso de IA está declarado según la escala AIAS en la declaración del grupo):

| Documento | Contenido |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Stack, comandos de verificación y reglas que sigue Claude Code en este proyecto |
| [`docs/proceso-ia/guia-claude-code.md`](docs/proceso-ia/guia-claude-code.md) | Cómo se organizó el trabajo con Claude Code y qué se guarda dónde |
| [`docs/proceso-ia/dynamic-workflows.md`](docs/proceso-ia/dynamic-workflows.md) | Informe de investigación (en inglés) sobre flujos de trabajo con agentes en Claude Code; es material de consulta, no parte del prototipo |

Las capturas de las pantallas de Figma se exportan a `docs/figma/` y son solo locales: no se suben a GitHub.

## Estructura de la entrega

```
Prototipo_Grupo7/
├── ejecutable/   # copia lista para abrir con doble clic (no se edita a mano)
├── fuentes/      # esta carpeta: código, documentación y pruebas
└── LEEME.txt     # cómo abrirlo (versión corta)
```

## Créditos

Rubik (SIL OFL 1.1), Lucide (ISC) y Tailwind CSS (MIT). El detalle está en [`docs/creditos.md`](docs/creditos.md).
