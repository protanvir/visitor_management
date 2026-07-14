---
name: project-kickoff
description: "Read all project planning markdown files (.md), understand project state and architecture, then start executing tasks from TASKS.md sequentially. Use when user says 'read md files and start tasks', 'check md files and start', or similar."
---

# Project Kickoff

Read project documentation, understand context, and begin executing tasks.

## When to use

- User says "read all .md files and start tasks"
- User says "check the project folders for .MD files and start"
- User says "Read CLAUDE.md and TASKS.md, then start Phase X"
- Any variant asking to read planning docs and begin work

## Procedure

### Phase 1 — Discover planning docs

1. Glob for all `*.md` files in the project root and immediate subdirectories.
2. Read the following files first (in this order when they exist):
   - `TASKS.md` — the task list with phases and checkboxes
   - `CLAUDE.md` — project context for AI agents
   - `ARCHITECTURE.md` — system design and structure
   - `DESIGN_SYSTEM.md` — UI/UX conventions
   - `README.md` — general project info
   - Any other `.md` files in the root
3. If no `.md` files exist, tell the user and ask what to do.

### Phase 2 — Understand project state

After reading all docs:

1. Identify the **current phase** — find the first unchecked task in TASKS.md.
2. Identify **completed phases** — all tasks marked `[x]` are done.
3. Check if prerequisites are met — some phases need accounts/credentials before code work.
4. Summarize what you found: project name, stack, current phase, what's next.

### Phase 3 — Check project state

Before writing any code:

1. Check if the project directory has existing code (package.json, src/, etc.).
2. If empty/not scaffolded, scaffold first (Next.js, etc.) per the architecture docs.
3. If already scaffolded, verify it builds and runs.

### Phase 4 — Execute tasks

1. Work through tasks **sequentially within each phase** — never skip.
2. Mark `[x]` in TASKS.md when a task is complete.
3. If blocked, mark `[BLOCKED]` with a note explaining why.
4. Run build/type-check after each significant change.
5. Continue until the phase is complete or you hit a blocker.

### Stopping conditions

- All tasks in the current phase are marked `[x]`.
- You hit a blocker that requires manual action (credentials, external service setup).
- User interrupts.
- You reach a natural stopping point between phases.
