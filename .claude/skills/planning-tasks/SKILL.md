---
name: planning-tasks
description: >-
  Produces or converges a feature spec's tasks.md (Phase 3 of the spec
  workflow) by launching the `converge-tasks` dynamic workflow: it ensures the
  spec has an approved requirements.md and design.md, then hands the spec folder
  to the workflow, which fans out read-only planners over every task and writes
  the final tasks.md once. Use this WHENEVER the user wants to create, re-plan,
  iterate, converge, or audit the task list of a spec — phrases like "plan the
  tasks", "iterate tasks.md", "planear las tareas", "itera el tasks.md", "audita
  las tareas", "replan after the spec change", or right after design.md is
  approved and before TDD execution starts. Trigger even if the user doesn't
  mention tasks.md by name, as long as they want the implementation plan of a
  spec produced or validated.
---

# Planning tasks — launch the converge-tasks workflow

This skill is Phase 3 of the spec workflow
(`/brainstorming` → `/specify` → `/planning-tasks` → TDD execution). All the
actual planning — router, bootstrap, one read-only `planner` per task in
parallel, reducer, single write — lives in the **`converge-tasks` workflow**
(`.claude/workflows/converge-tasks.js`). This skill does not draft, evaluate,
or edit `tasks.md` itself; it only guarantees the workflow has what it needs,
launches it, and relays what comes back.

## 1 — Ensure the input

The workflow needs a spec folder `docs/specs/<YYYY-MM-DD>-<feature>/` with an
**approved** `requirements.md` and `design.md`:

- Resolve the folder: the one the user named, the only one under
  `docs/specs/`, or ask if it's ambiguous.
- If either file is missing or unapproved, **stop** and point the user to
  `/specify` — do not launch the workflow.
- Don't inspect `tasks.md` yourself; the workflow's router decides whether to
  bootstrap or iterate.

## 2 — Launch and relay

```
Workflow({ name: "converge-tasks", args: { specFolder: "docs/specs/<date>-<feature>/" } })
```

The workflow runs in the background and returns a structured result (mode,
rounds, converged, tasks, `userDecisions`, `remainingGaps`, `report`) that is
**not** shown to the user automatically — relay it in their language:

- What happened (bootstrap vs. iterate, rounds, final task count) and anything
  notable from `report`/`changes`.
- Any `userDecisions` / `remainingGaps`: the workflow can't pause mid-run, so
  present these as open questions with your recommendation, and re-launch once
  the user answers.
- If `blocked`, relay why and route to `/specify`.
- State that `tasks.md` is written and needs the user's approval before TDD
  execution starts.

## Guardrail

Never edit `tasks.md`, `requirements.md`, or `design.md` yourself — the
workflow is the sole author of `tasks.md`, and spec gaps belong to `/specify`.
