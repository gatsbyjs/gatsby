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
    runTests({ skipNavigate: { '/page-3/': true } })
  })

  describe(`Deleted app chunk assets`, () => {
    it(`Block resources`, () => {
      cy.exec(`npm run chunks -- restore`)
      cy.exec(`npm run chunks -- block app`)
    })
    runTests({ skipAll: true })
  })
})

const runSuiteForPage = (label, path) => {
  // skip waiting for resources in tests when we know not to expect them
  // (i.e. when they have been intentionally deleted)
  const runTestsSkipping = () => {
    runTests({
      skipLoad: { [path]: true },
      skipNavigate: { [path]: true },
    })
  }

  describe(`Missing "${label}" resources`, () => {
    describe(`Missing "${label}" page query results`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} query-result`)
      })
      runTestsSkipping()
    })
    describe(`Missing "${label}" page page-template asset`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} page-template`)
      })
      runTestsSkipping()
    })
    describe(`Missing "${label}" page extra assets`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} extra`)
      })
      runTestsSkipping()
    })
    describe(`Missing all "${label}" page assets`, () => {
      it(`Block resources`, () => {
        cy.exec(`npm run chunks -- restore`)
        cy.exec(`npm run chunks -- block-page ${path} all`)
      })
      runTestsSkipping()
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
