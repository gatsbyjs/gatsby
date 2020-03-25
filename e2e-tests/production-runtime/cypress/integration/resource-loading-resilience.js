Cypress.on(`uncaught:exception`, (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  console.log(err)
  return false
})

const waitForAPIOptions = {
  timeout: 3000,
}

function assertOnNavigate(
  page = null,
  locationAssert,
  shouldLocationAssert,
  assertShouldBe
) {
  if (page) {
    cy.getTestElement(page).click()
  }
  cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
    .location(`pathname`)
    .should(locationAssert, shouldLocationAssert)
  cy.getTestElement(`dom-marker`).contains(assertShouldBe)
}

const runTests = (testNameSuffix = `Unknown scenario`) => {
  it(`Loads index - ${testNameSuffix}`, () => {
    cy.visit(`/`).waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
    cy.getTestElement(`dom-marker`).contains(`index`)
  })

  it(`Navigates to second page - ${testNameSuffix}`, () => {
    cy.getTestElement(`page2`).click()
    cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)

    cy.location(`pathname`).should(`equal`, `/page-2/`)
    cy.getTestElement(`dom-marker`).contains(`page-2`)
  })

  it(`Navigates to 404 page - ${testNameSuffix}`, () => {
    cy.getTestElement(`404`).click()
    cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
    cy.location(`pathname`).should(`equal`, `/page-3/`)
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Loads 404 - ${testNameSuffix}`, () => {
    cy.visit(`/page-3/`, {
      failOnStatusCode: false,
    }).waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)

    cy.location(`pathname`).should(`equal`, `/page-3/`)
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Can navigate from 404 to index - ${testNameSuffix}`, () => {
    cy.getTestElement(`index`).click()
    cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)

    cy.location(`pathname`).should(`equal`, `/`)
    cy.getTestElement(`dom-marker`).contains(`index`)
  })
}

const getTestNameSuffix = (scenario, args) => {
  if (scenario === `blockAssetsForChunk` && args.chunk === `app`) {
    return `Blocked "app" chunk`
  } else if (scenario === `blockAssetsForPage`) {
    return `Blocked "${args.filter}" for "${args.pagePath}"`
  }

  return undefined
}

const runBlockedScenario = (scenario, args) => {
  describe(`Block resources`, () => {
    before(done => {
      cy.task(`restoreAllBlockedResources`).then(() => {
        cy.task(scenario, args).then(() => {
          done()
        })
      })
    })

    runTests(getTestNameSuffix(scenario, args))
  })
}

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

describe(`Every resources available`, () => {
  it(`Restore resources`, () => {
    cy.task(`restoreAllBlockedResources`)
  })
  runTests(`Every resource available`)
})

describe(`Missing top level resources`, () => {
  describe(`Deleted app chunk assets`, () => {
    runBlockedScenario(`blockAssetsForChunk`, { chunk: `app` })
  })
})

runSuiteForPage(`Index`, `/`)
runSuiteForPage(`Page-2`, `/page-2/`)
runSuiteForPage(`404`, `/404.html`)

describe(`Cleanup`, () => {
  it(`Restore resources`, () => {
    cy.task(`restoreAllBlockedResources`)
  })
})
