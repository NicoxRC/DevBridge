# Contributing to DevBridge

Short version: **branch from `trunk`, make small commits, rebase, open a Pull Request, rebase and merge.**
Nobody pushes directly to `trunk` — it is protected and only changes through merged PRs.

To run the project on your machine, see [docs/local-setup.md](docs/local-setup.md).

## 1. Create a branch

Always start from an up-to-date `trunk`:

```bash
git checkout trunk
git pull
git checkout -b feat/project-filters
```

Name the branch `<type>/<short-description>` in kebab-case:

| Prefix | Use it for |
|--------|-----------|
| `feat/` | A new feature or user-visible behavior |
| `fix/` | A bug fix |
| `chore/` | Maintenance: dependencies, config, translations, cleanup |
| `docs/` | Documentation only |
| `refactor/` | Code changes that don't change behavior |
| `test/` | Adding or fixing tests |

Examples: `feat/delivery-ratings`, `fix/login-redirect`, `chore/update-vite`, `docs/local-setup`.

## 2. Make small commits

- One commit = one logical change. If the message needs "and", it is probably two commits.
- Write the message in English, imperative mood, ≤ 72 characters: *"Add level filter to Explore page"*, not *"added filters"*.
- Add a body after a blank line only if the *why* isn't obvious.
- Don't commit secrets (`.env`), `node_modules/`, `.venv/` or build output.

```bash
git add frontend/src/pages/Explore.jsx
git commit -m "Add level filter to Explore page"
```

## 3. Rebase and open a Pull Request

Before pushing, rebase your branch on the latest `trunk` so it applies cleanly on top of it
(never merge `trunk` into your branch):

```bash
git fetch origin
git rebase origin/trunk          # fix conflicts, `git add`, then `git rebase --continue`
git push -u origin feat/project-filters
gh pr create --base trunk --fill   # or open the link GitHub prints
```

If you already pushed the branch, push the rebased version with
`git push --force-with-lease` (only on your own branch, never on `trunk`).
gh pr create --base trunk --fill   # or open the link GitHub prints
```

In the PR description:

- **What** changed, in one or two lines.
- **Why** (link the requirement, e.g. RF-07, or the issue).
- **How to test** it locally.
- Screenshots if the UI changed.

Keep PRs small and focused — one feature or fix per PR. Before opening it, make sure the app
still starts (`uv run uvicorn app.main:app --reload` and `npm run dev`) and the frontend builds (`npm run build`).

## 4. Merge

- Every PR needs an approving review from the repository owner (see `.github/CODEOWNERS`)
  before it can be merged. New commits after the approval require a new review.
- PRs are merged with **Rebase and merge** only: every commit of the PR is replayed on top of `trunk`,
  one by one, with no merge commit. That's why each commit must be small and have a clear message —
  they all end up in `trunk` as they are.
- If `trunk` moved ahead, rebase again before merging: `git fetch origin && git rebase origin/trunk`,
  then `git push --force-with-lease`.
- GitHub deletes the remote branch automatically after the merge. Go back to `trunk`
  and delete your local copy:

```bash
git checkout trunk
git pull --prune
git branch -d feat/project-filters
```

## Backend tests

Unit tests use [pytest](https://docs.pytest.org/). Run them with `uv run pytest` inside `backend/`.
The `back-ci` GitHub Actions workflow runs them, and builds the Docker image, on every PR that touches `backend/`.

- **In `backend/tests/`, mirroring `app/`:** `app/auth.py` → `tests/test_auth.py`. The GraphQL API is split by
  operation type in `tests/schema/` (`test_queries.py`, `test_mutations.py`).
- **One `Test<Name>` class per function or resolver** (`TestScore`, `TestRegister`…).
- **Two tests per class:** the good case and the bad case (error, permission or invalid data).
  Add a third test only for a very specific rule worth guarding, with a `# Specific case:` comment saying why.
- **No PostgreSQL needed:** tests run against a throwaway SQLite database that is recreated for every test.
  The fixtures in `tests/conftest.py` give you:
  - `developer`, `organization`, `make_user`, `make_project`, `make_application` — sample data.
  - `gql(query, user=..., **variables)` — runs a GraphQL operation as that user (or as a visitor) and returns `data`;
    errors are raised, so check them with `pytest.raises(Exception, match="...")`.
