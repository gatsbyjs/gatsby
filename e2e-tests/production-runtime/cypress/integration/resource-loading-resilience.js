Cypress.on(`uncaught:exception`, (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  console.log(err)
  return false
})

const waitForAPIOptions = {
  timeout: 10000,
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

function runTests(testNameSuffix) {
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

const runBlockedScenario = args => {
  beforeEach(() => {
    cy.task("getAssetsForPage", {
      pagePath: args.pagePath,
      filter: args.filter,
    }).then(urls => {
      for (const url of urls) {
        cy.intercept(url, {
          statusCode: 404,
          body: "",
        })
        cy.log(`intercept ${url}`)
      }
    })
  })

  afterEach(() => {
    // check if assets are actually stubbed
    cy.task("getAssetsForPage", {
      pagePath: args.pagePath,
      filter: args.filter,
    }).then(urls => {
      expect(Object.keys(cy.state("routes")).length).to.equal(urls.length)
    })
  })

  runTests(`Blocked "${args.filter}" for "${args.pagePath}"`, {
    ...args,
    task: "getAssetsForPage",
  })
}

const runSuiteForPage = (label, pagePath) => {
  describe(`Missing "${label}" resources`, () => {
    describe(`Missing "${label}" page query results`, () => {
      runBlockedScenario({
        pagePath,
        filter: `page-data`,
      })
    })
    describe(`Missing "${label}" page page-template asset`, () => {
      runBlockedScenario({
        pagePath,
        filter: `page-template`,
      })
    })
    describe(`Missing "${label}" page extra assets`, () => {
      runBlockedScenario({
        pagePath,
        filter: `extra`,
      })
    })
    describe(`Missing all "${label}" page assets`, () => {
      runBlockedScenario({
        pagePath,
        filter: `all`,
      })
    })
  })
}

describe(`Every resources available`, () => {
  runTests(`Every resource available`)
})

describe(`Missing top level resources`, () => {
  describe(`Deleted app chunk assets`, () => {
    beforeEach(() => {
      cy.task("getAssetsForChunk", {
        filter: "app",
      }).then(urls => {
        for (const url of urls) {
          cy.intercept(url, {
            statusCode: 404,
            body: "",
          })
          cy.log(`intercept ${url}`)
        }
      })
    })

    afterEach(() => {
      // check if assets are actually stubbed
      cy.task("getAssetsForChunk", {
        filter: "app",
      }).then(urls => {
        expect(Object.keys(cy.state("routes")).length).to.equal(urls.length)
      })
    })

    runTests(`Blocked "app" chunk`)
  })
})

runSuiteForPage(`Index`, `/`)
runSuiteForPage(`Page-2`, `/page-2/`)
runSuiteForPage(`404`, `/404.html`)
