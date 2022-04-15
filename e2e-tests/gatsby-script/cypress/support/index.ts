/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get a performance record timestamp from a table cell in `<ScriptResourceRecords />` and return it as a number.
       * @example cy.getResourceRecord(Script.dayjs, ResourceRecord.fetchStart)
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
