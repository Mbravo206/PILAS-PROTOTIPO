# Design — Figma flow alignment

**Status:** Draft
**Date:** 2026-09-30
**Requirements:** ./requirements.md

## Overview

The prototype stays a single-page vanilla app (`index.html` + `js/app.js`,
`js/components/ui.js`, `js/data.js`, Tailwind tokens). No new modules, libraries or build
steps are introduced. The feature is delivered as changes to three existing
mechanisms:

- **Router** (`go(name)` + `renderers` + `onEnter`): the boot screen becomes
  `home` (minimal simulated phone); `inicio` ("Hoy") is reached only through
  the PILAS icon. New screens: `responder`, `descanso`, `descanso-activo`,
  `descanso-fin`, `dejarmensaje`.
- **Bottom sheet** (`#sheet-layer`, `showSheet`/`closeSheet`): every
  interruption that must stay dismissible is a sheet, not a screen —
  break/challenge interstitial, one-question check-in, exit emotion.
- **Actions** (`actions[...]`, one delegated click listener): all new behavior
  is a `data-action` handler; there are no new listeners except the existing
  `input` listener for the free-text note.

Key decisions: (1) the "open a social app" decision tree lives in a single
handler, `actions["open-app"]`, so precedence rules (Req 3.3, 6.6) are in one
place; (2) all new content (replies, suggestions, break times, stats) lives in
`js/data.js`, matching how emotions/times/alternatives are already modeled;
(3) nothing new is persisted to `localStorage` — only `pilas.entries` is, as
today.

Product decisions taken while reviewing the prototype are folded in
(Requirements 3.7, 4.1, 4.6, 6.1, 6.4, 6.7, 9, 10): the app starts with no
challenge joined, friend notes can carry a gift, replies can be a small
character, the check-in has four emotions, time can be "Indefinido", "Hoy" has
a shortcut to "Descanso", and the group list shows challenge status instead of
time.

The design also records **two gaps between the current code and the
requirements** (see "Known gaps"); they are the only code changes this design
requires.

## Architecture

```
            ┌────────────────────── boot ──────────────────────┐
            ▼                                                   │
        home (0) ── PILAS icon ──► inicio (Hoy) ── "Volver al inicio" ──┐
   (minimal phone)                     │  ▲     └─ "Crear un foco" ─► descanso (2 min)
            │                          │  └── bottomNav: grupo · descanso · yo
   tap social app                      └── "Déjale algo a un amigo" ──► dejarmensaje ──► inicio
            │
   actions["open-app"]
            │ pauseBeforeOpen off ─────────────────────────────► entrando ─► feed
            │ descanso.active ─► sheet: interstitial(descanso) ─┐
            │ joined challenge ─► sheet: interstitial(reto) ────┤
            │                                                   ├─ "Seguir …" ─► home
            ▼                              "Entrar igual" ◄─────┘
     continueOpenApp()
        │ noteQueue ─► nota ─ "Responderle" ─► responder ─ Enviar/Volver
        ▼                 └──── "Entrar igual" ─┐                │
     afterNote() ◄────────────────────────────────┴───────────────┘
        ▼
     sheet: check-in "¿Cómo te sientes?" ── "Ahora no" ─► entrando ─► feed
        │ "Seguir"
        ▼
     alternativa (8) ─ "Igual quiero entrar" ─► entrando ─► feed
        │ alternative picked                        │
        ▼                                           ▼ X / time-up sheet / pasaste
   alternativa-hecha ─► home               sheet: "¿Cómo te sientes después?"
                                                    │ emotion / "Saltar"
                                                    ▼
                                      cierre (3 s, automatic) ─► home
```

Descanso runs beside this tree: `descanso` → `descanso-activo` →
(`descanso-fin` ─ "Listo" ─► `inicio`). "Ir al celular" from `descanso-activo`
goes to `home`; tapping a social app there enters the tree above at the
`descanso.active` branch.

## Components and interfaces

All components are functions inside the `app.js` IIFE or exports of `UI`
(`js/components/ui.js`). Names in backticks are the real identifiers.

### Simulated phone — `renderers.home` (Req 1, 2)

- **Responsibility:** boot screen and return point. Renders a background, the
  clock/date card and one icon per `D.apps` entry where
  `social && state.pausedApps[id]`, plus the PILAS icon. No decorative apps.
- **Interface:** icons are buttons with `data-action="open-app"` +
  `data-value=<app id>`, or `data-action="open-pilas"` for PILAS.
  `onEnter.home()` fills `#home-clock` / `#home-date`.
- **Must carry:** the code comment that production interception would be an
  Android Accessibility Service or iOS Screen Time (Family Controls)
  integration (Req 2.5). It exists today on `renderers.home` and in `data.js`;
  a smoke test guards it.
- **Depends on:** `D.apps`, `state.pausedApps`, `UI.pilasIcon`.

### Open-app decision — `actions["open-app"]` (Req 2, 3, 6.6)

- **Responsibility:** the only place that decides what happens when a social
  icon is tapped. Order is fixed: reset session → setting off → break →
  challenge → normal flow.
- **Interface:**

```ts
"open-app": (appId: string) => void
// 1. resetSession(); state.app = appId
// 2. !state.settings.pauseBeforeOpen            -> go("entrando")            (6.6)
// 3. state.descanso.active                      -> openInterstitial("descanso") (3.1, 3.3)
// 4. some id in state.joinedChallenges is true  -> openInterstitial("reto", c)  (3.2)
// 5. otherwise                                  -> continueOpenApp()
```

- **Depends on:** `openInterstitial`, `continueOpenApp`, `state.descanso`,
  `state.joinedChallenges`, `D.challenges`, `state.customChallenges`.
- **Initial state (3.7):** every `D.challenges[].selfDefault` is `false`, so a
  fresh or reset prototype has no challenge joined and step 4 never fires until
  Sami joins one from "Hoy" or "Grupo".

### Interstitial sheet — `openInterstitial(kind, challenge?)` (Req 3)

- **Responsibility:** render the break/challenge sheet into `#sheet-layer`.
  "Seguir..." is a filled `button` (primary); "Entrar igual" is `UI.textButton`
  (plain text, underlined, no fill/border/rounding, 44px touch area) — Req 3.1/3.2.
  The backdrop action equals the "keep" action, so tapping outside never enters
  the network by accident and never blocks either.
- **Interface:**

```ts
openInterstitial(kind: "descanso" | "reto", challenge?: Challenge): void
// "Seguir descansando" | "Seguir el reto" -> closeSheet(); go("home")          (3.4)
// "Entrar igual" -> closeSheet(); recordDescansoEnd(); continueOpenApp()        (3.5)
```

- **Depends on:** `showSheet`, `recordDescansoEnd`, `UI.button`.

### Friend note and reply — `renderers.nota`, `renderers.responder` (Req 4)

- **Buttons (4.7):** "Responderle" is a filled `button`; "Entrar igual" is
  `UI.textButton`, the same pattern as the interstitial.
- **Responsibility:** `nota` shows `state.currentNote` (shifted from
  `state.noteQueue` by `continueOpenApp`) plus its gift when `note.gift ===
  "flor"` (`UI.flower`) or `note.drawing` (4.6). `responder` shows the friend's
  message with `UI.personAvatar`, `D.friendReplies` as phrase chips and
  `D.replyDolls` as a 4-column grid of characters (`UI.character(face)` + label);
  "Enviar" is disabled while `state.replyChoice === null && !state.replyChar`
  (4.4).
- **Interface:** `note-reply` → `go("responder")`; `pick-reply(i)` sets
  `state.replyChoice` and `pick-reply-char(id)` sets `state.replyChar`, both
  calling `rerender()`; `continueOpenApp` resets both per note; `reply-send` sets `state.replySent = true` and returns to `nota`, which then shows what was sent and a single "Entrar a <app>" action (`continueOpenApp` resets `replySent`);
  `reply-back` → `go("nota")` (same `currentNote`); `note-enter` →
  `afterNote()` and never touches `responder` (4.5).
- **Depends on:** `UI.chip`, `UI.button`, `D.friendReplies`, `D.GROUP`.

### Check-in sheet — `openCheckin` / `renderCheckin` (Req 6)

- **Responsibility:** single question "¿Cómo te sientes?", one
  `emotionCard` for each of the four emotions in `D.emotions` (2 × 2 grid), "Seguir" disabled until `checkin.emotion` is set,
  "Ahora no" always enabled. No "¿A qué vas?" anywhere.
- **Interface:** `checkin-pick-emotion(id)`; `checkin-enter` →
  `state.emotionIn = …; goAlternativa()`; `checkin-skip` (also the backdrop
  action) → `go("entrando")` — entry is never blocked (6.5).
- **Depends on:** `UI.emotionCard`, `D.emotions`.

### Alternatives + time — `goAlternativa`, `renderers.alternativa` (Req 6.4)

- **Responsibility:** asks "¿Cuánto tiempo piensas usar la app?". Preselects
  the time from `mostRecentEntry()?.minutes` mapped through `timeIdForMinutes`
  (a `null` minutes maps to no id, so "Indefinido" is never preselected), else
  `"10"`. Shows at most 2 alternatives (`alternativesFor()`) as two square tiles in a
  2-column grid (`aspect-square`, `bg-white/60`, border `primary`),
  the chips from `D.times` (5 / 10 / 15 min and "Indefinido" with `minutes:
  null`) and "Igual quiero entrar" as `UI.textButton` below the tiles (same
  pattern as the interstitial).
- **Indefinido (6.7):** `state.minutes = null`, so `onEnter.feed` does not call
  `schedule(...)` and no time sheet ever opens; `renderers.entrando` already
  omits the minutes when `minutes` is null.

### Exit sheet and closing — `openExitSheet`, `closeExitSheetAndShowClosing`, `renderers.cierre` (Req 7)

- **Responsibility:** "¿Cómo te sientes después?" as a sheet over the feed;
  `checkout-pick` / `checkout-skip` both call `saveCurrentEntry()` then
  `go("cierre")`; `onEnter.cierre` schedules `go("home")` after 3000 ms with no
  button. `renderers.cierre` picks message, subtitle and background color from
  `state.emotionOut` (7.4) and, when `state.exceeded || realMinutes() >= 20`, shows
  a PILAS card (`UI.pilasIcon`) instead of the character (7.5).
- **Depends on:** `saveCurrentEntry` (guards double-save with `state.saved`).

### Descanso — `renderers.descanso*`, `recordDescansoEnd`, `endDescanso` (Req 5)

- **Responsibility:** start, run, end and record a break.
- **Interface:**

```ts
go-descanso            // preselects D.breakSuggestion.minutes; -> descanso | descanso-activo
descanso-pick-time(id) // state.descanso.timeId
descanso-start         // active=true, minutes, startedAt; -> descanso-activo
descanso-go-home       // -> home  ("Ir al celular")
descanso-end           // endDescanso()  ("Salir antes")
descanso-close         // -> inicio      ("Listo")
recordDescansoEnd(): void   // no-op if !active; pushes to descansoHistory, resets descanso
endDescanso(): void         // clearTimer(); recordDescansoEnd(); go("descanso-fin")
```

- **Auto end (5.5):** `onEnter["descanso-activo"]` recomputes remaining time
  from `startedAt` and schedules `endDescanso`; if none remains it ends
  immediately. See Known gap 1.
- **Depends on:** `D.breakTimes`, `D.breakSuggestion`, `D.breakStats`,
  `D.sampleBreaks`, `schedule`/`clearTimer`, `bottomNav`.

### "Hoy" shortcut — "Crea un foco" card (Req 9)

- **Responsibility:** a card in `renderers.inicio`, in the place "Tu última vez"
  used to occupy. That section, its `featured` markup and the list of the day's
  entries are removed from `renderers.inicio` (9.4); `saveCurrentEntry` still
  writes `pilas.entries`.
- **Interface:** `descanso-quick` → if `state.descanso.active`, `go("descanso-activo")`
  (9.3); otherwise `state.descanso.timeId = "2"; go("descanso")` (9.2). `"2"` is
  the first entry of `D.breakTimes`.
- **Depends on:** `D.breakTimes`, `state.descanso`.

### Group list, challenge state and avatars (Req 10)

- **Responsibility:** `groupRows(members)` renders one row per person: avatar,
  name and, for Sami only and only when `state.settings.shareTime`, a line "Hoy
  25 min · solo tú lo ves" (10.1, 10.3). `retoStatus(m)` returns `"cumplio" |
  "enCurso" | null`; `retoChip(status)` renders the flat chip ("Cumplió" with a
  check / "En curso") or nothing (10.2).
- **Challenge state:** `challengeButton(id, onLabel, offLabel, offVariant)` renders
  the "join" button when not joined; when joined it renders a flat chip with a
  check plus a discreet underlined text button "Salir del reto" that dispatches
  the same `toggle-challenge` action (10.4).
- **Avatars:** `UI.personAvatar(member, size)` draws a circle with `member.color`
  and the initial, text in `ink` (18px/700 when `member.bigText`). Every person
  has a distinct color (10.5). `UI.avatar(emotionId, size)` stays only for the
  emotion avatar on the alternatives screen.
- **Depends on:** `D.group`, `D.challenges[].friends/done`,
  `state.joinedChallenges`, `state.settings`.

### Bottom navigation — `bottomNav(active)` (Req 5.1)

Four destinations: Hoy (`go-inicio`), Grupo (`go-grupo`), Descanso
(`go-descanso`), Yo (`go-yo`). Only the current one is `active`, and it is easy to
spot: a low-opacity `primary` pill (`bg-primary/20`) behind its icon, a thicker
icon stroke and a bold label; the others stay `ink-soft`.

### Leave something to a friend — `renderers.dejarmensaje` (Req 8)

- **Responsibility:** friend chips (everyone except `self`), suggestion chips
  (`D.noteSuggestions`), a free-text `<input data-action="note-type">`;
  "Enviar mensaje" enabled iff a friend is picked and (custom text non-empty
  or a suggestion picked). The `input` listener updates `state.noteDraft.custom`
  and toggles the button without a full re-render (keeps focus/cursor).
- **Interface:** `open-note-composer` (from the card on `inicio`) resets the
  draft; `note-send` → confirmation + `go("inicio")`; `note-back` discards the
  draft → `go("inicio")` (8.5).
- **Privacy copy (8.6):** subtitle states the sender sees nothing of the
  recipient's usage; no read-receipt data exists in the model.

## Data models

```ts
// js/app.js — state additions/uses for this feature (all in-memory)
interface State {
  screen: string;                 // boots as "home"
  app: string | null;             // social app just tapped
  currentNote: FriendNote | null; // note being shown on `nota`
  replyChoice: number | null;     // index into D.friendReplies
  replyChar: string | null;       // id in D.replyDolls
  joinedChallenges: Record<string, boolean>;
  customChallenges: Challenge[];
  noteQueue: FriendNote[];        // notes Sami RECEIVES (shown before opening a network)
  noteDraft: { friendId: string | null; suggestion: number | null; custom: string };
  noteConfirmation: string | null; // friend name, shown on `inicio` after sending
  descanso: { active: boolean; startedAt: number | null; minutes: number | null; timeId: string | null };
  descansoHistory: { id: string; minutes: number; realMinutes: number; date: string }[];
  settings: { pauseBeforeOpen: boolean; shareTime: boolean };
  pausedApps: Record<string, boolean>;
  // Proposed by this design (Known gap 2):
  sentNotes: { id: string; to: string; message: string; date: string }[];
}

// js/data.js — content added for this feature
friendReplies: string[];                       // short reply phrases, req 4
replyDolls: { id: string; label: string; face: string }[]; // "Listo", "Lo pensaré"... face = emotion id for the drawing
friendNotes: { id: string; from: string; message: string; drawing?: boolean; gift?: "flor" }[];
times: { id: string; label: string; minutes: number | null }[]; // 5/10/15 + "Indefinido" (null)
group: { id: string; name: string; color: string; bigText?: boolean; self?: boolean; timeLabel?: string; weekLabel?: string }[];
challenges: { id: string; title: string; friends: string[]; done: string[]; selfDefault: boolean }[];  // selfDefault is false for all (3.7)
emotions: Emotion[];                           // exactly four: calma, alegria, ansiedad, aburrimiento
noteSuggestions: string[];                     // req 8
breakTimes: { id: string; label: string; minutes: number }[];   // 10 / 20 / 30
breakSuggestion: { minutes: number; note: string };             // req 5.2 (fixed default)
breakStats: { label: string; pct: number }[];                   // "Tus logros", simulated
sampleBreaks(): { id; minutes; realMinutes; date }[];
```

**Invariants**

- `descanso.active` ⇒ `startedAt` and `minutes` are non-null; all are reset
  together by `recordDescansoEnd`.
- `breakStats[].pct` ∈ [0, 100] (smoke-tested).
- `D.times` has exactly 3 timed entries and exactly 1 with `minutes === null`
  (smoke-tested); `D.emotions.length === 4`.
- Each `D.group[].color` is unique; only `self` carries `timeLabel`/`weekLabel`.
- `D.challenges[].done ⊆ friends`.
- No field stores a score, streak, level or penalty (Req 3.6, 5.6). Ending a
  break early only adds a history row with its real duration.
- `pilas.entries` (localStorage) keeps the existing entry shape; this feature
  does not change it.
- `resetAll()` restores `initialProfile()`, so every in-memory addition above
  must be initialized there.

## Data flow

**Scenario A — open a social app during a break, enter anyway (Req 1, 2, 3.1, 3.5, 6):**

1. App boots: `go("home")` renders the minimal phone (1.1, 2.1).
2. Sami taps Instagram → `open-app("fotogram")`; `descanso.active` is true →
   `openInterstitial("descanso")`.
3. Sami taps "Entrar igual" → sheet closes, `recordDescansoEnd()` writes the
   break to `descansoHistory` with its real duration and no penalty, then
   `continueOpenApp()`.
4. `noteQueue` is non-empty → `nota`; "Entrar igual" → `afterNote()` →
   check-in sheet.
5. Sami picks Calma, taps "Seguir" → `alternativa` with time preselected →
   "Igual quiero entrar" → `entrando` (1 s) → `feed`.
6. Sami taps X → exit sheet → picks an emotion → `saveCurrentEntry()` →
   `cierre` for 3 s → `home` (7.2, 1.3).

**Scenario B — start and end a break early (Req 5):**

1. Bottom nav "Descanso" → `descanso` with 20 min preselected from
   `breakSuggestion` (5.2).
2. "Empezar descanso" → `descanso.active = true` → `descanso-activo`;
   `onEnter` schedules `endDescanso` for the remaining time.
3. "Salir antes" → `endDescanso()` → history row + `descanso-fin` (5.4).
4. "Listo" → `inicio` (5.4).

**Scenario C — reply to a friend (Req 4):** `nota` → "Responderle" →
`responder` ("Enviar" disabled) → pick "¡Dale!" → "Enviar" → back to `nota` with
"Le respondiste a Vale: ¡Dale!" and one "Entrar a Instagram" action → `afterNote()` →
check-in sheet. "Volver" instead → `nota` with the same note and both actions.

**Scenario D — fresh start, no challenge (Req 3.7, 6.7, 9):** the prototype boots
with no challenge joined, so tapping Instagram goes straight to the friend note
(no interstitial) → check-in → alternatives, where Sami picks "Indefinido" →
`entrando` → `feed` with no time sheet. Later, on "Hoy", "Crear un foco" opens
"Descanso" with 2 min preselected.

## Error handling

| Condition | Handling | Related requirement |
|-----------|----------|---------------------|
| Break and relevant challenge both active | `open-app` tests `descanso.active` first and returns; only one sheet opens | 3.3 |
| Interstitial backdrop tapped | Backdrop action = "keep" action: returns to `home`, never enters the network and never traps the user | 3.4, rules "toda interrupción tiene salida" |
| "Entrar igual" chosen | Flow continues; no flag, score or streak is written | 3.5, 3.6 |
| No phrase and no reply character chosen | `Enviar` is `disabled`; `actions` ignore clicks on disabled buttons (`el.disabled` guard in the click listener) | 4.4 |
| "Indefinido" chosen | `state.minutes = null`; no timer is scheduled, so no time sheet opens | 6.7 |
| Last entry had no time | `timeIdForMinutes(null)` returns `null` → falls back to 10 min | 6.4 |
| "Crear un foco" with a break already active | Returns to `descanso-activo`, never starts a second break | 9.3 |
| Person in no challenge | `retoStatus` returns `null` → no chip | 10.2 |
| `nota` shown twice for one note | `continueOpenApp` does `noteQueue.shift()`, so a note is shown once | 4.3 (note stays only while looping `nota` ⇄ `responder`) |
| Break ends early | Real minutes recorded (min 1), no penalty copy, closing copy is neutral | 5.4, 5.6 |
| Break target reached while user is on `descanso-activo` | `schedule` → `endDescanso` → `descanso-fin` | 5.5 |
| Nothing selected on check-in | "Seguir" `disabled`; "Ahora no" always enabled | 6.3, 6.5 |
| `pauseBeforeOpen` off | `open-app` goes straight to `entrando`; no note, check-in or interstitial | 6.6 |
| User skips exit emotion | `checkout-skip` saves with `emotionOut = null` and closes automatically | 7.3 |
| Friend or message missing in composer | `note-send` button `disabled`; the `input` listener recomputes the same condition | 8.4 |
| Composer left with "Volver" | Draft reset, nothing recorded | 8.5 |
| `localStorage` unavailable | Existing `memoryFallback` in `loadEntries`/`saveEntries` | (existing behavior) |

## Known gaps between requirements and current code

These are the only code changes this design asks for. Everything else in this
document describes code that already exists.

1. **Break auto-end is cancelled by opening an app (Req 3.4, 5.5, 5.7).**
   `actions["open-app"]` calls `resetSession()`, which calls `clearTimer()`;
   the break's auto-end `setTimeout` shares that single `timer`. After
   "Ir al celular" → tap app → "Seguir descansando", the break no longer ends
   by itself until the user re-enters the Descanso tab (where `onEnter`
   reschedules). **Fix:** give the break its own timer (`descansoTimer`),
   cleared only by `recordDescansoEnd`, and have its callback call
   `endDescanso()` regardless of the current screen.
2. **A sent note is not queued (Req 8.3).** `note-send` stores only the
   friend's name in `state.noteConfirmation` and discards the message.
   **Fix:** push `{ id, to, message, date }` to `state.sentNotes` (message =
   chosen suggestion or trimmed custom text) before resetting the draft.
   `sentNotes` is separate from `noteQueue`, which holds notes Sami *receives*
   (there is no second user in the prototype to consume it). Initialize in
   `initialProfile()`.

Smaller alignments, no behavior change: Req 4.2's "record that the reply was
sent" is satisfied by `state.replySent` plus `replyChoice` / `replyChar`, shown back on `nota`; if the
group wants it visible later, it can go into `state` like `sentNotes`.

## Testing strategy

The project has no browser test runner; `node --test tools/smoke.test.js`
covers data/component rules, and the rest is declared per task as manual
checks (`MANUAL` in `task-verifier`), then replayed by `test-plan.md`.

- **Unit (`tools/smoke.test.js`, runs without a browser):**
  - Every `data-action` has a handler in `actions` (already there) — covers
    every new action in 3, 4, 5, 6, 8.
  - `D.breakStats` percentages in [0, 100]; `D.breakTimes` has positive minutes
    and contains `D.breakSuggestion.minutes` (5.2) and a 2-minute entry (9.2).
  - `D.times`: 3 timed entries plus one "Indefinido" with `minutes === null`
    (6.4, 6.7) — already in `tools/smoke.test.js`.
  - `D.emotions.length === 4` (6.1); every `D.group[].color` is unique (10.5);
    every `D.challenges[].selfDefault` is `false` (3.7); `done ⊆ friends`.
  - `D.replyDolls` faces exist in `D.emotions`; `D.friendNotes` includes one
    with `gift: "flor"` (4.1, 4.6).
  - `D.friendReplies` and `D.noteSuggestions` non-empty, no emojis, no
    uppercase labels (copy rules).
  - `D.apps` social entries + exactly one `isPilas` entry; none else (2.2).
  - Source check: `app.js` contains `Accessibility Service` and `Screen Time`
    near `renderers.home` (2.5).
  - Source check: boot line is `go("home")` (1.1).
  - Source check: in `openInterstitial` and `renderers.nota`, "Entrar igual" is
    rendered with `textButton` and the other action with a primary `button`;
    same for "Igual quiero entrar" in `renderers.alternativa`, whose two alternatives are tiles, not buttons (3.1, 3.2, 4.7, 6.4).
- **Edge cases (manual):**
  - Break + joined challenge → one sheet only (3.3).
  - Backdrop tap on each sheet does not block entry and has a visible
    alternative.
  - Break ends by itself after "Seguir descansando" (Known gap 1).
  - Type-only message, suggestion-only message, and friend without message in
    the composer (8.3, 8.4).
  - `pauseBeforeOpen` off skips note, check-in and interstitials (6.6).
  - Demo mode (`?demo=1`, triple tap) shortens break and feed timers.
  - "Indefinido": enter the feed and wait over one (demo) minute — no sheet opens.
  - Group list shows no friend minutes; joined challenge shows a flat chip and
    "Salir del reto" leaves it (10.1, 10.4).
  - Third app open shows the flower note; "Responderle" with only a character
    enables "Enviar" (4.4, 4.6).
  - `prefers-reduced-motion` and 44 px touch targets on the new screens.
- **Integration (manual, `test-plan.md`):** the happy path Scenario A end to
  end on a second computer; break early-exit (Scenario B); the "Entrar igual"
  unhappy path with a pending friend note (Scenario C).

## Design decisions and trade-offs

- **Decision:** One decision function (`actions["open-app"]`) owns precedence
  — **Rationale:** Req 3.3 and 6.6 are about ordering; one place makes them
  testable — **Alternative considered:** each interstitial checks for the
  other; rejected because it would duplicate the rule and risk two sheets in a
  row.
- **Decision:** Interstitials, check-in and exit emotion are sheets, not
  screens — **Rationale:** the Figma reference uses bottom sheets, and a sheet
  leaves the previous screen visible, which reads as "interruption with an
  exit" — **Alternative considered:** full screens; rejected, heavier and
  closer to a blocking wall.
- **Decision:** Backdrop tap on the interstitial means "keep the break/challenge"
  — **Rationale:** the safest non-blocking default that still returns the
  user to a neutral screen — **Alternative considered:** backdrop = "Entrar
  igual"; rejected, an accidental tap would count as giving up.
- **Decision:** "Entrar igual" during a break ends the break and records it
  with its real duration — **Rationale:** the user is no longer on a break;
  keeping it "active" would show the interstitial again on every app — 
  **Alternative considered:** leave the break running; rejected for that
  reason. No penalty either way (3.6, 5.6).
- **Decision:** Break length suggestion is a fixed default in `data.js`
  (`breakSuggestion`) — **Rationale:** matches how times/intents are modeled
  and needs no history maths — **Alternative considered:** derive it from
  `descansoHistory`; rejected as out of scope for the prototype.
- **Decision:** Four-tab bottom nav (Hoy · Grupo · Descanso · Yo) —
  **Rationale:** Descanso is a first-class destination in Figma frame 13 and
  the feature's entry point — **Alternative considered:** three tabs as in
  frames 14/14b; rejected because it leaves Descanso without an entry.
- **Decision:** The minimal phone is reachable from the boot, from "Volver al
  inicio" on `inicio`, and from `descanso-activo`; `?demo=1` / triple tap only
  speed up timers — **Rationale:** graders never need a special URL to see the
  interception demo — **Alternative considered:** demo flag also toggles the
  phone; rejected, it mixes two unrelated concerns.
- **Decision:** `sentNotes` is separate from `noteQueue` — **Rationale:**
  `noteQueue` means "notes I receive"; reusing it for sent notes would
  show Sami their own message on the next open — **Alternative considered:**
  a single shared queue; rejected for that reason.
- **Decision:** The prototype starts with no challenge joined — **Rationale:**
  the group wants the first run to show the normal flow and the empty state of
  the challenge card ("Unirme al reto"); the interstitial then appears only
  after Sami joins — **Alternative considered:** start joined to demo the
  interstitial immediately; rejected, it hid the default path.
- **Decision:** "Indefinido" is a time option with `minutes: null` — **Rationale:**
  reuses the same path as "Ahora no" (no time notice) while still answering
  the time question — **Alternative considered:** a separate "sin tiempo" flag;
  rejected, `null` already meant "no time".
- **Decision:** Four emotions (Tristeza removed from the selector) — **Rationale:**
  group decision after reviewing the check-in; the grid becomes 2 × 2 —
  **Alternative considered:** keep five; rejected. Vale keeps the purple as an
  avatar color, independent of emotions.
- **Decision:** Replies can be a phrase or a character ("Listo", "Lo pensaré",
  "Ahorita no puedo", "Te cuento luego"), not an emotion — **Rationale:** the
  reply answers the friend, it does not report how Sami feels — **Alternative
  considered:** reuse the emotion characters; rejected for that reason.
- **Decision:** The group list shows challenge status only; Sami's own time is
  private and optional — **Rationale:** the project rule is no comparison or
  ranking, and time between friends invites it — **Alternative considered:**
  keep today/week time for everyone; rejected.
- **Decision:** Avatars are color + initial, not emotion characters —
  **Rationale:** unique per person without inventing colors or expressions —
  **Alternative considered:** unique faces per person; rejected, it needs new
  artwork.
- **Decision:** On the decision screens (interstitial, `nota`) the option that
  keeps the user's intention is a dark filled button and "Entrar igual" is plain
  text — **Rationale:** the group wants the intentional choice to lead visually
  — **Trade-off:** this departs from the equal-weight rule of the first version
  of Req 3.1/3.2 and is closer to a nudge; the mitigation is that "Entrar igual"
  stays visible, in `ink`, with a 44px touch area, and is never disabled or
  delayed — **Alternative considered:** equal tonal buttons; replaced at the
  group's request.
- **Decision:** The two alternatives are soft square tiles and not filled buttons —
  **Rationale:** two dark buttons next to "Seguir" elsewhere read as two primary
  actions and confused the choice; tiles read as "pick one of these", with
  "Igual quiero entrar" as plain text below — **Alternative considered:** two
  filled primary buttons (previous version); replaced at the group's request.
- **Decision:** The closing message and color depend on the exit emotion, and a
  PILAS card replaces the character after a long stay — **Rationale:** the
  closing screen should not feel the same every time, and PILAS speaks
  without blaming — **Alternative considered:** one fixed message; rejected.
- **Decision:** Every action that goes to the simulated phone ("Volver al inicio" on
  "Hoy", "Ir al celular" on "Descanso activo", "Volver al celular" after an
  alternative) uses the `phone` button variant: yellow (`bg-emo-alegria`) with a
  phone icon — **Rationale:** people did not understand that these buttons return
  to the demo's start; a color of their own, different from the primary blue,
  makes them recognizable — **Alternative considered:** keep secondary/tonal
  styles; rejected because they looked like any other action.
