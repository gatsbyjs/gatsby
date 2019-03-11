# gatsby-cypress

This package provies additional Cypress commands for use with testing Gatsby
websites. To use these commands, import the plugin in `cypress/support/index.js`
as follows:

```js
import "gatsby-cypress/commands"
```

You also need to expose a `CYPRESS_SUPPORT` environment variable to entirely eliminate any code relating to Cypress in the normal browser build. You can place it in your test script for example:

```
"test": "CYPRESS_SUPPORT=y npm run build && npm run start-server-and-test"
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
