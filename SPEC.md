# Oasis Task Manager — Technical Spec

Mini full-stack task manager. Single hardcoded user, JWT auth, task CRUD.
Built under a 4-hour constraint. This file is the source of truth for
architecture decisions; read it before writing code.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node 20 | — |
| Server | Express 4 | Minimal, fast to stand up |
| ORM | Prisma | Schema file doubles as documentation |
| Database | SQLite | Zero setup for the reviewer |
| Validation | Zod | Schema-per-endpoint, composable |
| Auth | jsonwebtoken + bcryptjs | Stateless, no session store |
| Client | React 18 + Vite | Fast HMR, no framework overhead |
| Routing | react-router-dom v6 | — |
| Data fetching | TanStack Query v5 | Loading/error states + cache invalidation free |
| Styling | Tailwind v4 | CSS-first config, no separate config file |

**Do not add dependencies beyond this list without asking.**

---

## 2. Repo layout

```
oasis-task-manager/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── index.js                 # boot, listen
│   │   ├── app.js                   # express instance, middleware chain, routes
│   │   ├── lib/prisma.js            # single PrismaClient export
│   │   ├── middleware/
│   │   │   ├── authenticate.js
│   │   │   ├── validate.js
│   │   │   └── errorHandler.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.schema.js
│   │   │   └── tasks/
│   │   │       ├── tasks.routes.js
│   │   │       ├── tasks.controller.js
│   │   │       ├── tasks.service.js
│   │   │       └── tasks.schema.js
│   │   └── utils/ApiError.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── main.jsx                 # QueryClientProvider + AuthProvider + Router
│   │   ├── App.jsx                  # route definitions
│   │   ├── api/
│   │   │   ├── client.js            # fetch wrapper
│   │   │   ├── auth.js
│   │   │   └── tasks.js
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useTasks.js        # TanStack query + mutations
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Textarea, Select,
│   │   │   │                        # Badge, Spinner, Alert, EmptyState,
│   │   │   │                        # Modal, SkeletonCard
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskFormModal.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── TasksPage.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── .gitignore
├── CLAUDE.md
├── SPEC.md
└── README.md
```

Feature modules, not `controllers/ models/ routes/`. Two separate
`package.json` files, no monorepo tooling.

---

## 3. Data model

`server/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  status      String    @default("pending")
  dueDate     DateTime?
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, status])
}
```

SQLite has no native enum type, so `status` is a `String` constrained at
the API boundary by Zod to `pending | in-progress | done`. Document this
in the README as a deliberate trade-off.

**Seeder** creates exactly one user:
`test@oasis.dev` / `Password123!` (bcrypt hashed, 10 rounds), plus 3–4
sample tasks covering all three statuses so the list isn't empty on first
load.

---

## 4. API contract

Base path `/api`. All task routes require `Authorization: Bearer <token>`.

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `200 { token, user }` |
| GET | `/auth/me` | — | `200 { user }` |
| GET | `/tasks?status=` | — | `200 { data: Task[] }` |
| GET | `/tasks/:id` | — | `200 { data: Task }` |
| POST | `/tasks` | `{ title, description?, status?, dueDate? }` | `201 { data: Task }` |
| PATCH | `/tasks/:id` | partial task | `200 { data: Task }` |
| DELETE | `/tasks/:id` | — | `204` (bonus, only if time) |

### Error envelope

Every non-2xx response uses this shape. No exceptions.

```json
{
  "error": {
    "message": "Validation failed",
    "details": { "title": ["Title is required"] }
  }
}
```

`details` is present only on 400 validation failures.

| Code | Meaning |
|---|---|
| 400 | Validation failed |
| 401 | Missing, malformed, or expired token |
| 404 | Not found, or not owned by the caller |
| 500 | Unexpected — logged server-side, generic message to client |

### Validation rules

- `title` — string, required, 1–200 chars, trimmed
- `description` — string, optional, max 2000 chars
- `status` — enum `pending | in-progress | done`, defaults to `pending`
- `dueDate` — ISO date string, optional, nullable

---

## 5. Ownership scoping — the critical requirement

The brief says tasks must be scoped to the logged-in user and structured
as if there were many users. This is what's being graded.

**Rules:**

1. Every service function takes `userId` as its first parameter.
2. No service function can reach a task without a `userId` in the `where`
   clause.
3. Use `findFirst({ where: { id, userId } })` — never
   `findUnique({ where: { id } })` followed by an ownership check.
4. A task owned by another user returns **404, not 403**. A 403 confirms
   the record exists and leaks information.
5. Controllers read `req.user.id`. They never accept a `userId` from the
   request body, query string, or params.

```js
// tasks.service.js — correct
export const findAll = (userId, filters = {}) =>
  prisma.task.findMany({
    where: { userId, ...filters },
    orderBy: { createdAt: 'desc' },
  });

export const findOne = (userId, id) =>
  prisma.task.findFirst({ where: { id, userId } });

export const update = async (userId, id, data) => {
  const existing = await findOne(userId, id);
  if (!existing) return null;              // controller turns this into 404
  return prisma.task.update({ where: { id }, data });
};
```

---

## 6. Auth flow

1. Seeder inserts one user with a bcrypt-hashed password.
2. `POST /api/auth/login` looks up by email, `bcrypt.compare`s the
   password, signs a JWT with payload `{ sub: user.id }`, `expiresIn: '24h'`.
3. A failed login returns 401 with a generic message — never distinguish
   "no such user" from "wrong password".
4. Client stores the token in `localStorage` under `oasis_token`.
5. `api/client.js` attaches `Authorization: Bearer <token>` to every request.
6. `authenticate` middleware verifies the token, loads the user, sets
   `req.user`. Invalid or expired → 401.
7. Any 401 response clears the stored token and redirects to `/login`.

**Known trade-off:** `localStorage` is readable by injected scripts, so a
successful XSS can exfiltrate the token. Accepted here for speed. The
production answer is an httpOnly, SameSite=Strict cookie with CSRF
protection. This must be stated in the README.

---

## 7. Frontend architecture

### Routes

| Path | Component | Guard |
|---|---|---|
| `/login` | LoginPage | redirect to `/tasks` if already authed |
| `/tasks` | TasksPage | ProtectedRoute |
| `*` | redirect to `/tasks` | — |

Create and edit share one modal. No `/tasks/new` or `/tasks/:id/edit`
routes — the modal takes an optional `task` prop and switches mode.

### Data layer

One query hook, two mutations:

```js
useTasks(filters)          // queryKey: ['tasks', filters]
useCreateTask()            // invalidates ['tasks'] on success
useUpdateTask()            // invalidates ['tasks'] on success
```

QueryClient defaults: `retry: 1`, `refetchOnWindowFocus: false`.

### The four states

Every async surface renders exactly one of these. This is an explicit
requirement in the brief — make it visible, not implied.

| State | Treatment |
|---|---|
| Loading | 3 × `SkeletonCard`, not a bare centred spinner |
| Error | `Alert` with the API message and a Retry button |
| Empty | `EmptyState`: icon, "No tasks yet", Create button |
| Success | The task list |

The empty state is distinct from the loading state. A blank screen on
`data: []` is indistinguishable from a broken fetch.

Forms: submit button shows a spinner and disables while pending.
Field-level errors from `error.details` render under the matching input.
Never use `window.alert`.

---

## 8. Design system

All tokens live at the top of `client/src/index.css` (Tailwind v4 is
CSS-first — there is no `tailwind.config.js`).

```css
@import "tailwindcss";

@theme {
  --color-brand-50:  #eef4ff;
  --color-brand-100: #d9e5ff;
  --color-brand-500: #3b6ef5;
  --color-brand-600: #2a55d4;
  --color-brand-700: #1f41a8;

  --color-ink-900: #0f1729;
  --color-ink-700: #33415c;
  --color-ink-500: #64748b;
  --color-ink-300: #cbd5e1;
  --color-ink-100: #eef1f6;
  --color-ink-50:  #f7f9fc;

  --color-status-pending-bg:  #fef3c7;
  --color-status-pending-fg:  #92400e;
  --color-status-progress-bg: #dbeafe;
  --color-status-progress-fg: #1e40af;
  --color-status-done-bg:     #d1fae5;
  --color-status-done-fg:     #065f46;

  --color-danger-bg: #fee2e2;
  --color-danger-fg: #991b1b;

  --radius-card: 12px;
  --radius-control: 8px;
}
```

### Typography

System font stack — no webfont request.

| Role | Size / weight |
|---|---|
| Page title | 24px / 600 |
| Card title | 16px / 600 |
| Body, labels | 14px / 500 |
| Meta, dates | 13px / 400, `ink-500` |
| Badge | 12px / 600, uppercase, tracking 0.02em |

### Spacing

4px grid. Use only `4 / 8 / 12 / 16 / 24 / 32`.
Card padding 16. Gap between cards 12. Page gutter 16 mobile, 32 desktop.

### Status treatment — three signals, never colour alone

| Status | Pill bg / fg | Card left accent |
|---|---|---|
| `pending` | `#fef3c7` / `#92400e` | `#f59e0b` |
| `in-progress` | `#dbeafe` / `#1e40af` | `#3b82f6` |
| `done` | `#d1fae5` / `#065f46` | `#10b981` |

Done cards additionally get `opacity-70` and a strikethrough title.

Card structure: full 1px border, `rounded-xl`, `overflow-hidden`, with a
3px full-height coloured div as the first flex child. Do not use
`border-l-4` with rounded corners — the accent won't follow the radius.

### Components to build first

`Button` (primary / secondary / ghost, `loading` prop) · `Input` ·
`Textarea` · `Select` · `Badge` · `Spinner` · `Alert` · `EmptyState` ·
`Modal` (backdrop, Esc to close, click-outside) · `SkeletonCard`

### Screens

**LoginPage** — centred card, `max-w-sm`, vertically centred. Heading
"Sign in", email + password fields, full-width submit. Failed login
renders an `Alert` above the fields. Put the test credentials in the
input placeholders so the reviewer gets in first try.

**TasksPage** — header with app mark, user email, logout. Filter pills
(All / Pending / In progress / Done) on the left, "New task" button on
the right. Task cards stacked with 12px gaps.

**TaskFormModal** — title (required), description (textarea), status
(select, defaults pending), due date (native `<input type="date">` — do
not build a custom picker). Footer: Cancel left, Save right.

### Responsive

Mobile-first, two breakpoints.

- **base (< 640px)** — single column, 16px gutters, header stacks,
  "New task" full-width below filters, badge drops below title
- **sm (≥ 640px)** — badge inline right, header on one row
- **lg (≥ 1024px)** — `max-w-3xl mx-auto`, 32px gutters

Verify at 375px width before committing the responsive milestone. A
horizontal scrollbar at mobile width is the most visible possible failure.

---

## 9. Environment variables

`server/.env.example`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-string"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
SEED_USER_EMAIL="test@oasis.dev"
SEED_USER_PASSWORD="Password123!"
```

`client/.env.example`:

```
VITE_API_URL="http://localhost:4000/api"
```

Commit only the `.example` files. Never commit a real `.env`.

---

## 10. Out of scope

Per the brief, do not build: registration, password reset, styling
polish beyond the tokens above, tests, deployment config, Docker,
refresh tokens, pagination, search.

Delete is a bonus. Build it only if all nine milestones are done and
more than 20 minutes remain.

---

## 11. README requirements

The README is graded. Budget 20–25 minutes. It must contain:

1. **Setup** — clone, install both packages, copy env files, run
   migration, run seed, start both dev servers. Exact commands.
2. **Test credentials** — email and password, stated plainly near the top.
3. **What was prioritised and why** — ownership scoping, validation, the
   four async states, consistent error envelope.
4. **What was left out and why** — tests, delete, refresh tokens,
   deployment. Tie each to the time limit.
5. **Known trade-offs** — localStorage vs httpOnly cookie; SQLite string
   status vs a real enum; no pagination.
6. **What I'd add with more time** — httpOnly cookies with refresh token
   rotation, integration tests on the scoping rules, optimistic updates,
   pagination, Postgres.

An honest README about an incomplete app beats a silent complete one.
The brief says outright that most candidates won't finish everything.
