# SPEC principal — Prototipo vertical PILAS

**Proyecto:** Examen de Seguimiento 2026-2S · Diseño Interactivo UJTL · Grupo 7
**Responsable del prototipo:** Mariana Bravo Celestino
**Estado:** Aprobado — 30 sep 2026 (D1 a D4 cerradas)

Este documento orienta todo el trabajo. El detalle técnico está en
`docs/spec-tecnico.md`; el visual en `docs/design-system.md`; el copy y objetivo de
cada pantalla en `docs/pantallas.md`. Los specs de feature en `docs/specs/` se
derivan de aquí y no pueden contradecirlo: si algo cambia, se cambia aquí primero.

---

## 1. Reto

> Diseñando escenarios saludables y constructivos para adolescentes en su uso de redes sociales.

- **Problema:** el consumo desmedido de redes fragmenta la atención, afecta
  memoria de trabajo y comprensión lectora, y alimenta ansiedad, insomnio y
  dependencia a la validación digital. Colombia está entre los países con más
  horas diarias en redes (~4 h); ~82 % de niños y adolescentes entra sin
  supervisión adulta.
- **Enfoque del grupo:** brainrot y ciclos de dopamina en adolescentes.
- **Ejes que ataca el prototipo:** 2. Selección consciente de contenidos
  (nombrar la emoción antes de entrar y poder elegir otra cosa) y 3. Establecimiento de
  límites de tiempo (tiempo elegido o indefinido + aviso sin castigo).

## 2. Qué se entrega

**Prototipo vertical, digital y funcional de la tarea más relevante** —
archivos fuente + ejecutable. Debe abrir en otro computador y aplicar la guía
de estilos del grupo.

## 3. Usuario

**Sami, 17 años, Bogotá.** Entra a redes en automático en pausas de estudio y
antes de dormir. Padres/tutores: stakeholders, no aparecen en esta tarea.

## 4. Decisiones cerradas

| ID | Decisión | Resultado |
| --- | --- | --- |
| D1 | Tarea a prototipar | Abrir una red social con intención y salir sin culpa (flujo en `docs/pantallas.md`) |
| D2 | Plataforma / stack | HTML + CSS + JS vanilla, Tailwind con tokens propios, todo local (sin internet ni servidor). Ver `CLAUDE.md` → Stack y `docs/spec-tecnico.md` → Estilos con Tailwind |
| D3 | Nombre del sistema | PILAS ("ponerse las pilas": darse cuenta y actuar por decisión propia) |
| D4 | Publicación | Sitio estático en Vercel (https://pilas-prototipo.vercel.app); cada push a `main` lo publica |

Decisiones provisionales de producto (arranque sin reto, 4 emociones, tiempo
indefinido, peso de las decisiones…): `docs/spec-tecnico.md` §9.

## 5. Alcance

**Dentro:** la tarea de D1 de principio a fin sin callejones sin salida;
estados vacíos y de cierre; datos de ejemplo ficticios coherentes con Sami;
retroalimentación visual (sonido opcional con el tema de Shara).

**Fuera:** login, cuentas, backend; onboarding, registro semanal, ajustes
completos y modo Pomodoro; integración real con redes; datos reales de
entrevistados.

## 6. Restricciones

| Restricción | Valor |
| --- | --- |
| Formatos de la convocatoria | HTML, CSS, JS |
| Peso | Carpeta del grupo ≤ 200 MB; el prototipo (sin `node_modules`) pesa pocos MB |
| Idioma de la interfaz | Español |
| Patrones oscuros | Prohibidos: scroll infinito como gancho, autoplay, urgencia falsa, desconexión difícil, acción forzada |
| Privacidad | Sin datos personales reales; uso de IA declarado (AIAS) |
| Assets | Propios o con licencia libre, en `docs/creditos.md` |

## 7. Criterios de aceptación globales

Todo spec de feature hereda estos criterios.

- **G1** — El prototipo SHALL permitir completar la tarea de D1 de principio a fin sin intervención del desarrollador.
- **G2** — WHEN se abre `index.html` en otro computador, THE prototipo SHALL arrancar sin instalar nada ni conexión a internet.
- **G3** — THE prototipo SHALL seguir el diagrama de flujo aprobado (`docs/pantallas.md`); cada pantalla del flujo tiene su equivalente navegable.
- **G4** — THE interfaz SHALL usar solo la paleta, tipografía y componentes de `docs/design-system.md`.
- **G5** — IF el usuario sale o cancela en cualquier punto, THEN el prototipo SHALL permitirlo en un paso, sin mensajes de culpa ni confirmaciones repetidas.
- **G6** — THE prototipo SHALL NOT usar ninguno de los patrones oscuros de §6, ni rachas, puntos, niveles o conteos regresivos.
- **G7** — THE tarea SHALL evidenciar los ejes 2 y 3 de §1.
- **G8** — Fuentes + ejecutable SHALL caber en la carpeta del grupo ≤ 200 MB.

## 8. Entradas de otros integrantes

| Entrada | De | Se usa para |
| --- | --- | --- |
| Persona master | Polo | Datos de ejemplo y copy |
| Diagrama de afinidades | Nicol | Emociones finales (check-in y salida) |
| Entrevistas | Nicol, Polo | Alternativas de "¿Y si pruebas otra cosa primero?" |
| Wireframes en papel | Daniela, Shara | Layout de cada pantalla |
| Pantallas en Figma / guía de estilos | Shara, Daniela, Mariana | G4 (exportar PNG a `docs/figma/`, solo local) |
| Tema principal / sonido | Shara | Feedback sonoro (opcional) |

## 9. Hitos

| Cuándo | Hito | Estado |
| --- | --- | --- |
| mié 30 | D1–D3 cerradas, proyecto base con el flujo completo navegable | Hecho |
| jue 1 · noche | Pantallas ajustadas a Figma/wireframes; emociones y alternativas finales | Pendiente |
| vie 2 · 4:00 pm | Guía de estilos aplicada (G4) y probado en otro computador (G2) | Pendiente |
| vie 2 · 10:00 pm | Fuentes + ejecutable en la carpeta del grupo, peso revisado (G8) | Pendiente |

## 10. Estructura de la entrega final

```
Prototipo_Grupo7/
├── fuentes/        # esta carpeta completa, sin node_modules
├── ejecutable/     # copia de index.html + css/ + js/ + assets/ (abre con doble clic)
└── LEEME.txt       # cómo abrirlo, requisitos, créditos
```

En el repositorio de GitHub solo se sube el contenido de `fuentes/` (por eso `index.html` está en la raíz); `ejecutable/` se entrega aparte y se genera con `npm run sync`.
