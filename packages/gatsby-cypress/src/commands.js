/* global Cypress cy */

import apiHandler, { waitForAPI } from "./api-handler"

Cypress.Commands.add(`getTestElement`, (selector, options = {}) =>
  cy.get(`[data-testid="${selector}"]`, options)
)

const TIMEOUT = 9999

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api, { skip = false, timeout = TIMEOUT } = {}) => {
    Cypress.log({
      name: `waitForAPI`,
      message: api,
    })
    // skip when specified, usually when resources have been deleted
    // intentionally to simulate poor network
    if (skip) {
      console.log(`skipping`)
      cy.wait(300)
      return
    }

    cy.window({ log: false }).then({ timeout: timeout }, win => {
      if (!win.___apiHandler) {
        win.___apiHandler = apiHandler.bind(win)
      }

      return waitForAPI.call(win, api).then(() => subject)
    })
  }
)

Cypress.Commands.add(
  `waitForRouteChange`,
  {
    prevSubject: `optional`,
  },
  subject => cy.waitForAPI(`onRouteUpdate`).then(() => subject)
)
