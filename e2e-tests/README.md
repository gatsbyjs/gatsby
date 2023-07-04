# End to End Tests

These are end to end tests triggered via a CI job. You can run these tests locally by following the [instructions below](#running-the-tests), and they're automatically run as part of a CI workflow which runs when the _packages/_ or _e2e-tests/_ directory is changed in a commit.

## Adding a new e2e test

- Create a folder `e2e-tests/name-of-the-test`
- Copy structure from an existing test, e.g. [_e2e-tests/path-prefix_](./path-prefix/)
- Add your tests in `e2e-tests/name-of-the-test/cypress/integration/your-test-here.js`

## Running the Tests

- `cd` to the test (e.g. `cd e2e-tests/development-runtime`)
- Install dependencies: `yarn` or `npm install`
- OPTIONAL: Use [gatsby-dev-cli][gatsby-dev-cli] to link current changes in packages
- Run the `test` script, e.g. `yarn test` or `npm test`

Alternatively you can do what the CI does:

- From the gatsby root run `./scripts/e2e-test.sh "e2e-tests/development-runtime" "yarn test"`
- The script uses sudo to install -g gatsby-cli. You won't need to and you can ctrl+c the prompt away

Thanks for contributing to Gatsby! 💜

[gatsby-dev-cli]: https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-dev-cli
