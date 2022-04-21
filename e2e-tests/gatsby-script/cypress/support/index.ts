/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get a record from a table cell in one of the test components.
       * @example cy.getRecord(Script.dayjs, ResourceRecord.fetchStart)
       * @example cy.getRecord(`${ScriptStrategy.preHydrate}-${InlineScript.dangerouslySet}`, MarkRecord.executeStart)
       */
      getRecord(
        key: string,
        metric: string,
        raw?: boolean
      ): Chainable<number | string>
    }
  }
}

import "gatsby-cypress"

Cypress.Commands.add(`getRecord`, (key, metric, raw = false) => {
  return cy
    .get(`[id=${key}] [id=${metric}]`)
    .invoke(`text`)
    .then(value => (raw ? value : Number(value)))
})
