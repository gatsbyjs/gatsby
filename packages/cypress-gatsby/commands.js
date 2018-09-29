/* global Cypress cy */

Cypress.Commands.add(`getTestElement`, selector =>
  cy.get(`[data-testid="${selector}"]`)
)

let resolve = null
let promise = null
let awaitingAPI = null
let resolvedAPIs = []

function waitForAPI(api) {
  promise = new Promise(r => {
    resolve = r
  })
  awaitingAPI = api

  if (resolvedAPIs.indexOf(api) !== -1) {
    // If the API has been marked as pre-resolved,
    // resolve immediately and reset the variables.
    resolve()
    awaitingAPI = null
    resolvedAPIs = []
  }
  return promise
}

function resolveAPIPromise(api) {
  if (!awaitingAPI) {
    // If we're not currently waiting for anything,
    // mark the API as pre-resolved.
    resolvedAPIs.push(api)
  } else if (api === awaitingAPI) {
    // If we've been waiting for something, now it's time to resolve it.
    awaitingAPI = null
    resolvedAPIs = []
    resolve()
  }
}

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api) => {
    cy.window().then({ timeout: 9999 }, win => {
      if (!win.___cypressAPIHandler) {
        win.___cypressAPIHandler = { waitForAPI, resolveAPIPromise }
      }

      return waitForAPI(api).then(() => subject)
    })
  }
)
