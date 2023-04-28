# gatsby-cypress

This package provides additional [Cypress](https://cypress.io/) commands for [testing Gatsby websites](https://www.gatsbyjs.com/docs/how-to/testing/end-to-end-testing/).

**Please note:** This package is **not** required to use Gatsby and Cypress together. It only exists to add extra commands for convenience.

If you want to find elements (e.g. by test ID or by text/label/etc.), consider using [`@testing-library/cypress`](https://github.com/testing-library/cypress-testing-library).

## Installation

To use these commands, first install the necessary packages:

```shell
npm install gatsby-cypress --save-dev
```

## Adding custom Gatsby testing commands

Next, add a new file located at `cypress/support/e2e.ts` and add the Gatsby-specific Cypress commands:

```ts:title=cypress/support/e2e.ts
import "gatsby-cypress/commands"
```

If you're using TypeScript, add its types to Cypress' `tsconfig.json` file:

```json:title=cypress/tsconfig.json
{
  "compilerOptions": {
    // highlight-next-line
    "types": ["cypress", "gatsby-cypress"]
  },
  "include": ["."]
}
```

Once imported, the following additional commands are available:

- `cy.waitForRouteChange()`: Waits for Gatsby to finish the route change, in
  order to ensure event handlers are properly setup. Example:

  ```js
  cy.visit(`/page-2`).waitForRouteChange()
  ```

- `cy.waitForAPI('api-name')`: Waits for a specific Gatsby API to finish. Example:

  ```js
  cy.waitForAPI(`onRouteUpdate`).get(`#element-with-event-handler`).click()
  ```

- `cy.waitForAPIorTimeout('api-name')`: Waits for a specific Gatsby API to finish. It timeouts if it doesn't finish. Example:

  ```js
  cy.waitForAPIorTimeout(`onRouteUpdate`)
  ```

## Running Cypress tests in Gatsby

Read the [End-to-End Testing documentation](https://www.gatsbyjs.com/docs/how-to/testing/end-to-end-testing/) to learn how to use Cypress and Gatsby together.
