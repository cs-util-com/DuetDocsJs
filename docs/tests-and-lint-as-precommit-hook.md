Instructions to add a **native Git pre-push hook** that blocks pushes unless your selected test command succeeds.

---

## 0) Prereqs (once)

Confirm the command you plan to run (default `npm test`) already covers the checks you want to enforce before pushing.

- In this template, `npm test` runs `test:core` (format + lint + dependency checks + unit/property tests) followed by `test:e2e:index` (Playwright).
- If you only want the lighter core suite at push time, swap in `npm run test:core --silent` in Step 2.

---

## 1) Add a versioned hooks directory

```bash
mkdir -p .githooks
git config core.hooksPath .githooks
```

This tells Git to use the tracked `.githooks/` directory instead of `.git/hooks/`.

---

## 2) Create the pre-push hook

Create `.githooks/pre-push` with the following content:

```bash
#!/usr/bin/env sh
set -eu

echo "Running npm test before push..."
npm test --silent || {
  echo "npm test failed; push aborted."
  exit 1
}

echo "npm test passed; proceeding with push."
```

Mark it executable (choose one):

```bash
git update-index --chmod=+x .githooks/pre-push
# or
chmod +x .githooks/pre-push
```

---

## 3) Quick self-test

```bash
./.githooks/pre-push
```

Running the hook manually should execute the same checks Git will run before a push.

---

## Additional Notes

- Developers can bypass local hooks with `--no-verify`, so keep CI as the final gate.
- If you want a lighter-weight push check, swap `npm test --silent` for `npm run test:core --silent` to skip e2e tests.
- Re-run the `git config core.hooksPath .githooks` command on every machine or clone so Git picks up the tracked hooks.
