# Requirements — Figma flow alignment

**Status:** Approved
**Date:** 2026-09-30
**Author:** Grupo 7

## Introduction

The current prototype simulates the whole phone home screen (`renderers.home`)
as its default, always-open entry point. The reference Figma prototype
(`docs/figma/`) instead treats PILAS as a real, installable app whose entry
point is its own "Hoy" screen — the phone-home mockup only exists to
demonstrate, for grading purposes, what would be an OS-level interception
(an Android Accessibility Service or iOS Screen Time hook) that HTML/CSS/JS
cannot perform for real.

This feature realigns the prototype's flow with the Figma reference and with
that real-app framing: it shrinks the simulated phone to a minimal demo
reachable from "Hoy", adds the flows the Figma reference has that the code
is missing (friend reply, break/challenge interstitials, the full "Descanso"
section), and brings existing screens (quick check-in, exit emotion, leaving a
friend a note, the group list) in line with how the Figma reference builds
them. It also records product decisions the group took while reviewing the
prototype: the app starts with no challenge joined, friend notes can carry a
gift, replies can be a small character, the check-in uses four emotions, time
can be "Indefinido", and "Hoy" offers a shortcut to "Descanso".

## Glossary

- **Home simulado** — the mocked phone home screen (`renderers.home`) used to
  demonstrate opening a social app.
- **Descanso** — a timed "time away from social apps" session the user
  starts on purpose (distinct from the reflection flow triggered by opening
  a social app).
- **Reto** — a group challenge (already modeled in `data.js` as
  `challenges`) that one or more friends and/or the user have joined.
- **Bottom sheet** — the existing `#sheet-layer` overlay mechanism
  (`openSheet`/`closeSheet` in `js/app.js`), not a full-screen `.screen`.

## Requirements

### Requirement 1 — The simulated phone is the prototype's entry point

**User story:** As someone grading or demoing the prototype, I want PILAS to
open on the simulated phone home, so that every session starts where a real
user would: choosing an app to open.

**Acceptance criteria:**

1.1. WHEN the prototype is opened (page load, no unfinished session in progress)
     THE SYSTEM SHALL render the simulated phone home screen first.
1.2. WHEN the user taps the PILAS icon on the simulated phone THE SYSTEM SHALL
     show "Hoy".
1.3. WHEN a session launched from Instagram or TikTok ends (the closing message
     screen finishes) THE SYSTEM SHALL return to the simulated phone home.
1.4. WHEN a break or challenge interstitial is answered with "Seguir
     descansando" / "Seguir el reto" THE SYSTEM SHALL return to the simulated
     phone home.
1.5. THE SYSTEM SHALL keep "Volver al inicio" on "Hoy" as a way back to the
     simulated phone.

### Requirement 2 — Minimal simulated interception demo

**User story:** As someone grading or demoing the prototype, I want a
clearly-labeled, minimal simulation of "opening a social app", so that I can
see the interception flow (checking in before entering a social network)
without the prototype pretending to be a whole phone.

**Acceptance criteria:**

2.1. WHEN the prototype opens, or the user activates "Volver al inicio" from
     "Hoy", THE SYSTEM
     SHALL show a minimal simulated phone screen containing only: a
     background, a clock, and icons for the apps with pause enabled
     (`state.pausedApps`) plus the PILAS icon.
2.2. THE SYSTEM SHALL NOT show decorative/invented apps that are not
     social apps with pause enabled or the PILAS icon on this screen.
2.3. WHEN the user taps a social app icon on this screen THE SYSTEM SHALL
     start the existing check-in flow exactly as it does today (friend
     note queue, then check-in, breaks/challenge interstitials per
     Requirement 3, etc.).
2.4. WHEN the user taps the PILAS icon on this screen THE SYSTEM SHALL
     return to "Hoy".
2.5. THE SYSTEM SHALL document, in a code comment on this screen, that in
     a production build this interception would be implemented as an
     Android Accessibility Service or iOS Screen Time (Family Controls)
     integration, not as a web page.

### Requirement 3 — Break and challenge interstitials before entering a social app

**User story:** As Sami, I want PILAS to remind me — without blocking me —
that I'm on a break or in a challenge when I try to open a social app, so
that I can make an informed choice without being punished for it.

**Acceptance criteria:**

3.1. WHEN the user taps a social app icon WHILE a "Descanso" session
     (Requirement 5) is active THE SYSTEM SHALL show a bottom sheet with
     the message that a break is in progress, a prominent filled action
     "Seguir descansando" and a plain-text "Entrar igual" (no fill, border or
     rounding) that stays visible with a touch area of at least 44px.
3.2. WHEN the user taps a social app icon WHILE the user has joined an
     active "Reto" that concerns not using social apps (`state.joinedChallenges`)
     THE SYSTEM SHALL show a bottom sheet with the challenge's title, a prominent
     filled action "Seguir el reto" and the same plain-text "Entrar igual".
3.3. IF both a break is active AND the user is in a relevant challenge
     THEN THE SYSTEM SHALL show only one bottom sheet (break takes
     precedence), so the user is never blocked or shown two interstitials
     in a row.
3.4. WHEN "Seguir descansando" or "Seguir el reto" is chosen THE SYSTEM
     SHALL return the user to the simulated phone home without opening the
     social app.
3.5. WHEN "Entrar igual" is chosen THE SYSTEM SHALL continue the normal
     check-in flow exactly as if no break/challenge were active.
3.6. THE SYSTEM SHALL NOT record any judgment, penalty, or streak break
     when the user chooses "Entrar igual".
3.7. WHEN the prototype starts (or is reset with "Reiniciar prototipo") THE
     SYSTEM SHALL have no challenge joined by the user, so no challenge
     interstitial appears until the user joins one.

### Requirement 4 — Responder al amigo

**User story:** As Sami, I want to send a quick reply to a friend's note
before I go on, so that I can acknowledge them without it turning into a
full conversation that delays or blocks me from entering.

**Acceptance criteria:**

4.1. WHEN the user taps "Responderle" on the `nota` screen THE SYSTEM
     SHALL show a screen with the friend's note and avatar, a `ChipGroup` of
     short quick-reply phrases, a row of reply characters ("Listo", "Lo
     pensaré", "Ahorita no puedo", "Te cuento luego", each a character with a
     face) and two actions: "Enviar" and "Volver".
4.2. WHEN the user selects a reply and taps "Enviar" THE SYSTEM SHALL
     record that the reply was sent and return to the `nota` screen of the
     same note, now showing a confirmation of what was sent and a single
     primary action "Entrar a <app>"; the check-in only starts when the user
     activates that action.
4.3. WHEN the user taps "Volver" THE SYSTEM SHALL return to the `nota`
     screen with the same note still shown.
4.4. IF neither a phrase nor a reply character is selected THEN THE SYSTEM
     SHALL keep "Enviar" disabled; selecting either, or both, SHALL enable it.
4.5. THE SYSTEM SHALL NOT require a reply to proceed — "Entrar igual" on
     the `nota` screen keeps working exactly as it does today, bypassing
     this screen entirely.
4.6. WHERE a friend note carries a gift (a drawing or a flower) THE SYSTEM
     SHALL show the gift on the `nota` screen with the friend's name, in
     addition to the message (e.g. "Te mandé esta flor para que te
     concentres.").
4.7. THE SYSTEM SHALL show the `nota` screen's "Responderle" as a prominent
     filled action and "Entrar igual" as plain text (no fill, border or
     rounding), still visible and with a touch area of at least 44px.

### Requirement 5 — Descanso (time-away session)

**User story:** As Sami, I want to start a break from social apps on my
own terms, with a suggested length and a history of my past breaks, so
that I can build a rhythm without being punished if I stop early.

**Acceptance criteria:**

5.1. THE SYSTEM SHALL add "Descanso" as a fourth destination in the bottom
     navigation (alongside Hoy, Grupo, Yo).
5.2. WHEN the user opens the "Descanso" screen THE SYSTEM SHALL show a
     suggested break length (from `data.js`), a way to pick a different
     length from chips, a primary action to start the break, and a list
     of simulated stats ("Tus logros") with progress bars and percentages.
5.3. WHEN the user starts a break THE SYSTEM SHALL go to a "Descanso
     activo" screen showing the elapsed/target time framing with two
     actions: "Ir al celular" (opens the minimal simulated phone from
     Requirement 2) and "Salir antes".
5.4. WHEN the user taps "Salir antes" THE SYSTEM SHALL end the break
     immediately, record it in the break history with its real duration,
     and show a "Descanso fin" screen with a single "Listo" action.
5.5. WHEN a break reaches its target length THE SYSTEM SHALL show the same
     "Descanso fin" screen automatically.
5.6. IF the user ends a break early THEN THE SYSTEM SHALL NOT reduce any
     score, break a streak, or show any penalty — this feature has no
     scoring concept, consistent with the project's non-negotiable rules.
5.7. WHILE a break is active THE SYSTEM SHALL treat the break as "active"
     for the purposes of Requirement 3.1.

### Requirement 6 — One-question check-in

**User story:** As Sami, I want opening a social app to ask me one simple
question, so that pausing before I enter never feels like a form.

**Acceptance criteria:**

6.1. WHEN the user opens a social app (after the friend note, if any) THE
     SYSTEM SHALL show a single bottom sheet titled "¿Cómo te sientes?" with
     an emotion selector of exactly four emotions (Calma, Alegría, Ansiedad,
     Aburrimiento), a primary "Seguir" action and an "Ahora no" action.
6.2. THE SYSTEM SHALL NOT ask what the user is going to do ("¿A qué vas?").
6.3. THE SYSTEM SHALL keep "Seguir" disabled until an emotion is picked.
6.4. WHEN the user taps "Seguir" THE SYSTEM SHALL show "¿Y si pruebas otra
     cosa primero?" with at most 2 alternatives, the only time question
     ("¿Cuánto tiempo piensas usar la app?": 5, 10 or 15 min, or "Indefinido",
     preselected from the last timed entry or 10 min), the two alternatives as
     two square tiles side by side with a soft fill (not a primary button) and,
     below them, "Igual quiero entrar" as plain text (no fill, border or
     rounding), still visible with a touch area of at least 44px.
6.5. WHEN the user taps "Ahora no" THE SYSTEM SHALL go straight into the
     social app; entry is never blocked.
6.6. WHERE the setting "Pausa antes de abrir redes" is off THE SYSTEM SHALL
     open the social app directly, without note, check-in or interstitials.
6.7. WHEN the user chooses "Indefinido" THE SYSTEM SHALL enter the social app
     without any time notice; the user leaves with the feed's X.

### Requirement 7 — "¿Cómo te sientes después?" as a bottom sheet with automatic close

**User story:** As Sami, I want naming how I feel after to be a quick,
colorful check, so that leaving stays as easy as the rest of the flow.

**Acceptance criteria:**

7.1. WHEN the exit flow is triggered (feed's X, the time-up sheet's "Salir",
     or "Te pasaste"'s "Salir") THE SYSTEM SHALL show "¿Cómo te sientes
     después?" as a bottom sheet over the feed, with one colored card for
     each of the four emotions and a visible "Saltar".
7.2. WHEN the user picks an emotion THE SYSTEM SHALL save the entry, show the
     closing message for 3 seconds, and then return to the simulated phone
     home without a manual tap.
7.3. WHEN the user taps "Saltar" THE SYSTEM SHALL save the entry without an
     exit emotion and follow the same automatic close.
7.4. THE SYSTEM SHALL show a closing message and a background color that depend
     on the emotion chosen on exit: for Calma and Alegría "Cuando te pones las
     pilas, tienes el control."; for Ansiedad and Aburrimiento "Tranqui, tú
     tienes el control." with "Busca algo que te anime."; when the exit emotion
     was skipped, "Es tu decisión, sigue así.". The background is that emotion's
     color.
7.5. WHEN the user went over the chosen time (`state.exceeded`) or stayed 20
     minutes or more THE SYSTEM SHALL show, instead of the character, a PILAS
     card with the PILAS icon and "PILAS: llevas un buen rato en redes. Un
     descanso te puede caer bien.", without judgment, penalty or a countdown.

### Requirement 8 — Real "Dejarle algo a un amigo" composer, entered from "Hoy"

**User story:** As Sami, I want to actually pick a friend and write or
choose a message for them from my "Hoy" screen, so that leaving them
something feels like a real, private gesture instead of a button that just
says "sent".

**Acceptance criteria:**

8.1. THE SYSTEM SHALL show a "Déjale algo a un amigo" card on the "Hoy"
     screen (moved from its current location on "Grupo").
8.2. WHEN the user activates that card THE SYSTEM SHALL show a screen with
     a `ChipGroup` to pick one friend, a `ChipGroup` of suggested messages,
     and a text `Input` with helper text for a custom message.
8.3. WHEN the user has picked a friend and either a suggested message or
     typed custom text, THE SYSTEM SHALL enable "Enviar mensaje"; tapping it
     SHALL queue the note for that friend (added to `state.noteQueue`-style
     data) and return to "Hoy" showing a "Mensaje enviado" confirmation.
8.4. IF no friend is picked, or no message is chosen/typed, THEN THE SYSTEM
     SHALL keep "Enviar mensaje" disabled.
8.5. WHEN the user taps "Volver" without sending THE SYSTEM SHALL discard
     the draft and return to "Hoy" without recording anything.
8.6. THE SYSTEM SHALL NOT let the sender see whether, when, or how the
     recipient later opens a social app — consistent with the existing
     `nota` screen's privacy promise.

### Requirement 9 — "Hoy" offers a shortcut to "Descanso"

**User story:** As Sami, I want a clear way to start a short break from "Hoy"
when I feel bored or stressed, so that an alternative to a social app is one
tap away.

**Acceptance criteria:**

9.1. THE SYSTEM SHALL show a "Crea un foco" card on "Hoy" with the text
     "¿Aburrido/a o estresado/a? Prueba esto en 2 min." and a "Crear un foco"
     action, in the place where "Tu última vez" used to be.
9.2. WHEN the user activates "Crear un foco" WHILE no break is active THE SYSTEM
     SHALL show "Descanso" with the 2-minute length preselected.
9.3. WHEN the user activates "Crear un foco" WHILE a break is active THE SYSTEM
     SHALL return to "Descanso activo" instead of starting another break.
9.4. THE SYSTEM SHALL NOT show the "Tu última vez" section nor the list of the
     day's entries ("Hoy", with how the user arrived at each network) on "Hoy".
     Entries are still saved in `pilas.entries`.

### Requirement 10 — Group list shows challenge status, not time

**User story:** As Sami, I want to see who is in a challenge or finished it,
without seeing how long anyone used their phone, so that the group motivates
instead of compares.

**Acceptance criteria:**

10.1. THE SYSTEM SHALL NOT show any friend's usage time (today or week) in
      "Tu grupo", on "Hoy" or on "Grupo".
10.2. THE SYSTEM SHALL show, for each person in a challenge, a flat status chip:
      "Cumplió" with a check when they finished it, or "En curso" otherwise;
      a person in no challenge SHALL show no chip.
10.3. WHERE the setting "shareTime" is on THE SYSTEM SHALL show Sami's own time
      only on Sami's row, marked as visible only to Sami.
10.4. WHEN the user has joined a challenge THE SYSTEM SHALL show its state as a
      flat chip with a check ("Estás en el reto"), not a filled button, plus a
      discreet text action "Salir del reto" that leaves the challenge.
10.5. THE SYSTEM SHALL show every person with an avatar of their own color and
      their initial, so that two people never share the same avatar.

## Out of scope

- Onboarding screens (per `docs/spec.md` §1, already out of scope for the
  vertical prototype).
- Real OS-level app-launch interception (Android Accessibility Service /
  iOS Screen Time). Requirement 2 only documents this as a future-work note.
- A friend-facing inbox/notification system for replies (Requirement 4 is a
  one-shot reply, not a conversation thread).
- Changing how challenges are created or joined outside of the interstitial
  in Requirement 3.
- AvatarPicker (changing the character) on the "Yo" screen — already marked
  "próximamente" in the current code and untouched by this feature.

## Open questions

Resolved in `design.md` (see "Design decisions and trade-offs"):

- **Bottom navigation:** 4 tabs (Hoy · Grupo · Descanso · Yo). The Figma frames
  14/14b that show 3 tabs are treated as outdated.
- **Suggested break length:** a fixed default in `data.js` (`breakSuggestion`),
  not derived from history.
- **Demo access:** the minimal phone is the boot screen, so no special URL is
  needed. `?demo=1` / triple tap only speed up timers (1 min = 5 s).
