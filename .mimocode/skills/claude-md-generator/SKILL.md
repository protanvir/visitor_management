---
name: claude-md-generator
description: "Analyze a codebase and create or improve a CLAUDE.md file that gives future AI agent instances the context they need. Use when user says 'create CLAUDE.md', 'analyze codebase for CLAUDE.md', or similar."
---

# CLAUDE.md Generator

Create comprehensive project documentation for AI agent instances.

## When to use

- User says "analyze this codebase and create a CLAUDE.md file"
- User says "generate project docs for AI"
- User says "create a CLAUDE.md for this project"
- Any variant asking to document a project for AI assistants

## Procedure

### Phase 1 — Explore codebase

1. List the full directory tree.
2. Identify the tech stack (language, framework, database, hosting).
3. Find entry points (main files, index files, app routers).
4. Check for existing documentation (.md files, docs/ folder).

### Phase 2 — Read existing docs

1. Read any existing `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`.
2. Read configuration files: `package.json`, `tsconfig.json`, `next.config.*`, `.env.example`.
3. Read database schemas, migrations, or ORM configs (Prisma, Drizzle, etc.).
4. Read CI/CD configs if they exist.

### Phase 3 — Analyze project structure

Document the following:

1. **Project name and description** — what it does, who it's for
2. **Tech stack** — language, framework, database, hosting, key libraries
3. **Directory structure** — what each top-level directory contains
4. **Commands** — how to install, dev, build, test, lint
5. **Architecture** — key patterns (API routes, components, services, etc.)
6. **Environment variables** — required, optional, where to get them
7. **Database** — schema overview, key tables, relationships
8. **Conventions** — naming, file structure, coding patterns used
9. **Gotchas** — known issues, quirks, things that aren't obvious

### Phase 4 — Write CLAUDE.md

Structure the file as:

```markdown
# CLAUDE.md — [Project Name]

> **Project:** [name] — [one-line description]
> **Domain:** [domain]
> **Stack:** [tech stack]
> **Workspace Version:** [version]

## Commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Type-check: `npx tsc --noEmit`
- Lint: `npm run lint`

## Architecture
[Key patterns, directory structure, data flow]

## Environment
[Required env vars and where to set them]

## Conventions
[Naming, file structure, coding patterns]

## Gotchas
[Known issues, quirks, important notes]
```

### Phase 5 — Validate

1. Verify all referenced files exist using Glob.
2. Verify all referenced commands work using Bash (dry-run).
3. Check that the CLAUDE.md is accurate and complete.

### Stopping conditions

- CLAUDE.md has been written with all required sections.
- All referenced paths and commands have been verified.
- User interrupts.
