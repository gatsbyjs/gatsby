/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get a record timestamp from a table cell in one of the test components and return it as a number.
       * @example cy.getRecord(Script.dayjs, ResourceRecord.fetchStart)
       * @example cy.getRecord(`${ScriptStrategy.preHydrate}-${InlineScript.dangerouslySet}`, MarkRecord.executeStart)
       */
      getRecord(key: string, metric: string): Chainable<number>
      waitForRouteChange(): unknown
    }
  }
}

import "gatsby-cypress"

Cypress.Commands.add(`getRecord`, (key, metric) => {
  return cy
    .get(`[id=${key}] [id=${metric}]`)
    .invoke(`text`)
    .then(timestamp => Number(timestamp))
})
