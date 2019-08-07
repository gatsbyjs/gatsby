const runTests = ({
  skipLoad = {},
  skipNavigate = {},
  skipAll = false,
} = {}) => {
  it(`Loads index`, () => {
    const skip = skipLoad[`/`] || skipAll
    cy.visit(`/`).waitForAPI(`onRouteUpdate`, { skip })
    cy.getTestElement(`dom-marker`).contains(`index`)
  })

  it(`Navigates to second page`, () => {
    cy.getTestElement(`page2`).click()
    const skip = skipNavigate[`/page-2/`] || skipAll
    cy.waitForAPI(`onRouteUpdate`, { skip })
      .location(`pathname`)
      .should(`equal`, `/page-2/`)
    cy.getTestElement(`dom-marker`).contains(`page-2`)
  })

  it(`Navigates to 404 page`, () => {
    cy.getTestElement(`404`).click()
    const skip = skipNavigate[`/404.html`] || skipAll
    cy.waitForAPI(`onRouteUpdate`, { skip })
      .location(`pathname`)
      .should(`equal`, `/page-3/`)
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Loads 404`, () => {
    const skip = skipLoad[`/404.html`] || skipAll
    cy.visit(`/page-3/`, {
      failOnStatusCode: false,
    }).waitForAPI(`onRouteUpdate`, { skip })
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Can navigate from 404 to index`, () => {
    cy.getTestElement(`index`).click()
    const skip = skipNavigate[`/`] || skipAll
    cy.waitForAPI(`onRouteUpdate`, { skip })
      .location(`pathname`)
      .should(`equal`, `/`)
    cy.getTestElement(`dom-marker`).contains(`index`)
  })
}

describe(`Every resources available`, () => {
  it(`Restore resources`, () => {
    cy.task(`restoreAllBlockedResources`)
  })
  runTests()
})

const runBlockedScenario = (scenario, args) => {
  it(`Block resources`, () => {
    cy.task(`restoreAllBlockedResources`).then(() => {
      cy.task(scenario, args).then(() => {
        if (args.chunk === `app`) {
          runTests({ skipAll: true })
        } else if (args.pagePath === `/404.html`) {
          runTests({
            skipNavigate: { '/page-3/': true },
          })
        } else {
          runTests({
            skipNavigate: { [args.pagePath]: true },
            skipLoad: { [args.pagePath]: true },
          })
        }
        runTests()
      })
    })
  })
}

describe(`Missing top level resources`, () => {
  describe(`Deleted app chunk assets`, () => {
    runBlockedScenario(`blockAssetsForChunk`, { chunk: `app` })
  })
})

const runSuiteForPage = (label, pagePath) => {
  describe(`Missing "${label}" resources`, () => {
    describe(`Missing "${label}" page query results`, () => {
      runBlockedScenario(`blockAssetsForPage`, {
        pagePath,
        filter: `page-data`,
      })
    })
    describe(`Missing "${label}" page page-template asset`, () => {
      runBlockedScenario(`blockAssetsForPage`, {
        pagePath,
        filter: `page-template`,
      })
    })
    describe(`Missing "${label}" page extra assets`, () => {
      runBlockedScenario(`blockAssetsForPage`, {
        pagePath,
        filter: `extra`,
      })
    })
    describe(`Missing all "${label}" page assets`, () => {
      runBlockedScenario(`blockAssetsForPage`, {
        pagePath,
        filter: `all`,
      })
    })
  })
}

runSuiteForPage(`Index`, `/`)
runSuiteForPage(`Page-2`, `/page-2/`)
runSuiteForPage(`404`, `/404.html`)

describe(`Cleanup`, () => {
  it(`Restore resources`, () => {
    cy.task(`restoreAllBlockedResources`)
  })
})
