// https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Support-file

import "gatsby-cypress"

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Assert the current URL
       * @param route
       * @example cy.assertRoute('/page-2')
       */
      assertRoute(value: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

const PATH_PREFIX = Cypress.env(`PATH_PREFIX`) || ``

Cypress.Commands.add(`assertRoute`, route => {
  cy.url().should(`equal`, `${window.location.origin}${PATH_PREFIX}${route}`)
})
