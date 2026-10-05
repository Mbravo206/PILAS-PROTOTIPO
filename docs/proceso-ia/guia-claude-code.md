# Guía de uso — qué se guarda dónde

Regla: **lo que no está en un archivo de esta carpeta o en un commit, se
pierde** al cerrar la sesión con Claude Code.

## 1. Mapa rápido

| Quieres guardar… | Dónde queda | Cómo |
| --- | --- | --- |
| Rumbo general, criterios G1–G8 | `SPEC.md` | A mano o pidiéndoselo a Claude |
| Detalle técnico y decisiones provisionales | `docs/spec-tecnico.md` | A mano o pidiéndoselo a Claude |
| Tokens, componentes, voz | `docs/design-system.md` + `js/tailwind.config.js` | Cambiar los dos juntos |
| Stack y comandos de verificación | `CLAUDE.md` | Ya están llenos |
| Pantallas de Figma | `docs/figma/NN-nombre.png` (solo local, no se sube a GitHub) | Export PNG 1x desde Figma |
| Qué debe hacer la tarea (criterios) | `docs/specs/<fecha>-<tarea>/requirements.md` | `/specify` |
| Cómo se construye | `design.md` (misma carpeta) | `/specify`, después de aprobar requirements |
| Plan, avance y **decisiones** | `tasks.md` (Status + Decision log + Outcome) | `/planning-tasks` y se actualiza al trabajar |
| Prueba de que cada tarea quedó | `Outcome` de cada tarea | Agente `task-verifier` |
| Casos de prueba finales | `test-plan.md` | `/plan-test-cases` |
| Historial del código | Git | `/commit` |
| Licencias de assets | `docs/creditos.md` | A mano |
| Datos de ejemplo largos | `.md` tipo base de datos | skill `markdown-crud` |

## 2. Primer uso (una sola vez)

1. Abre la terminal en esta carpeta (`pilas-prototipo`) y corre `claude`.
2. Inicia git para que `/commit` funcione:
   ```bash
   git init
   git add .
   git commit -m "Proyecto base PILAS con harness spec-driven"
   ```
3. Instala lo del CSS offline: `cd tools && npm install && cd ..`

## 3. Flujo liviano (recomendado para esta entrega)

Gasta menos tokens: sin `/specify` ni `/planning-tasks` (la fuente es `docs/spec-tecnico.md`).

| Paso | Escribe en Claude Code | Queda en |
| --- | --- | --- |
| 1 | "Crea docs/specs/2026-10-01-ajustes-finales/tasks.md con una tarea por pantalla a ajustar (06 a 13) más: emociones finales, alternativas de la 8, prueba en otro computador. Formato simple [ ] T1… Sin requirements ni design; la fuente es docs/spec-tecnico.md." | `tasks.md` |
| 2 | "Implementa T1 con docs/figma/06-llegada.png" | Código + Decision log de T1 |
| 3 | `node --test tools/smoke.test.js` (o "corre la verificación de CLAUDE.md") | Pruebas en verde |
| 4 | `/commit` | Commit de T1 |
| 5 | `/clear` y repetir 2–4 por tarea | — |
| 6 | `/plan-test-cases` (una vez, al final) | `test-plan.md` |
| 7 | Correr el plan en otro computador; `task-verifier` solo si sobra tiempo | PASS/FAIL en `test-plan.md` |

## 3b. Flujo completo (si hay tiempo o cambia algo grande)

| Paso | Escribe en Claude Code | Queda en |
| --- | --- | --- |
| 1 | `/specify` + "la tarea es la de SPEC.md D1; usa docs/spec-tecnico.md y docs/pantallas.md como fuente; lo que falta es ajustar las pantallas a Figma y cerrar las decisiones de docs/spec-tecnico.md §9" | `requirements.md` → `design.md` (aprobar cada uno) |
| 2 | `/planning-tasks` | `tasks.md` con T1, T2… |
| 3 | "Implementa T1" | Código + Decision log de T1 |
| 4 | "Verifica T1 con task-verifier" | PASS/FAIL → Outcome y `[x] Done` |
| 5 | `/commit` | Commit de T1 |
| 6 | `/clear` y repetir 3–5 por tarea | — |
| 7 | `/plan-test-cases` | `test-plan.md` (1 feliz + 2 de falla) |
| 8 | Correr el plan en otro computador | PASS/FAIL en `test-plan.md` |

**Ahorro de tokens:** `/clear` entre tareas; al retomar, solo "Lee SPEC.md y el
tasks.md abierto, ¿en dónde quedamos?". `/planning-tasks` lanza varios
`planner` en paralelo: si quieres gastar menos, pide "planea las tareas con
un solo planner, sin el workflow".

## 4. Para no perder el hilo

- **`tasks.md` es la memoria del proyecto.** Toda decisión no obvia va al
  Decision log de su tarea.
- **Estados:** `[ ]` pendiente · `[~]` en curso · `[x]` hecha · `[!]` bloqueada.
- **Si cambia algo grande:** primero `SPEC.md`, luego `requirements.md`, y se
  re-planea con `/planning-tasks`. Nunca al revés.

## 5. Antes de entregar (vie 2)

- [ ] Todas las tareas de `tasks.md` en `[x]`
- [ ] Verificación de `CLAUDE.md` en verde (static check + tests + build CSS)
- [ ] `test-plan.md` corrido en otro computador y en un celular
- [ ] Checklist G1–G8 de `SPEC.md` revisado
- [ ] `docs/creditos.md` completo
- [ ] Último `/commit` hecho
- [ ] Armar `Prototipo_Grupo7/`: `fuentes/` (esta carpeta sin `node_modules`),
      `ejecutable/` (index.html + css/ + js/ + assets/) y `LEEME.txt`
