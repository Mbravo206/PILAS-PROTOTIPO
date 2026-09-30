# PILAS · Sistema de diseño v1.0
> Grupo 7 · Diseño Interactivo UJTL · Fuentes: `PILAS · Sistema de diseño v1.0.html`, `DESIGN system view.pdf`, `pilas-ui/tailwind.config.js`
> Leer junto con `pantallas.md` y `spec.md`. En código: `js/tailwind.config.js` (tokens) y `js/ui.js` (componentes).

**Concepto:** ponerse las pilas es darse cuenta y actuar por decisión propia. Tono: tranquila, cercana, honesta.

---

## 1. Color base

| Token | Hex | Uso |
|---|---|---|
| `background` | #FBF8F1 | Fondo de pantalla |
| `surface` | #FFFFFF | Tarjetas, hojas |
| `ink` | #1F2240 | Todo el texto |
| `ink-soft` | #5A5D7A | Texto secundario, borde de toggle apagado (3:1) |
| `line` | #E4E0EF | Bordes, pressed de `tonal` |
| `primary` | #4C57A9 | Acción primaria (único fondo con texto blanco) |
| `primary-pressed` | #3B4488 | Estado presionado |

## 2. Emociones y estados

Solo relleno, siempre con texto `ink`. **Nunca indican bien o mal.** Provisionales hasta cerrar el diagrama de afinidades.

| Emoción | Fondo | Relleno personaje | Copy de pausa |
|---|---|---|---|
| Calma | #6698CC | #4E7FB3 | Llegas con calma. ¿Para qué entras? |
| Alegría | #FFEC89 | #F2CF3D | Llegas con alegría. ¿Para qué entras? |
| Ansiedad | #FFAD33 | #E8901A | Llegas con ansiedad. ¿Respiras un momento? |
| Aburrimiento | #C28CAE | #A86F93 | Llegas aburrido. ¿Qué buscas? |
| Tristeza | #967CC7 | #7B61AE | Llegas con tristeza. ¿Qué necesitas? |

- Tristeza tiene 4.4:1 con `ink`: su texto va en **18px / 700**.
- En Tailwind: `bg-emo-calma`, `bg-emo-calma-fill`, etc.

| Estado | Hex | Regla |
|---|---|---|
| `state-intencion` | #6BAA75 | Cumplió la intención |
| `state-fuera` | #FFAD33 | Se pasó — **siempre al 30%** (`bg-state-fuera/30`) |
| `state-error` | #CC1400 | **Solo errores técnicos** |

## 3. Tipografía · Rubik 400 / 500 / 700

| Token | Tamaño / línea · peso | Ejemplo |
|---|---|---|
| `title-lg` | 28/34 · 700 | ¿Cómo llegas? |
| `title-md` | 22/28 · 700 | Tu semana |
| `body` | 16/24 · 400 | Saliste cuando quisiste. Mañana puedes volver a elegir. |
| `label` | 14/20 · 500 | Guardar intención |
| `caption` | 12/16 · 400 | Sin conexión. Tus datos se guardan cuando vuelva. |

## 4. Espaciado, radios, sombra

- **Espaciado:** `xs` 4 · `sm` 8 · `md` 16 · `lg` 24 · `xl` 32 · `2xl` 48
- **Radios:** `input` 16 · `card` 24 · `sheet` 28 · botones pill
- **Sombra:** `shadow-pilas` = `6px 6px 0 0 #D8D5E6` — solo la tarjeta protagonista
- **Área táctil mínima:** 44 × 44 px

## 5. Componentes

| Componente | Especificación | En código |
|---|---|---|
| **Botón** | 3 variantes (`primary` · `secondary` · `tonal`), 5 estados. Alto 52px, pill, `label` 14/500. Una primaria por pantalla. Pressed secondary: `primary` al 8%; pressed tonal: `line`. Cargando: verbo en gerundio ("Guardando"). | `UI.button()` |
| **Botón de icono** | 44 × 44, tonal. Cerrar, volver, opciones. Siempre `aria-label`. | `UI.iconButton()` |
| **Chip** | Alto 40px. Seleccionado con emoción: color de la emoción + personaje 20px. Sin emoción: borde 2px `primary`. | `UI.chip()` |
| **EmotionCard / Grid** | Grilla de 2 columnas para check-in. | `UI.emotionCard()` |
| **Interruptor** | 52 × 32 dentro de fila de 56px. Apagado con borde `ink-soft`. `role="switch"`. | — (fuera de alcance) |
| **Input** | Con `helper` o `error`. Radio 16. | — |
| **Slider** | Intensidad con palabras en los extremos (Poco / Mucho). | — |
| **Card** | `featured` = protagonista con `shadow-pilas`. Máx. una por pantalla. | pantalla 13 |
| **IntentionSummary** | Lo que dijiste vs. lo que pasó, sin calificar. | pantalla 13 |
| **ListRow** | Filas de ajustes de 56px. | pantalla 13 |
| **BottomSheet** | Sube en 200ms, fondo `ink` al 40%. Se cierra tocando fuera o "Ahora no". | `#sheet-layer` |
| **BottomNav** | 4 destinos: Hoy · Grupo · Descanso · Yo. | pantalla 13 |
| **Personaje** | Blob por emoción con cara: ojos + boca que cambia según la emoción (sonrisa en calma/alegría, zigzag en ansiedad, línea en aburrimiento, mueca en tristeza). `face="minima"` (con cara) o `"ninguna"` (blob liso). Al tocarlo, parpadea. | `UI.character()` |
| **Avatar** | Personaje sobre `surface` con borde `line`. Sin personaje: inicial blanca sobre `primary`. | — |
| **Screen / PauseScreen** | Esqueleto de pantalla (safe areas, título, acciones, nav) y plantilla de pausa a pantalla completa. | `screen()` en `app.js` |

**Íconos:** Lucide, `strokeWidth 1.5`, 24px.

## 6. Perfiles

El perfil describe, no califica: sin contadores de días, niveles ni porcentajes de "éxito".
Ejemplo: "Usas PILAS desde marzo" · "Llegaste más veces con calma que con ansiedad."

## 7. Micro-interacciones

**Regla única:** todo se mueve solo como respuesta a un toque. 200ms, ease-out. Con `prefers-reduced-motion` el cambio de estado queda y el movimiento se va.

| Acción | Qué cambia | Reduced motion |
|---|---|---|
| Presionar | Escala 0.98 en todo elemento tocable (botón, chip, tarjeta, interruptor, ícono, pestaña del nav) + oscurece (`primary-pressed` o `brightness-95`) | Solo color |
| Elegir emoción | Chip se llena; personaje 0.8 → 1 | Aparece sin escala |
| Guardar | "Guardando" → "Intención guardada" en tonal. Sin confeti | — |
| Interruptor | Control se desliza 20px, pista a `primary` | Salta sin deslizar |
| Tocar personaje | Parpadea una vez. Nunca solo | Sin parpadeo |
| Hoja inferior | Sube desde abajo, fondo al 40% | Aparece sin deslizar |

## 8. Voz y copy

Tuteo, como un par. Frases cortas. Botones dicen exactamente qué pasa. Sin emojis, sin MAYÚSCULAS en botones.

| Situación | Sí | No |
|---|---|---|
| Antes de abrir una red | ¿Cómo llegas? | ¿Seguro que quieres entrar? |
| Se pasó de la intención | Llevas 25 min. Dijiste 10. | ¡Superaste tu límite! |
| Cumplió la intención | Saliste cuando quisiste. | ¡Lo estás haciendo increíble! |
| Salida de una pausa | Ahora no | Prefiero seguir perdiendo tiempo |

## 9. Lo que PILAS no es

- **Sin gamificación:** sin rachas, trofeos, niveles, puntos ni batería que se descarga.
- **Sin castigo:** sin rojo para regañar (rojo solo para errores técnicos); emociones sin juicio.
- **Siempre con salida:** toda pausa tiene "Ahora no"; sin conteos regresivos; nada se anima solo.

## 10. Stories para redes

Piezas 9:16. El personaje se asoma desde abajo: solo ojos, la boca queda fuera del encuadre.

## 11. Checklist por pantalla

- [ ] Una sola acción primaria
- [ ] Máximo un color de emoción protagonista y una `Card featured`
- [ ] Todo el texto en `ink` (blanco solo sobre `primary`)
- [ ] Si interrumpe, tiene "Ahora no" o "Volver"
- [ ] Sin rachas, puntos, niveles, trofeos ni conteos regresivos
- [ ] Rojo solo para errores técnicos
- [ ] Botones dicen qué pasa ("Guardar intención", no "Continuar")
- [ ] Áreas táctiles ≥ 44px

## 12. Pendientes

- Emociones finales (diagrama de afinidades) → editar `js/data.js` y `js/tailwind.config.js`.
- 5 emociones en grilla de 2 columnas: hoy la quinta ocupa el ancho completo (alternativas: scroll, 3 columnas o número par).
- Cara del personaje: `minima` vs `ninguna`, probar con 2 adolescentes.
