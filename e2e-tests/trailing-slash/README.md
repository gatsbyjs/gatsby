# trailing-slash E2E Test

This Cypress suite tests the `trailingSlash` option inside `gatsby-config` and its various different settings it takes. When you want to work on it, start watching packages inside the `packages` and start `gatsby-dev-cli` in this E2E test suite.

Locally you can run for development:

```shell
TRAILING_SLASH=your-option yarn debug:develop
```

And for a build + serve:

```shell
TRAILING_SLASH=your-option yarn build && yarn debug:build
```
