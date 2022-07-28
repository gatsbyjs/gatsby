# Integration Tests

These are tests triggered via the `test:integration` script. They do not run in the browser, but rather run in a Jest JSDOM environment. This means that they're good for catching regressions, but may not catch _quite_ as much as the [e2e-tests](../e2e-tests) which do run in a real browser via Cypress.

## Adding a new integration test

- Create a folder `integration-tests/name-of-the-test`
- Copy structure from an existing test, e.g. [`integration-tests/head-function-export`](./head-function-export)
- Write your tests in `integration-tests/name-of-the-test/__tests__`

## Running the tests

Run `yarn test:integration` or `npm run test:integration` to run the suite of integration tests.

Thanks for contributing to Gatsby!
