declare global {
  namespace Cypress {
    interface Chainable {
      waitForRouteChange: typeof waitForRouteChange
      waitForAPI: typeof waitForAPI
      waitForAPIorTimeout: typeof waitForAPIorTimeout
    }
  }
}

export interface WaitForApiOrTimeoutOptions {
  timeout?: number
}

/**
 * Waits for Gatsby to finish the route change, in order to ensure event handlers are properly setup
 * @example
 * cy.visit(`/page-2`).waitForRouteChange()
 */
export declare const waitForRouteChange: () => Chainable<JQuery>
/**
 * Waits for a specific Gatsby API to finish
 * @example
 * cy.waitForAPI(`onRouteUpdate`).get(`#element-with-event-handler`).click()
 */
export declare const waitForAPI: (lifeCycleName: string) => Chainable<JQuery>
/**
 * Waits for a specific Gatsby API to finish. It timeouts if it doesn't finish.
 * @example
 * cy.waitForAPIorTimeout(`onRouteUpdate`)
 */
export declare const waitForAPIorTimeout: (lifeCycleName: string, options?: WaitForApiOrTimeoutOptions) => Chainable<JQuery>
export {}