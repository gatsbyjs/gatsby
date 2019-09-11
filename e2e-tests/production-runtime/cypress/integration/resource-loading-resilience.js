Cypress.on(`uncaught:exception`, (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  console.log(err)
  return false
})

const waitForAPIOptions = {
  timeout: 3000,
}

const runTests = (
  blockedPath = `Default`,
  options = { alternate: false, link: false, stay: false }
) => {
  const shouldLink = options.alternate && options.link

  it(`Loads index - ${blockedPath}`, () => {
    const currentPath = `/`
    const assertShouldBe =
      blockedPath === currentPath && shouldLink ? `404` : `index`
    cy.visit(`/`).waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
    cy.getTestElement(`dom-marker`).contains(assertShouldBe)
  })

  it(`Navigates to second page - ${blockedPath}`, () => {
    const currentPath = `/`
    const toPath = `/page-2/`
    const isCurrentBlocked = currentPath === blockedPath
    const toPathIsBlocked = toPath === blockedPath
    if (isCurrentBlocked && options.alternate) {
      cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      cy.getTestElement(`dom-marker`).contains(`404`)
    } else if (toPathIsBlocked && options.stay) {
      cy.getTestElement(`page2`).click()
      cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      cy.getTestElement(`dom-marker`).contains(`index`)
    } else {
      const assertShouldBe =
        toPath === blockedPath && shouldLink ? `404` : `page-2`
      cy.getTestElement(`page2`).click()
      cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      cy.getTestElement(`dom-marker`).contains(assertShouldBe)
    }
  })

  it(`Navigates to 404 page - ${blockedPath}`, () => {
    cy.get(`[data-testid="dom-marker"]`)
      .invoke(`text`)
      .then(currentDom => {
        const currentPath = `/page-2`
        const toPath = `/404.html`
        const isCurrentBlocked = currentPath === blockedPath
        if (currentDom.includes(`page-2`)) {
          if (isCurrentBlocked && options.alternate) {
            cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
            cy.getTestElement(`dom-marker`).contains(`404`)
          } else {
            const assertShouldBe =
              toPath === blockedPath && options.safeNotFound ? `page-2` : `404`
            cy.getTestElement(`404`).click()
            cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
            cy.getTestElement(`dom-marker`).contains(assertShouldBe)
          }
        } else {
          cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
          cy.getTestElement(`dom-marker`).contains(currentDom)
        }
      })
  })

  it(`Loads 404 - ${blockedPath}`, () => {
    cy.visit(`/page-3/`, {
      failOnStatusCode: false,
    }).waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Can navigate from 404 to index - ${blockedPath}`, () => {
    const toPath = `/`
    const assertShouldBe =
      toPath === blockedPath && shouldLink ? `404` : `index`
    if (toPath === blockedPath && options.stay) {
      cy.getTestElement(`index`).click()
      cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      cy.getTestElement(`dom-marker`).contains(`404`)
    } else {
      cy.getTestElement(`index`).click()
      cy.waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      cy.getTestElement(`dom-marker`).contains(assertShouldBe)
    }
  })
}

describe(`Every resources available`, () => {
  it(`Restore resources`, () => {
    cy.task(`restoreAllBlockedResources`)
  })
  runTests()
})

const runBlockedScenario = (scenario, args) => {
  describe(`Block resources`, () => {
    before(done => {
      cy.task(`restoreAllBlockedResources`).then(() => {
        cy.task(scenario, args).then(() => {
          done()
        })
      })
    })
    runTests(args.pagePath, args.options)
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
        options: {
          alternate: true,
          link: true,
          safeNotFound: true,
        },
      })
    })
    describe(`Missing "${label}" page page-template asset`, () => {
      runBlockedScenario(`blockAssetsForPage`, {
        pagePath,
        filter: `page-template`,
        options: {
          alternate: false,
          link: true,
          stay: true,
          safeNotFound: true,
        },
      })
    })
    describe(`Missing "${label}" page extra assets`, () => {
      runBlockedScenario(`blockAssetsForPage`, {
        pagePath,
        filter: `extra`,
        options: {
          alternate: false,
          link: false,
        },
      })
    })
    describe(`Missing all "${label}" page assets`, () => {
      runBlockedScenario(`blockAssetsForPage`, {
        pagePath,
        filter: `all`,
        options: {
          alternate: false,
          link: false,
        },
      })
    })
  })
}

// runSuiteForPage(`Index`, `/`)
runSuiteForPage(`Page-2`, `/page-2/`)
// runSuiteForPage(`404`, `/404.html`)

describe(`Cleanup`, () => {
  it(`Restore resources`, () => {
    cy.task(`restoreAllBlockedResources`)
  })
})
