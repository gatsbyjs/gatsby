/* global Cypress cy */

import apiHandler, { waitForAPI } from "./api-handler"

Cypress.Commands.add(`getTestElement`, selector =>
  cy.get(`[data-testid="${selector}"]`)
)

const TIMEOUT = 9999

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api, { timeout = TIMEOUT } = {}) => {
    cy.window().then({ timeout: timeout }, win => {
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
  (subject, api, { timeout = TIMEOUT } = {}) => {
    cy.window().then({ timeout: timeout + 1000 }, win => {
      if (!win.___apiHandler) {
        win.___apiHandler = apiHandler.bind(win)
      }
      return Promise.race([
        waitForAPI.call(win, api).then(() => subject),
        new Promise(resolve => {
          setTimeout(resolve, timeout)
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
