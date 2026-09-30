# PILAS · Prototipo vertical

Grupo 7 · Diseño Interactivo UJTL

## Abrir
- Doble clic en `index.html`. Funciona sin servidor y sin internet.
- **Modo demo** (1 min = 5 s): abrir `index.html?demo=1` o tocar 3 veces la barra de estado.
- En celular: abrir el mismo archivo; ocupa la pantalla completa.

## Flujo
Home simulado → ¿Cómo llegas? → ¿A qué vas? → (Otra opción) → Entrando → Feed → Aviso → (Te pasaste) → ¿Cómo sales? → Inicio

## Editar
| Quiero cambiar... | Archivo |
|---|---|
| Emociones, intenciones, tiempos, alternativas | `js/data.js` |
| Colores, tipografía, espaciado | `js/tailwind.config.js` |
| Botones, chips, tarjetas, personaje | `js/ui.js` |
| Pantallas y lógica | `js/app.js` |

Si agregas clases de Tailwind nuevas, con internet se ven de una (Play CDN). Para que también se vean **sin internet**:
```bash
cd tools
npm install        # solo la primera vez
npm run build:css  # regenera css/tailwind.css
```

## Documentación
- `docs/spec.md` — qué se construye, estado, pantallas, reglas, decisiones pendientes
- `docs/design-system.md` — tokens, componentes, voz
- `docs/pantallas.md` — objetivo y copy de cada pantalla
- `SPEC.md` — rumbo, decisiones cerradas y criterios G1–G8
- `GUIA.md` — flujo de trabajo con Claude Code (spec-driven) y qué se guarda dónde
- `CLAUDE.md` — stack, comandos de verificación y reglas para Claude Code
- `docs/creditos.md` — licencias de assets
- `docs/figma/` — PNG exportados de Figma, uno por pantalla
