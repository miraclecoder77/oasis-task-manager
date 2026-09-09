# Oasis Task Manager

A small full-stack task manager: JWT login, and task CRUD scoped to the
signed-in user. Built as a timed technical assessment.

**Stack** — Express 4 · Prisma 6 · SQLite · Zod · React 18 · Vite ·
TanStack Query v5 · Tailwind v4

---

## Test credentials

```
email:    test@oasis.dev
password: Password123!
```

Both are pre-filled as placeholders on the sign-in form. There is no
registration screen — the seeder creates this one user.

---

## Setup

**Requires Node 20.6 or newer.** The server is started with Node's native
`--env-file`, so there is no `dotenv` dependency. Built and tested on
Node 22.

### 1. Clone and enter the project

```bash
git clone https://github.com/miraclecoder77/oasis-task-manager.git
cd oasis-task-manager
```

### 2. Set up the API

```bash
cd server
npm install
cp .env.example .env
npx prisma migrate deploy
npm run seed
npm run dev
```

The API starts on <http://localhost:4000>. Leave it running.

`npm install` generates the Prisma client via a `postinstall` hook. If
you ever see *"@prisma/client did not initialize yet"*, run
`npx prisma generate`.

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

### 3. Set up the client

In a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The app starts on <http://localhost:5173>. Open it and sign in with the
credentials above.

### Environment variables

Both `.env.example` files hold working local defaults and are safe to
copy verbatim. `JWT_SECRET` ships as a placeholder — fine for local
review, replace it with a long random string anywhere real.

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | server | SQLite file path |
| `JWT_SECRET` | server | Signs and verifies tokens |
| `PORT` | server | API port (4000) |
| `CLIENT_ORIGIN` | server | Allowed CORS origin |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` | server | Seeded credentials |
| `VITE_API_URL` | client | API base URL |

The seeder is idempotent — re-run `npm run seed` at any point to reset
the data to four sample tasks covering all three statuses.

---

## API

Base path `/api`. Every task route requires `Authorization: Bearer <token>`.

| Method | Path | Success |
|---|---|---|
| POST | `/auth/login` | `200 { token, user }` |
| GET | `/auth/me` | `200 { user }` |
| GET | `/tasks?status=` | `200 { data: Task[] }` |
| GET | `/tasks/:id` | `200 { data: Task }` |
| POST | `/tasks` | `201 { data: Task }` |
| PATCH | `/tasks/:id` | `200 { data: Task }` |

Every non-2xx response uses one envelope, so the client parses a single
shape:

```json
{
  "error": {
    "message": "Validation failed",
    "details": { "title": ["Title is required"] }
  }
}
```

`details` appears only on 400s. `400` validation · `401` missing or
invalid token · `404` not found *or not owned by the caller* · `500`
unexpected, logged server-side and returned generic.

---

## What I prioritised, and why

**Ownership scoping above everything else.** The brief asks for tasks
scoped to the logged-in user and structured as though there were many
users, so I treated any code path reaching a task without a `userId` as a
bug. Every service function takes `userId` as its first parameter and
puts it in the `where` clause; there is no `findUnique` on a task
anywhere in the codebase, only `findFirst({ where: { id, userId } })`.

A task belonging to another user returns **404, not 403** — a 403 would
confirm the record exists and let a caller enumerate other people's task
IDs. Controllers read `req.user.id` from the verified token only, never a
`userId` from a body, query, or param.

I verified this against a second user in the database rather than by
reading the code. With one user's token against another's task: `GET` →
404, `PATCH` → 404 and unmutated, list → only their own rows. A `userId`
planted in a POST body was ignored and the task came back owned by the
caller; the same key in a PATCH body was stripped, leaving an empty
update that was rejected. A nonexistent ID returns a byte-identical 404
to another user's task.

**Validation at the boundary, in one place.** Zod schemas per endpoint,
applied by one `validate` middleware that replaces the request part with
the parsed result — so controllers only ever see coerced, trusted data.
Field errors come back keyed by field name and render under the matching
input.

**The four async states, made visible.** Every async surface renders
exactly one of loading, error, empty, or success. Loading is three
skeleton cards shaped like real cards, not a centred spinner, so the list
does not jump when data arrives. Empty is a distinct state with its own
illustration and a create button — a blank screen on `data: []` is
indistinguishable from a broken fetch. Errors show the API's own message
with a working Retry. I tested each by inducing it: stopping the API,
clearing the table, and delaying requests in the browser.

**One error envelope.** Every failure — validation, auth, not found,
unexpected — returns `{ error: { message, details? } }`, so the frontend
has one parsing path and one rendering path.

---

## Known trade-offs

**The token lives in `localStorage`.** It is readable by any injected
script, so a successful XSS could exfiltrate it. Accepted here for speed.
The production answer is an httpOnly, `SameSite=Strict` cookie with CSRF
protection, which needs coordinated changes on both sides and did not fit
the time budget.

**`status` is a `String`, not an enum.** SQLite has no native enum type,
so the column is a string constrained at the API boundary by Zod to
`pending | in-progress | done`. The database itself would accept any
string — a direct write bypassing the API could store something invalid.
On Postgres this would be a real enum, or a check constraint.

**No pagination.** The list endpoint returns every task the user owns.
Fine for a seeded demo, wrong at a few hundred rows. Adding it means
cursor params on the endpoint and infinite scroll or pages in the client.

**Prisma is pinned to 6.x.** Prisma 7 removes `url` from the datasource
block and requires a `prisma.config.ts` plus a driver-adapter dependency.
Pinning to 6 kept the schema conventional and avoided two dependencies
that buy nothing at this size.

**Due dates are date-only, stored as UTC midnight.** Formatting is pinned
to UTC throughout; using local getters would render a date a day early
west of Greenwich. There is no time-of-day component and no timezone
handling beyond that.

**The single user is created by the seeder.** There is no registration,
so the only way to add a user is to re-run the seeder or write to the
database directly.

---

## What I left out, and why

Everything here was a deliberate cut against the four-hour limit, not an
oversight.

- **Tests.** The highest-value ones would be integration tests on the
  scoping rules — asserting that one user's token cannot read or mutate
  another's task. I verified those paths manually with a second user and
  recorded the results above, but manual verification does not survive a
  refactor. This is the first thing I would add.
- **Delete.** Listed as a bonus in the brief, below the required
  milestones. The service and route layers are shaped so it is a small
  addition.
- **Refresh tokens.** Tokens last 24 hours with no rotation. Meaningful
  only alongside the httpOnly cookie change, which was out of budget.
- **Deployment and Docker.** Explicitly out of scope; SQLite means the
  reviewer needs no database setup at all.
- **Registration, password reset, search.** Out of scope per the brief.

---

## What I would add next

1. **Integration tests on the ownership rules** — the highest-risk
   behaviour is currently protected only by manual verification.
2. **httpOnly cookies with refresh token rotation**, replacing
   `localStorage` and closing the XSS exfiltration path.
3. **Optimistic updates** on the task mutations. TanStack Query is
   already in place; today a save waits for the round trip before the
   list reflects it.
4. **Pagination** on the list endpoint, with a cursor.
5. **Postgres** instead of SQLite, which makes `status` a real enum and
   removes the write-path gap described above.

---

## Notes on the build

The commit history is one commit per milestone, in order. A few things
worth flagging that a reviewer would otherwise have to discover:

- Session restore distinguishes an unreachable API from a rejected token.
  An earlier version signed the user out on any `/auth/me` failure, which
  discarded a still-valid session whenever the API was briefly down. Only
  a 401 ends the session now; anything else offers a retry.
- Login normalises the email — trims and lower-cases before validating —
  so a pasted credential with a trailing space still works.
- A cleared date input posts `""`, which is treated as clearing the date
  rather than as a malformed value.
- Verified responsive at 320, 375, 640, 1024 and 1440px with no
  horizontal scroll, including long unbroken titles and URLs.
