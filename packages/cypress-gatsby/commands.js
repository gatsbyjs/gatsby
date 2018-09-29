/* global Cypress cy */

Cypress.Commands.add(`getTestElement`, selector =>
  cy.get(`[data-testid="${selector}"]`)
)

let resolve, promise, awaitingAPI
function resetAPIPromise() {
  promise = new Promise(r => {
    resolve = r
  })
}
function waitForAPI(api) {
  awaitingAPI = api
  return promise
}
function resolveAPIPromise(api) {
  if (api === awaitingAPI) {
    resolve()
    resetAPIPromise()
    console.log(`resolving: ${api}`)
  } else {
    console.log(`not resolving: ${api}`)
  }
}
resetAPIPromise()

Cypress.Commands.add(
  `waitForAPI`,
  { prevSubject: `optional` },
  (subject, api) => {
    cy.window().then({ timeout: 9999 }, win => {
      if (!win.___cypressAPIHandler) {
        win.___cypressAPIHandler = { waitForAPI, resolveAPIPromise }
      }

      win.___cypressAPIHandler.waitForAPI(api).then(() => subject)
    })
  }
)

Cypress.Commands.add(
  `waitForRouteChange`,
  {
    prevSubject: `optional`,
  },
  subject =>
    cy.window({ log: false }).then({ timeout: 9999 }, win =>
      win.___waitForRouteChange().then(location => {
        Cypress.log({
          name: `wait for route change`,
          message: location.pathname,
          type: `parent`,
          consoleProps: () => {
            return {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            }
          },
        })
        return subject
      })
    )
)
