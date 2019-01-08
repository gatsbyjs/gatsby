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
    cy.exec(`npm run chunks -- restore`)
  })
  runTests()
})

describe(`Missing top level resources`, () => {
  describe(`Deleted pages manifest`, () => {
    it(`Block resources`, () => {
      cy.exec(`npm run chunks -- restore`)
      cy.exec(`npm run chunks -- block pages-manifest`)
    })
    runTests()
  })

  describe(`Deleted app chunk assets`, () => {
    it(`Block resources`, () => {
      cy.exec(`npm run chunks -- restore`)
      cy.exec(`npm run chunks -- block app`)
    })
    runTests()
  })
})

const runSuiteForPage = (label, path) => {
  describe(`Missing "${label}" resources`, () => {
    describe(`Missing "${label}" page query results`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} query-result`)
      })
      runTests()
    })
    describe(`Missing "${label}" page page-template asset`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} page-template`)
      })
      runTests()
    })
    describe(`Missing "${label}" page extra assets`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} extra`)
      })
      runTests()
    })
    describe(`Missing all "${label}" page assets`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} all`)
      })
      runTests()
    })
  })
}

runSuiteForPage(`Index`, `/`)
runSuiteForPage(`Page-2`, `/page-2/`)
runSuiteForPage(`404`, `/404.html`)

describe(`Cleanup`, () => {
  it(`Restore resources`, () => {
    cy.exec(`npm run chunks -- restore`)
  })
})
