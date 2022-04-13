/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get the fetch start timestamp from a table cell and return it as a number.
       * Not for general use, expects a certain table structure.
       * @example cy.getFetchStartTimestamp(`@myRequestAlias`)
       */
      getFetchStartTimestamp(alias: string): Chainable<number>
    }
  }
}

import "gatsby-cypress"

Cypress.Commands.add(`getFetchStartTimestamp`, name => {
  return cy
    .get(`[id=${name}] [id=fetch-start]`)
    .invoke(`text`)
    .then(timestamp => Number(timestamp))
})
