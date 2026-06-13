# DoDesk Testing Plan

This document is the source of truth for adding and maintaining the DoDesk test suite. Goal: **≥ 80% coverage** on business logic, enforced in CI.

---

## Goals

- **Catch regressions early** — slug validation, issue formatting, service rules fail in seconds, not in production
- **Safe refactors** — backend resource layer can evolve with confidence
- **Clear conventions** — every contributor knows where tests live and how to write them
- **Incremental rollout** — unit tests first, integration tests second, client tests third

---

## Current status

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Tooling | ✅ Done | Vitest, scripts, config |
| 2. Folder structure | ✅ Done | `backend/tests/` mirrors `src/` |
| 3. Unit tests — utils | ✅ Done | `slug`, `isValidEmail` (10 tests) |
| 4. Unit tests — errors & formatters | ✅ Done | `AppError`, `issue.types`, `team.types` |
| 5. Unit tests — middleware | ✅ Done | `validate`, `errorHandler`, `apiResponse`, `asyncHandler` |
| 5b. Unit tests — schemas | ✅ Done | All resource `*.schema.ts` files |
| 6. Service tests (mocked) | ✅ Done | `issue`, `team`, `workspace` services |
| 7. Integration tests | ✅ Done | Health, issue, workspace, team, comment, filter, user |
| 8. CI gate | ✅ Done | Backend + client Vitest in GitHub Actions |
| 9. Client tests | ✅ Done | 113 tests, ≥80% on lib/hooks/stores |

---

## Tooling

### Backend (active)

| Library | Purpose | Why this one |
|---------|---------|--------------|
| [Vitest](https://vitest.dev/) | Test runner | Fast, native TypeScript, `describe` / `it` / `expect` API |
| `@vitest/coverage-v8` | Coverage reports | Built-in; shows % lines/branches covered |
| [Supertest](https://github.com/ladjs/supertest) *(phase 7)* | HTTP integration tests | Standard for Express; hits `app` without starting a server |

### Client (active — phase 9)

| Library | Purpose |
|---------|---------|
| Vitest | Same runner as backend |
| React Testing Library | Hook tests via `renderHook` |
| jsdom | Browser-like environment for hooks/stores |
| `@vitest/coverage-v8` | Coverage on lib, hooks, stores |

### Client folder structure

```
client/
├── lib/                    # production
├── hooks/
├── stores/
├── tests/
│   ├── unit/               # mirrors lib/, hooks/, stores/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── stores/
│   └── helpers/
│       ├── setup.ts
│       └── fixtures.ts
├── vitest.config.ts
└── tsconfig.test.json
```

### Client commands

From **project root**:

```bash
npm run test:client            # run client unit tests
npm run test:client:coverage   # with coverage report
```

From **`client/`**:

```bash
npm test
npm run test:coverage
npm run test:watch
```

Open HTML coverage: `open client/coverage/index.html`

### Client (future)

### Test database (phase 7)

Integration tests need PostgreSQL (Prisma is Postgres-specific). Options:

- `docker-compose.test.yml` — reproducible local + CI setup *(recommended)*
- Local Postgres — manual `dodesk_test` database
- GitHub Actions `services: postgres` — CI only

---

## Folder structure

Production code and tests are **strictly separated**.

```
backend/
├── src/                              # production only — NO .test.ts files
│   ├── shared/
│   ├── resources/
│   │   ├── issues/
│   │   ├── teams/
│   │   ├── workspaces/
│   │   ├── comments/
│   │   ├── filters/
│   │   └── users/
│   ├── routes/
│   └── app.ts
│
├── tests/
│   ├── unit/                         # fast, isolated — no database
│   │   └── shared/utils/             # mirrors src/shared/utils/
│   │       ├── slug.test.ts
│   │       └── isValidEmail.test.ts
│   │
│   ├── integration/                  # Supertest + real Postgres (phase 7)
│   │   └── issues/
│   │       └── issue.routes.test.ts
│   │
│   └── helpers/                      # shared test utilities
│       ├── setup.ts                  # global setup (runs before all tests)
│       ├── factories.ts              # create User, Workspace, Team, Issue
│       └── auth.helper.ts            # mock requireAuth / inject session
│
├── vitest.config.ts
└── tsconfig.test.json                # TypeScript paths for test files
```

### Rules

1. **Mirror `src/` under `tests/unit/` or `tests/integration/`**
   - `src/resources/issues/issue.service.ts` → `tests/unit/resources/issues/issue.service.test.ts`
2. **Never place tests inside `src/`** — keeps `tsc` output clean
3. **Import production code via `@/` alias**
   - `import { cleanSlug } from '@/shared/utils/slug'`
4. **Shared fixtures and mocks** live in `tests/helpers/`, not duplicated per file

---

## Test pyramid

```
        /\
       /  \     E2E (Playwright) — later, critical flows only
      /----\
     /      \   Integration — Supertest + Postgres
    /--------\
   /          \ Unit — functions, services (mocked DB), middleware
  /------------\
```

| Layer | Location | Speed | When to use |
|-------|----------|-------|-------------|
| Unit | `tests/unit/` | ms | Pure functions, services with mocked queries, middleware |
| Integration | `tests/integration/` | seconds | Full HTTP request → DB round-trip |
| E2E | separate tooling | minutes | Sign-up → create issue → board drag (out of scope for 80%) |

**Most coverage comes from unit + integration tests.**

---

## Coverage policy

### Target

≥ **80%** on lines, branches, and functions for included paths.

### Included

All files under `backend/src/**/*.ts` except exclusions below.

### Excluded (bootstrap / glue, not business logic)

| Path | Reason |
|------|--------|
| `src/server.ts` | Calls `app.listen()` only |
| `src/index.ts` | Re-export entry |
| `src/lib/auth.ts` | better-auth wiring — mock auth in tests instead |
| `src/shared/db/prisma.ts` | Prisma singleton |

### Viewing coverage

Coverage scripts are not wired up yet. When added later, they will run tests with `--coverage` and open `backend/coverage/index.html`.

---

## Commands

From **project root**:

```bash
npm test                    # fast — unit + health checks (no DB)
npm run test:coverage       # same + coverage report
npm run test:all            # full suite including DB integration tests
npm run test:all:coverage   # full suite + coverage (enforces thresholds in CI)
npm run test:watch          # re-run on save
```

Open HTML coverage report: `open backend/coverage/index.html`

From **`backend/`** — same scripts directly.

### Test database (for `test:all`)

```bash
cd backend
npm run test:db:up       # start Postgres on port 5433
npm run test:db:migrate  # apply migrations
npm run test:all         # run everything
npm run test:db:down     # stop Postgres
```

---

## Writing a test

### File placement

```
src/shared/errors/AppError.ts  →  tests/unit/shared/errors/AppError.test.ts
```

### Template (unit test)

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/path/to/module';

describe('myFunction', () => {
  it('does the expected thing for valid input', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('handles the error case', () => {
    expect(myFunction('')).toBe(null);
  });
});
```

### Assertions

| Matcher | Use for |
|---------|---------|
| `.toBe(value)` | Primitives (`true`, numbers, strings) |
| `.toEqual(object)` | Objects and arrays (deep compare) |
| `.toThrow()` | Functions that should throw |
| `.rejects.toThrow()` | Async functions that should throw |

### What to test per function

1. **Happy path** — normal input → expected output
2. **Edge cases** — empty string, null, boundary values
3. **Error paths** — invalid input → throws or returns error

---

## Phased roadmap

### Phase 1 — Tooling ✅

- [x] Install Vitest + coverage
- [x] Add `test`, `test:all`, `test:watch` scripts
- [x] Configure `vitest.config.ts` and `tsconfig.test.json`
- [x] Establish `tests/` folder structure

### Phase 2 — Unit tests: pure logic

Test files with **no database, no HTTP**.

| Source file | Test file | Priority |
|-------------|-----------|----------|
| `shared/utils/slug.ts` | `tests/unit/shared/utils/slug.test.ts` | ✅ Done |
| `shared/utils/isValidEmail.ts` | `tests/unit/shared/utils/isValidEmail.test.ts` | ✅ Done |
| `shared/errors/AppError.ts` | `tests/unit/shared/errors/AppError.test.ts` | High |
| `resources/issues/issue.types.ts` | `tests/unit/resources/issues/issue.types.test.ts` | High |
| `resources/teams/team.types.ts` | `tests/unit/resources/teams/team.types.test.ts` | High |
| `resources/workspaces/workspace.types.ts` | `tests/unit/resources/workspaces/workspace.types.test.ts` | Medium |
| `resources/*/*.schema.ts` | `tests/unit/resources/*/*.schema.test.ts` | Medium |

**Estimated coverage after phase 2:** ~15–25%

### Phase 3 — Unit tests: middleware & responses

| Source file | Test file |
|-------------|-----------|
| `shared/middleware/validate.middleware.ts` | `tests/unit/shared/middleware/validate.middleware.test.ts` |
| `shared/errors/errorHandler.ts` | `tests/unit/shared/errors/errorHandler.test.ts` |
| `shared/responses/apiResponse.ts` | `tests/unit/shared/responses/apiResponse.test.ts` |
| `shared/middleware/asyncHandler.ts` | `tests/unit/shared/middleware/asyncHandler.test.ts` |

Learn here: fake `req`, `res`, `next` objects.

**Estimated coverage after phase 3:** ~30–40%

### Phase 4 — Service tests (mocked queries)

Mock the query layer; test business rules in services.

```
route → controller → service → query → Prisma
                         ↑
                    test here, mock query ↓
```

| Service | Key scenarios |
|---------|---------------|
| `issue.service` | team not found, issue not found, partial update, P2025 on delete |
| `workspace.service` | slug uniqueness, invite flow |
| `team.service` | duplicate key, member CRUD |
| `comment.service` | author checks |
| `filter.service` | default filter CRUD |
| `user.service` | profile updates |

Pattern:

```typescript
vi.mock('@/resources/issues/issue.query', () => ({
  issueQuery: { findById: vi.fn(), create: vi.fn() },
}));
```

**Estimated coverage after phase 4:** ~65–75%

### Phase 5 — Integration tests

**Prerequisites:** Postgres test DB (`docker-compose.test.yml` or local), Supertest installed.

| Test file | Covers |
|-----------|--------|
| `tests/integration/issues/issue.routes.test.ts` | Issue CRUD endpoints |
| `tests/integration/workspaces/workspace.routes.test.ts` | Workspace CRUD + invite |
| `tests/integration/teams/team.routes.test.ts` | Team endpoints |
| `tests/integration/comments/comment.routes.test.ts` | Comment endpoints |
| `tests/integration/filters/filter.routes.test.ts` | Filter endpoints |

Each file:

1. Seed data via `tests/helpers/factories.ts`
2. Mock or bypass `requireAuth` with test user
3. `request(app).post('/api/...')` → assert status + body + DB state

Also test: 401 without auth, 400 on validation errors, 404 on missing resources.

**Estimated coverage after phase 5:** **≥ 80% backend**

### Phase 6 — CI gate

`.github/workflows/ci.yml` runs on push/PR to `main`:

1. **Lint** — `eslint` (backend), `next lint` (client)
2. **Typecheck** — `tsc --noEmit` on src (+ backend tests)
3. **Test** — `test:all:coverage` (backend + Postgres), `test:coverage` (client)

From project root: `npm run lint`, `npm run typecheck`, `npm run ci` (full local CI).

### Phase 7 — Client tests

Focus on logic layers, not every UI component.

| Target | Test file location |
|--------|-------------------|
| `client/lib/workspace-helpers.ts` | `client/tests/unit/lib/workspace-helpers.test.ts` |
| `client/hooks/useIssueFiltering.ts` | `client/tests/unit/hooks/useIssueFiltering.test.ts` |
| `client/stores/issueStore.ts` | `client/tests/unit/stores/issueStore.test.ts` |
| `client/services/*.ts` | `client/tests/unit/services/*.test.ts` |

**Exclude from client coverage:** `client/components/ui/**` (shadcn/Radix primitives), `client/app/**` (thin Next.js pages).

---

## Mocking reference (phase 4+)

### Mock a module

```typescript
import { vi } from 'vitest';

vi.mock('@/resources/issues/issue.query', () => ({
  issueQuery: {
    findById: vi.fn(),
    create: vi.fn(),
  },
}));
```

### Fake Express objects (phase 3)

```typescript
const req = { body: {}, params: {}, query: {} } as Request;
const res = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
} as unknown as Response;
const next = vi.fn();
```

### Supertest (phase 5)

```typescript
import request from 'supertest';
import { app } from '@/app';

const res = await request(app)
  .post('/api/teams/team-id/issues')
  .set('Cookie', authCookie)
  .send({ title: 'Fix bug' });

expect(res.status).toBe(201);
```

---

## Checklist: adding a new feature

When shipping new backend code:

- [ ] Add unit tests for any pure functions or formatters
- [ ] Add service tests if new business rules in `*.service.ts`
- [ ] Add integration test if new route in `*.route.ts`
- [ ] Add coverage script later (`--coverage` + thresholds)
- [ ] Place tests in `tests/unit/` or `tests/integration/` mirroring `src/`

---

## Related docs

- [Backend Refactoring Guide](./backend-refactoring.md) — layered architecture that makes services and queries testable
