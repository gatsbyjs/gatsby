# cypress-gatsby

This package provies additional Cypress commands for use with testing Gatsby
websites. To use these commands, import the plugin in `cypress/support/index.js`
as follows:

```js
import "cypress-gatsby/commands"
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
