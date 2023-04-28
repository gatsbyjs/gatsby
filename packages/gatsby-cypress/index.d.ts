declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Waits for Gatsby to finish the route change, in order to ensure event handlers are properly setup
       * @example
       * cy.visit(`/page-2`).waitForRouteChange()
       */
      waitForRouteChange: () => Chainable<Subject>
      /**
       * Waits for a specific Gatsby API to finish
       * @example
       * cy.waitForAPI(`onRouteUpdate`).get(`#element-with-event-handler`).click()
       */
      waitForAPI: (lifeCycleName: string) => Chainable<Subject>
      /**
       * Waits for a specific Gatsby API to finish. It timeouts if it doesn't finish.
       * @example
       * cy.waitForAPIorTimeout(`onRouteUpdate`)
       */
      waitForAPIorTimeout: (lifeCycleName: string, options?: WaitForApiOrTimeoutOptions) => Chainable<Subject>
    }
  }
}

export interface WaitForApiOrTimeoutOptions {
  timeout?: number
}

export {}