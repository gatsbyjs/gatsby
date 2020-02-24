# Inline ESLint

This Github Action runs ESLint on Gatsby and reports errors inline in any PR.

## Updating

By default the linting points to the master branch but for your test you'll need to change the location in `gatsby/.github/workflows/lint.yml` to point to your branch, rather than `@master`.

After that it should use your branch as source of truth for the lint action.

## Faster

Alternatively you can copy the action to a local fork, point your branch to that location@master and then you can test changes by pushing an update to the master branch of your own fork and then pressing "rerun workflow" in the "Checks" tab of your PR. Github should automatically pick up on any changes to the master branch (or whatever) of your fork.
