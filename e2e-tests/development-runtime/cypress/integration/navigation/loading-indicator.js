function toggleLoadingIndicator(command) {
  cy.then(() => fetch(`/___loading-indicator/${command}/`))
  cy.wait(5000)
}

const refresh = async payload => {
  return await fetch(`/__refresh/gatsby-source-query-on-demand-data/`, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`,
    },
    body: payload ? JSON.stringify({ updateData: payload }) : undefined,
  })
}

function assertIndicatorExists(doesExists) {
  cy.get(`[data-gatsby-loading-indicator="root"]`, { timeout: 10000 }).should(
    doesExists ? `exist` : `not.exist`
  )
}

function assertIndicatorVisible(isVisible) {
  cy.get(`[data-gatsby-loading-indicator="root"]`, { timeout: 10000 }).should(
    isVisible ? `be.visible` : `not.be.visible`
  )

  cy.screenshot()
}

function runTests({
  data,
  sleep,
  mode,
  expectIndicatorEnabled,
  expectIndicatorVisible,
}) {
  // make sure we are not on a page with query
  cy.visit(`/query-on-demand/no-query/`).waitForRouteChange()

  // setup data for page with query
  cy.then(() =>
    refresh({
      data,
      sleep,
    })
  )

  if (mode === `first-render`) {
    cy.visit(`/query-on-demand/possibly-heavy-query/`)
  } else if (mode === `client-navigation`) {
    cy.findByTestId(`heavy-query-page-link`).click()
  } else {
    throw new Error(
      `Unknown mode - should be one of ["first-render", "client-navigation"]`
    )
  }

  // we wait for first render or for client side navigation to complete when we expect for loading indicator
  // to show up (depending on test setup)
  if (expectIndicatorEnabled) {
    assertIndicatorExists(true)
    assertIndicatorVisible(expectIndicatorVisible)
  } else {
    assertIndicatorExists(false)
  }

  cy.waitForRouteChange()

  // once we finished first render or client side navigation - loading indicator should not be visible anymore (if it was before)
  if (expectIndicatorEnabled) {
    assertIndicatorExists(true)
    assertIndicatorVisible(false)
  } else {
    assertIndicatorExists(false)
  }

  // making sure our test setup was correct and expect query result is rendered
  cy.findByTestId(`query-data`).should(`have.text`, data)
}

describe(`Loading indicator`, () => {
  before(async () => {
    Cypress.config(`includeShadowDom`, true)
  })

  after(async () => {
    toggleLoadingIndicator(`auto`)
  })

  // we disable showing loading indicator in cypress by default
  // to not impact user tests - this is to make sure that's the case/catch regressions
  describe(`Defaults in cypress env (doesn't show indicator)`, () => {
    before(async () => {
      toggleLoadingIndicator(`auto`)
    })

    describe(`Page with light/quick query doesn't show indicator`, () => {
      const config = {
        sleep: 0,
        expectIndicatorEnabled: false,
        expectIndicatorVisible: `doesn't matter because indicator should not be enabled`,
      }

      it(`Initial first render`, () => {
        runTests({
          ...config,
          data: `quick-first-render-with-disabled-indicator`,
          mode: `first-render`,
        })
      })

      it(`On navigation`, () => {
        runTests({
          ...config,
          data: `quick-client-navigation-with-disabled-indicator`,
          mode: `client-navigation`,
        })
      })
    })

    describe(`Page with heavy/long running query doesn't show indicator (indicator is disabled)`, () => {
      const config = {
        sleep: 5000,
        expectIndicatorEnabled: false,
        expectIndicatorVisible: `doesn't matter because indicator should not be enabled`,
      }

      it(`Initial first render`, () => {
        runTests({
          ...config,
          data: `slow-first-render-with-disabled-indicator`,
          mode: `first-render`,
        })
      })

      it(`On navigation`, () => {
        runTests({
          ...config,
          data: `slow-client-navigation-with-disabled-indicator`,
          mode: `client-navigation`,
        })
      })
    })
  })

  describe(`With enabled loading indicator`, () => {
    before(async () => {
      toggleLoadingIndicator(`enable`)
    })

    describe(`Page with light/quick query doesn't show indicator`, () => {
      const config = {
        sleep: 0,
        expectIndicatorEnabled: true,
        expectIndicatorVisible: false,
      }

      it(`Initial first render`, () => {
        runTests({
          ...config,
          data: `quick-first-render-with-enabled-indicator`,
          mode: `first-render`,
        })
      })

      it(`On navigation`, () => {
        runTests({
          ...config,
          data: `quick-client-navigation-with-enabled-indicator`,
          mode: `client-navigation`,
        })
      })
    })

    describe(`Page with heavy/long running query shows indicator`, () => {
      const config = {
        sleep: 5000,
        expectIndicatorEnabled: true,
        expectIndicatorVisible: true,
      }

      it(`Initial first render`, () => {
        runTests({
          ...config,
          data: `slow-first-render-with-enabled-indicator`,
          mode: `first-render`,
        })
      })

      it(`On navigation`, () => {
        runTests({
          ...config,
          data: `slow-client-navigation-with-enabled-indicator`,
          mode: `client-navigation`,
        })
      })
    })
  })
})
