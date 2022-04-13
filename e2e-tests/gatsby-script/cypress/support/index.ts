/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get the performance record timestamp from a table cell and return it as a number.
       * Not for general use, expects a certain table structure.
       * @example cy.getResourceRecord(`@myRequestAlias`)
       */
      getResourceRecord(script: string, record: string): Chainable<number>
    }
  }
}

import "gatsby-cypress"

Cypress.Commands.add(`getResourceRecord`, (script, record) => {
  return cy
    .get(`[id=${script}] [id=${record}]`)
    .invoke(`text`)
    .then(timestamp => Number(timestamp))
})
