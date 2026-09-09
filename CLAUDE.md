# Oasis Task Manager — working agreement

Read `SPEC.md` before writing any code. It is the source of truth for
architecture, the API contract, the data model, and the design tokens.
If something here conflicts with SPEC.md, SPEC.md wins on technical
detail and this file wins on process.

This is a timed 4-hour technical assessment. Speed matters, but a
working, honestly-documented subset beats a broken whole.

---

## Git protocol

Commit and push after each milestone below. Do not batch multiple
milestones into a single commit — the commit history is part of what's
being reviewed.

After finishing a milestone:

1. Run `git status` and `git diff` and review what actually changed
2. Stage only the files belonging to that milestone
3. Commit with a Conventional Commits message (`feat:`, `fix:`,
   `chore:`, `docs:`, `refactor:`)
4. Push to `origin` immediately
5. Tick the milestone checkbox in this file
6. State which milestone is done and what's next

### Verification before committing

Do not mark a milestone complete because the code compiles.

- **Backend milestone** — hit the endpoint with `curl` and paste the
  actual response before committing. Include at least one failure case
  (bad token, missing required field).
- **Frontend milestone** — confirm the Vite dev server compiles with no
  console errors and the screen renders.

### Never

- Commit `.env`, `node_modules/`, `dev.db`, `dev.db-journal`, or
  `prisma/generated/`
- Commit real secrets — `.env.example` gets placeholder values only
- Use `git push --force`
- Rewrite history with `git rebase` or amend an already-pushed commit
- Create branches — work on `main`, this is a solo 4-hour build

---

## Milestones

Target times are cumulative from the start.

- [x] **M1** `chore:` scaffold server + client, Tailwind v4, .gitignore,
      env examples — *by 0:25*
- [x] **M2** `feat:` Prisma schema, migration, seeder with one test user
      and sample tasks — *by 0:40*
- [x] **M3** `feat:` login endpoint, JWT signing, authenticate
      middleware, error handler — *by 1:05*
- [x] **M4** `feat:` task CRUD with user scoping and Zod validation
      — *by 1:55*
- [x] **M5** `feat:` API client, AuthContext, ProtectedRoute, login page
      — *by 2:25*
- [ ] **M6** `feat:` task list, cards, status badges, create/edit modal
      — *by 3:15*
- [ ] **M7** `feat:` loading skeletons, error alerts, empty state
      — *by 3:25*
- [ ] **M8** `feat:` responsive pass, verified at 375px — *by 3:35*
- [ ] **M9** `docs:` README with setup, credentials, priorities,
      trade-offs — *by 4:00*

If a milestone runs more than 40 minutes, stop and report. Do not
silently keep going — flag it so scope can be cut.

M7 and M8 are non-negotiable. The brief names loading/error states and
responsiveness explicitly. Cut features before cutting these.

---

## Hard constraints

**Ownership scoping.** Every task query filters by `req.user.id`. No
exceptions. Use `findFirst({ where: { id, userId } })`, never
`findUnique({ where: { id } })` plus a check afterwards. A task owned by
another user returns 404, not 403. This is the single most-graded detail
in the brief — treat any code path that reaches a task without a userId
as a bug.

**No userId from the client.** Controllers read `req.user.id` only.
Never accept a userId from the body, query, or params.

**One error shape.** Every non-2xx response is
`{ error: { message, details? } }`. The frontend parses one shape.

**Dependencies.** Ask before installing anything not listed in SPEC.md
section 1. Every new dependency is setup time the reviewer has to spend.

**No scope creep.** Registration, password reset, tests, deployment,
Docker, refresh tokens, pagination, and search are explicitly out of
scope. Delete is a bonus only after M9 is done.

**No custom date picker.** Use `<input type="date">`.

---

## Code style

- ES modules throughout (`"type": "module"` in both package.json files)
- `async/await`, never raw `.then()` chains
- Controllers stay thin — validation in middleware, logic in services
- One default export per React component file
- No inline styles in React; Tailwind utility classes only
- No `console.log` left in committed code; use the error handler
- No commented-out code in commits

---

## When something breaks

State plainly what failed and what you tried. Do not paper over a broken
endpoint by working around it on the frontend — fix the endpoint or cut
the feature and note it in the README.

If time is running short, the fallback order for cutting scope is:
delete endpoint → status filter pills → edit modal → skeleton loaders.
Never cut: login, task list, create form, error states, README.
