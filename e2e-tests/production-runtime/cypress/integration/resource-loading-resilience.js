Cypress.on(`uncaught:exception`, (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  console.log(err)
  return false
})

const waitForAPIOptions = {
  timeout: 3000,
}

const runTests = () => {
  it(`Loads index`, () => {
    cy.visit(`/`).waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
    cy.getTestElement(`dom-marker`).contains(`index`)
  })

  it(`Navigates to second page`, () => {
    cy.getTestElement(`page2`).click()
    cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      .location(`pathname`)
      .should(`equal`, `/page-2/`)
    cy.getTestElement(`dom-marker`).contains(`page-2`)
  })

  it(`Navigates to 404 page`, () => {
    cy.getTestElement(`404`).click()
    cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      .location(`pathname`)
      .should(`equal`, `/page-3/`)
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Loads 404`, () => {
    cy.visit(`/page-3/`, {
      failOnStatusCode: false,
    }).waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Can navigate from 404 to index`, () => {
    cy.getTestElement(`index`).click()
    cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
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
