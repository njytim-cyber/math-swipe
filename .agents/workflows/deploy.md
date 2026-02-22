---
description: How to deploy changes to production via PR workflow
---

# Deploy Workflow

> ⚠️ **NEVER push directly to `master`.** All changes go through pull requests.

## Steps

// turbo-all

1. Make sure you're on the `dev` branch or a feature branch:
   ```bash
   git checkout dev
   ```

2. Create a feature/fix branch:
   ```bash
   git checkout -b fix/description-of-change
   ```

3. Make your changes and commit:
   ```bash
   git add -A && git commit -m "fix: description"
   ```

4. Run full verification:
   ```bash
   npm run verify
   ```

5. Push the branch:
   ```bash
   git push -u origin fix/description-of-change
   ```

6. Open a PR on GitHub targeting `dev`.

7. After review, merge the PR (squash merge recommended).

8. To deploy to production, open a PR from `dev` → `master` on GitHub.

9. Merge the PR to `master`. Cloudflare Pages will auto-deploy.

## Important Rules

- **`master`** is the production branch. Only merge via PR.
- **`dev`** is the integration branch. Feature branches merge here first.
- Always run `npm run verify` before pushing.
- The pre-push hook will block pushes that fail verification.
