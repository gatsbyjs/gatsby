/* global Cypress cy */

import { waitForAPI, resolveAPIPromise } from "./api-handler"

Cypress.Commands.add(`getTestElement`, selector =>
  cy.get(`[data-testid="${selector}"]`)
)

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api) => {
    cy.window().then({ timeout: 9999 }, win => {
      if (!win.___cypressAPIHandler) {
        win.___resolveAPIPromise = resolveAPIPromise.bind(win)
      }

      return waitForAPI.call(win, api).then(() => subject)
    })
  }
)
