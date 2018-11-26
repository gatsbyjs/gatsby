/* global Cypress cy */

import apiHandler, { waitForAPI } from "./api-handler"

Cypress.Commands.add(`getTestElement`, selector =>
  cy.get(`[data-testid="${selector}"]`)
)

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api) => {
    cy.window().then({ timeout: 9999 }, win => {
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
