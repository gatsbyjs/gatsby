# Contributing to `gatsby-source-wordpress`

## Code Contributions

Refer to the [main Gatsby docs on code contributions](https://www.gatsbyjs.com/contributing/code-contributions#setting-up-your-local-dev-environment/) to get started. The gist of it is that you'll run `gatsby-dev-cli` in one terminal window, which will copy changed files into your development Gatsby site, and in another terminal window you'll run `gatsby develop` to see your changes in action. Make sure you run `yarn bootstrap` in the root of this repo first, though.

## Plugin Architecture

To gain additional context on how this plugin is architected and where different areas of the codebase live, refer to the [`ARCHITECTURE.md` file](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-wordpress/ARCHITECTURE.md).

### Writing and Running Tests

Refer to the docs on [how tests are run](./tests.md). Unit tests should be added to a `__tests__` directory in the directory of the file they're testing. Integration and e2e tests should be added to the `integration-tests` directory at the root of this repo.

## Docs Contributions

Refer to the [main Gatsby docs on documentation contributions](https://www.gatsbyjs.com/contributing/docs-contributions/).
