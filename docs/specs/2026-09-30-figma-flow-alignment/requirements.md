# Requirements — Figma flow alignment

**Status:** Draft
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
section), and brings three existing screens (quick check-in, exit emotion,
leaving a friend a note) in line with how the Figma reference builds them.

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
     the message that a break is in progress and two equally-weighted
     actions: "Seguir descansando" and "Entrar igual".
3.2. WHEN the user taps a social app icon WHILE the user has joined an
     active "Reto" that concerns not using social apps (`state.joinedChallenges`)
     THE SYSTEM SHALL show a bottom sheet with the challenge's title and two
     equally-weighted actions: "Seguir el reto" and "Entrar igual".
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

### Requirement 4 — Responder al amigo

**User story:** As Sami, I want to send a quick reply to a friend's note
before I go on, so that I can acknowledge them without it turning into a
full conversation that delays or blocks me from entering.

**Acceptance criteria:**

4.1. WHEN the user taps "Responderle" on the `nota` screen THE SYSTEM
     SHALL show a screen with a `ChipGroup` of quick-reply options and two
     actions: "Enviar" and "Volver".
4.2. WHEN the user selects a reply and taps "Enviar" THE SYSTEM SHALL
     record that the reply was sent and continue into the check-in flow
     (same destination `nota`'s "Entrar igual" goes to today).
4.3. WHEN the user taps "Volver" THE SYSTEM SHALL return to the `nota`
     screen with the same note still shown.
4.4. IF no reply option is selected THEN THE SYSTEM SHALL keep "Enviar"
     disabled.
4.5. THE SYSTEM SHALL NOT require a reply to proceed — "Entrar igual" on
     the `nota` screen keeps working exactly as it does today, bypassing
     this screen entirely.

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
     an emotion selector, a primary "Seguir" action and an "Ahora no" action.
6.2. THE SYSTEM SHALL NOT ask what the user is going to do ("¿A qué vas?").
6.3. THE SYSTEM SHALL keep "Seguir" disabled until an emotion is picked.
6.4. WHEN the user taps "Seguir" THE SYSTEM SHALL show "¿Y si pruebas otra
     cosa primero?" with at most 2 alternatives, the only time question
     ("¿Cuánto tiempo?": 5, 10 or 15 min, preselected from the last entry or
     10 min) and an "Igual quiero entrar" action weighted like the alternatives.
6.5. WHEN the user taps "Ahora no" THE SYSTEM SHALL go straight into the
     social app; entry is never blocked.
6.6. WHERE the setting "Pausa antes de abrir redes" is off THE SYSTEM SHALL
     open the social app directly, without note, check-in or interstitials.

### Requirement 7 — "¿Cómo te sientes después?" as a bottom sheet with automatic close

**User story:** As Sami, I want naming how I feel after to be a quick,
colorful check, so that leaving stays as easy as the rest of the flow.

**Acceptance criteria:**

7.1. WHEN the exit flow is triggered (feed's X, the time-up sheet's "Salir",
     or "Te pasaste"'s "Salir") THE SYSTEM SHALL show "¿Cómo te sientes
     después?" as a bottom sheet over the feed, with one colored card per
     emotion and a visible "Saltar".
7.2. WHEN the user picks an emotion THE SYSTEM SHALL save the entry, show the
     closing message for 1.5 seconds, and then return to the simulated phone
     home without a manual tap.
7.3. WHEN the user taps "Saltar" THE SYSTEM SHALL save the entry without an
     exit emotion and follow the same automatic close.
7.4. THE SYSTEM SHALL show "Es tu decisión, sigue así." with a short
     motivational line when the user stayed within the chosen time, and "Listo.
     Mañana es otro día." when they went over (`state.exceeded`).

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

- The Figma reference is inconsistent about the bottom navigation: `docs/figma/13-inicio-reto-grupo.png`
  shows 4 tabs (Hoy · Grupo · Descanso · Yo), while `docs/figma/14-grupo.png` and
  `docs/figma/14b-grupo-retos-activos.png` show only 3 (Hoy · Grupo · Yo). This
  spec assumes the 4-tab version (Requirement 5.1) since it directly supports
  the new Descanso feature — confirm this is correct before design.
- What is the suggested break length and its data source (a fixed default in
  `data.js`, or derived from the user's history)? Requirement 5.2 assumes it
  comes from `data.js`, matching how times/intents are already modeled.
- Should the minimal simulated phone (Requirement 2) still be reachable via
  `index.html?demo=1` / triple-tap for automated grading, or only via the
  "Probar con una red" button on "Hoy"?
