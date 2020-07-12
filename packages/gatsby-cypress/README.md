# gatsby-cypress

This package provides additional [Cypress](https://cypress.io/) commands for [testing Gatsby websites](/docs/end-to-end-testing/).

> **NOTE:** This package is _not_ required to use Gatsby and Cypress together. It only exists to add extra commands for convenience.

To use these commands, first install the necessary packages:

```shell
npm install cypress gatsby-cypress start-server-and-test --save-dev
```

## Add custom Gatsby testing commands

Next, add a new file located at `cypress/support/index.js` and add the Gatsby-specific Cypress commands:

```js:title=cypress/support/index.js
import "gatsby-cypress/commands"
```

Once imported, the following additional commands are available:

- `cy.waitForRouteChange()`: Waits for Gatsby to finish the route change, in
  order to ensure event handlers are properly setup. Example:

  ```js
  // after navigating to another page via a link
  cy.waitForRouteChange().get(`#element-with-event-handler`).click()
  ```

- [**no longer recommended**] `cy.getTestElement(selector)`: Selects elements where the `data-testid`
  attribute matches the value of `selector`. Example:

  ```jsx
  <button data-testid="btn-to-test">click me</button>
  ```

  ```js
  cy.getTestElement("btn-to-test").click()
  ```

  > **NOTE:** It’s recommended not to use test IDs. Instead, consider using [`cypress-testing-library`](https://github.com/testing-library/cypress-testing-library) and relying on `findByText` instead.

## Running Cypress tests in Gatsby

Add a new script in `package.json` to run the Cypress tests. A common name for this is `cy:open`.

You also need to expose a `CYPRESS_SUPPORT` environment variable to enable [Gatsby test utilities](https://github.com/gatsbyjs/gatsby/blob/1fb376f84ee538bac79824cd119bef6a17c19b33/packages/gatsby/cache-dir/api-runner-browser.js#L9-L18). Place it in your test script in `package.json`, for example:

```diff:title=package.json
  "scripts": {
    ... other scripts ...
+   "cy:open": "cypress open",
+   "test:dev": "CYPRESS_SUPPORT=y start-server-and-test develop http://localhost:8000 cy:open",
+   "test": "CYPRESS_SUPPORT=y npm run build && start-server-and-test serve http://localhost:9000 cy:open"
  }
```

> **NOTE:** `test:dev` runs the site in development mode, which allows you to quickly fix and retest any issues. `test` is better suited for build systems like Circle CI, Travis CI, etc.

## Writing Cypress tests for Gatsby pages

Add tests by creating a spec file. We recommend starting with a `cypress/integrations/index.spec.js` to test the home page:

```js
context("Homepage", () => {
  beforeEach(() => {
    cy.visit(`http://localhost:8000`)
    cy.waitForRouteChange()
  })

  it("has focusable buttons", () => {
    cy.findByText("click me").focus()
    cy.focused().should("have.text", "click me")
  })
})
```
