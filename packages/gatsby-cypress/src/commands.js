/* global Cypress cy */

import apiHandler, { waitForAPI } from "./api-handler"

// TODO(v6): Remove this command
Cypress.Commands.add(`getTestElement`, (selector, options = {}) =>
  cy.get(`[data-testid="${selector}"]`, options)
)

const TIMEOUT = 30000

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api, { timeout = TIMEOUT } = {}) => {
    Cypress.log({
      name: `waitForAPI`,
      message: api,
    })

    cy.window({ log: false }).then({ timeout: timeout }, win => {
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
