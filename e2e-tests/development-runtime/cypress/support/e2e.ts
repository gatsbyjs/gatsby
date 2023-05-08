import "gatsby-cypress"
import "@testing-library/cypress/add-commands"
import { addMatchImageSnapshotCommand } from "@simonsmith/cypress-image-snapshot/command"

addMatchImageSnapshotCommand({
  customDiffDir: `/__diff_output__`,
  customDiffConfig: {
    threshold: 0.1,
  },
  failureThreshold: 0.08,
  failureThresholdType: `percent`,
})

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Assert the current URL
       * @param route
       * @example cy.assertRoute('/page-2')
       */
      assertRoute(value: string): Chainable<JQuery<HTMLElement>>
      lifecycleCallCount(action: string): Chainable<number>
      lifecycleCallOrder(expectedActionCallOrder: Array<string>): Chainable<boolean>
      assertRouterWrapperFocus(shouldBeFocused?: boolean): Chainable<JQuery<HTMLElement>>
      navigateAndWaitForRouteChange(pathname: string): Chainable<JQuery<HTMLElement>>
      changeFocus(): Chainable<JQuery<HTMLElement>>
      waitForHmr(message?: string): Chainable<JQuery<HTMLElement>>
      getFastRefreshOverlay(): Chainable<JQuery<HTMLElement>>
      assertNoFastRefreshOverlay(): Chainable<JQuery<HTMLElement>>
      getRecord(key: string, metric: string, raw?: boolean): Chainable<string | number>
    }
  }
  interface Window {
    ___PageComponentLifecycleCallsLog: Array<{
      action: string
      pathname?: string
      pageComponent?: string
      locationPath?: string
      pagePath?: string
    }>
    ___navigate(to: string, options?: any): void
  }
}

Cypress.Commands.add(`lifecycleCallCount`, action =>
  cy
    .window()
    .then(
      win =>
        win.___PageComponentLifecycleCallsLog.filter(
          entry => entry.action === action
        ).length
    )
)

// This command is to find out that the lifecycle methods have
// been called in the expected order, not to check the exact order.
// It checks an array and makes sure that each item in the array is called at some point after the last.
// It will return a boolean value if the order has been called correctly according to what has been passed in.
Cypress.Commands.add(`lifecycleCallOrder`, expectedActionCallOrder =>
  cy.window().then(win => {
    const actions = win.___PageComponentLifecycleCallsLog
    const expectedActionCallOrderLength = expectedActionCallOrder.length
    const actionsLength = actions.length

    if (expectedActionCallOrderLength > actionsLength) {
      return false
    }

    let prevActionIndex = -1
    for (let i = 0; i < actionsLength; i += 1) {
      const nextActionIndex = prevActionIndex + 1

      // if the next action is found in the correct order
      if (actions[i].action === expectedActionCallOrder[nextActionIndex]) {
        prevActionIndex = nextActionIndex
      }
    }

    // if not all actions have been found then it has failed
    if (prevActionIndex !== expectedActionCallOrderLength - 1) {
      return false
    }

    return true
  })
)

Cypress.Commands.add(`assertRouterWrapperFocus`, (shouldBeFocused = true) =>
  cy
    .focused()
    .should(
      shouldBeFocused ? `have.attr` : `not.have.attr`,
      `id`,
      `gatsby-focus-wrapper`
    )
)

Cypress.Commands.add(
  `navigateAndWaitForRouteChange`,
  {
    prevSubject: `optional`,
  },
  (subject, pathname) => {
    cy.window().then(win => {
      win.___navigate(pathname)
    })

    return cy.waitForAPI(`onRouteUpdate`).then(() => subject)
  }
)

Cypress.Commands.add(
  `changeFocus`,
  {
    prevSubject: `optional`,
  },
  subject => {
    cy.get(`a`)
      .first()
      .focus()
      .then(() => subject)
  }
)

Cypress.Commands.add(`assertRoute`, route => {
  cy.url().should(`equal`, `${window.location.origin}${route}`)
})

// overwriting visit and creating a waitForHmr function to help us deal with HMR
Cypress.Commands.overwrite("visit", (orig, url, options = {}) => {
  const newOptions = {
    ...options,
    onBeforeLoad: win => {
      if (options.onBeforeLoad) {
        options.onBeforeLoad(win)
      }

      cy.spy(win.console, "log").as(`hmrConsoleLog`)
    },
  }

  // @ts-ignore - TODO: fix this
  return orig(url, newOptions)
})

Cypress.Commands.add(`waitForHmr`, (message = `App is up to date`) => {
  cy.get(`@hmrConsoleLog`).should(`be.calledWithMatch`, message)
  cy.wait(1000)
})

Cypress.Commands.add(`getFastRefreshOverlay`, () =>
  cy.get(`gatsby-fast-refresh`).shadow()
)

Cypress.Commands.add(`assertNoFastRefreshOverlay`, () =>
  cy.get(`gatsby-fast-refresh`).should(`not.exist`)
)

/**
 * Get a record from a table cell in one of the test components.
 * @example cy.getRecord(Script.dayjs, ResourceRecord.fetchStart)
 * @example cy.getRecord(`${ScriptStrategy.preHydrate}-${InlineScript.dangerouslySet}`, MarkRecord.executeStart)
 */
Cypress.Commands.add(`getRecord`, (key, metric, raw = false) => {
  return cy
    .get(`[id=${key}] [id=${metric}]`)
    .invoke(`text`)
    .then(value => (raw ? value : Number(value)))
})
