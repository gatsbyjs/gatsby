# gatsby-cypress

This package provides additional [Cypress](https://cypress.io/) commands for [testing Gatsby websites](/docs/end-to-end-testing/). To use these commands, first install the necessary packages:

```bash
npm install cypress gatsby-cypress --save-dev
```

Once you have installed Cypress, it will automatically create a place to install the Gatsby plugin,
in `cypress/support/index.js`:

```js:title=cypress/support/index.js
import "gatsby-cypress/commands"
```

You also need to expose a `CYPRESS_SUPPORT` environment variable to entirely eliminate any code relating to Cypress in the normal browser build. You can place it in your test script in `package.json`, for example:

```json:title=package.json
"test": "CYPRESS_SUPPORT=y npm run build && start-server-and-test develop http://localhost:8000 cypress open"
```

Once imported, the following additional commands are available:

- `cy.getTestElement(selector)`: Selects elements where the `data-testid`
  attribute matches the value of `selector`. Example:

  ```js
  cy.getTestElement(`post`).click()
  ```

- `cy.waitForRouteChange()`: Waits for Gatsby to finish the route change, in
  order to ensure event handlers are properly setup. Example:

  ```js
  // after navigating to another page via a link
  cy.waitForRouteChange()
    .get(`#element-with-event-handler`)
    .click()
  ```
