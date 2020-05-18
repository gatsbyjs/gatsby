# End to End Tests

These are end to end tests triggered via a CI job. You can run these tests locally by following the [instructions below](#running-the-tests), and they're automatically run as part of a CI workflow which runs when the _packages/_ or _e2e-tests/_ directory is changed in a commit.

## Adding a new e2e test

- Create a folder `e2e-tests/name-of-the-test`
- Copy structure from an existing test, e.g. [_e2e-tests/path-prefix_](./path-prefix/)
- Add your tests in `e2e-tests/name-of-the-test/cypress/integration/your-test-here.js`

## Running the Tests

- `cd` to the test (e.g. `cd e2e-tests/gatsby-image`)
- Run the `e2e-test` script: `../../script/e2e-test.sh`

Thanks for contributing to Gatsby! 💜
