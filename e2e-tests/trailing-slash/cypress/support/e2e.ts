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

Cypress.Commands.add(`assertRoute`, route => {
  cy.url().should(`equal`, `${window.location.origin}${route}`)
})
