---
name: codebase-audit
description: "Systematically audit a codebase for bugs, security issues, performance problems, and code quality. Read all source files, identify issues by severity, fix them, and verify. Use when user says 'audit my codebase', 'find issues and fixes', or similar."
---

# Codebase Audit

Systematic code review with severity-based findings and automated fixes.

## When to use

- User says "audit my codebase and find potential issues and fixes"
- User says "check for bugs and security issues"
- User says "review this code and fix problems"
- Any variant asking for systematic code review

## Procedure

### Phase 1 — Explore structure

1. List the project directory tree to understand the codebase layout.
2. Identify the tech stack (language, framework, build system).
3. Count source files and categorize them (components, utils, services, configs).
4. Note any existing tests.

### Phase 2 — Read all source files

1. Read **every** source file — no skipping. For large files, read in chunks.
2. Read configuration files (package.json, tsconfig, .env.example, etc.).
3. Read database schemas/migrations if they exist.
4. Read API route handlers.

### Phase 3 — Identify issues

For each file, check for:

**Critical (data correctness, security)**
- Wrong timestamps, data corruption, race conditions
- SQL injection, XSS, auth bypass
- Hardcoded secrets, exposed credentials
- Missing input validation

**High (reliability, performance)**
- Unhandled errors, missing try/catch
- Memory leaks, N+1 queries
- Missing indexes, full table scans
- Incorrect API contracts

**Medium (code quality, maintainability)**
- Dead code, unused imports
- Duplicate logic
- Missing types, `any` types
- Inconsistent patterns

**Low (style, minor improvements)**
- Missing error messages
- Inconsistent naming
- Missing comments for complex logic

### Phase 4 — Fix issues

1. Fix issues starting from Critical → High → Medium.
2. For each fix, explain what was wrong and what the fix does.
3. Group related fixes together when possible.

### Phase 5 — Verify

1. Run the build/compile command.
2. Run type-checking if available (`tsc --noEmit`, etc.).
3. Run tests if they exist.
4. Confirm all fixes compile and no regressions.

### Output format

Present findings as:

```
## Critical
1. **[filename:line]** — Issue description
   Fix: What was changed

## High
...

## Medium
...

## Low
...
```

### Stopping conditions

- All source files have been read.
- All identified issues have been fixed or documented.
- Build/type-check passes.
- User interrupts.
