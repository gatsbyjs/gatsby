/* global Cypress cy */

import apiHandler, { waitForAPI } from "./api-handler"

Cypress.Commands.add(`getTestElement`, selector =>
  cy.get(`[data-testid="${selector}"]`)
)

const TIMEOUT = 9999

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api) => {
    cy.window().then({ timeout: TIMEOUT }, win => {
      if (!win.___apiHandler) {
        win.___apiHandler = apiHandler.bind(win)
      }

      return waitForAPI.call(win, api).then(() => subject)
    })
  }
)

Cypress.Commands.add(
  `waitForAPIorTimeout`,
  { prevSubject: `optional` },
  (subject, api) => {
    cy.window().then({ timeout: TIMEOUT + 1000 }, win => {
      if (!win.___apiHandler) {
        win.___apiHandler = apiHandler.bind(win)
      }
      return Promise.race([
        waitForAPI.call(win, api).then(() => subject),
        new Promise(resolve => {
          setTimeout(resolve, TIMEOUT)
        }),
      ])
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
