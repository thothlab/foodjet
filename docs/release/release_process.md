# Release Process

## Versioning

FoodJet follows **Semantic Versioning** (semver): `MAJOR.MINOR.PATCH`.

| Increment | When |
|---|---|
| **MAJOR** | Breaking API changes, incompatible schema migrations, major UI overhaul |
| **MINOR** | New features, non-breaking additions |
| **PATCH** | Bug fixes, performance improvements, copy changes |

All components (backend, customer app, admin panel, courier app, bot) share a single version number to keep releases coordinated.

---

## Release Flow

```
main (stable)
  |
  +-- release/x.y.z  (branch from main)
        |
        +-- test on staging
        +-- run manual checklist (see docs/qa/manual_release_checklist.md)
        +-- fix issues on release branch
        +-- merge to main
        +-- tag vx.y.z
        +-- deploy to production
```

### Step by Step

1. **Branch.** Create `release/x.y.z` from `main`.
2. **Deploy to staging.** Push the release branch to trigger a staging deployment.
3. **Run automated tests.** All unit and integration tests must pass.
4. **Run manual checklist.** Complete every item in `docs/qa/manual_release_checklist.md`.
5. **Fix issues.** Commit fixes directly to the release branch. Re-test.
6. **Merge to main.** Create a pull request from the release branch to `main`. Require at least one approval.
7. **Tag.** After merge, create a Git tag `vx.y.z` on the merge commit.
8. **Deploy to production.** Follow the deploy order below.
9. **Write release notes.** Document what changed (see Release Notes section).

---

## Deploy Order

Components must be deployed in this exact order to avoid runtime errors:

1. **Database migrations** -- run all pending migrations. Verify they succeed before proceeding.
2. **Backend API** -- deploy the new backend. Verify `/health` returns OK.
3. **Telegram Bot** -- deploy/restart the bot process. Verify it responds to `/start`.
4. **Customer Mini App** -- deploy the frontend bundle.
5. **Admin Panel** -- deploy the frontend bundle.
6. **Courier App** -- deploy the frontend bundle.

Frontends are deployed last because they depend on the backend API being up-to-date.

---

## Rollback

If a release causes issues in production, rollback in **reverse deploy order**:

### Frontend rollback
- Redeploy the previous frontend build (from the prior Git tag or build artifact).
- Frontends are stateless; rollback is instant.

### Backend rollback
- Redeploy the previous backend version.
- Verify `/health` returns OK.
- If the new backend is incompatible with a migration that was already applied, see migration rollback below.

### Bot rollback
- Redeploy the previous bot version.

### Database migration rollback
- If the migration is **additive** (new table, new column with default): no rollback needed, the old backend ignores new columns/tables.
- If the migration is **destructive** (dropped column, renamed column): run the corresponding `down` migration if available.
- If no `down` migration exists: restore from the most recent database backup and redeploy the old backend.

**Prevention is better than rollback.** Follow the migration safety rules below.

---

## Migration Safety

| Rule | Rationale |
|---|---|
| Never drop a column in the same release that stops using it | The old backend (during rollback) still reads the column |
| Deprecation period: at least one release | Release N: stop writing to the column. Release N+1: drop the column |
| Always add columns as nullable or with a default | Avoids locking large tables, compatible with old code |
| Test migrations on staging before production | Catch errors early |
| Never rename columns directly | Add new column, backfill, update code, drop old column over two releases |

---

## Release Notes

After each release, publish coordinated release notes covering:

- **Backend API** -- new endpoints, changed behavior, bug fixes
- **Telegram Bot** -- new commands, notification changes
- **Customer Mini App** -- UI changes, new features
- **Admin Panel** -- new management features, UI changes
- **Courier App** -- workflow changes

Post release notes in the team channel and include the version tag.
