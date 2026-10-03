# PILAS · Prototipo vertical



## Abrir
- Doble clic en `index.html`. Funciona sin servidor y sin internet.

## Flujo
Celular simulado → (aviso de descanso o reto) → (nota de un amigo) → ¿Cómo te sientes? → ¿Y si pruebas otra cosa primero? + tiempo → Feed → (aviso o te pasaste) → ¿Cómo te sientes después? → Cierre → Celular



Publicado en https://pilas-prototipo.vercel.app 

## Editar
| Quiero cambiar... | Archivo |
|---|---|
| Emociones, tiempos, alternativas, grupo, retos y mensajes | `js/data.js` |
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
- `docs/specs/` — specs de feature (requirements.md y design.md)
- `docs/design-system.md` — tokens, componentes, voz
- `docs/pantallas.md` — objetivo y copy de cada pantalla
- `SPEC.md` — rumbo, decisiones cerradas y criterios G1–G8
- `GUIA.md` — flujo de trabajo con Claude Code (spec-driven) y qué se guarda dónde
- `CLAUDE.md` — stack, comandos de verificación y reglas para Claude Code
- `docs/creditos.md` — licencias de assets

