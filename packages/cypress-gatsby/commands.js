/* global Cypress cy */

Cypress.Commands.add(`getTestElement`, selector =>
  cy.get(`[data-testid="${selector}"]`)
)

Cypress.Commands.add(
  `waitForRouteChange`,
  {
    prevSubject: `optional`,
  },
  subject =>
    cy.window({ log: false }).then({ timeout: 9999 }, win =>
      win.___waitForRouteChange().then(location => {
        Cypress.log({
          name: `wait for route change`,
          message: location.pathname,
          type: `parent`,
          consoleProps: () => {
            return {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            }
          },
        })
        return subject
      })
    )
)
