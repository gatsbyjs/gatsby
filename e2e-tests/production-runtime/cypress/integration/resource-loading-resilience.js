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
      assertOnNavigate(null, `not`, `/page-2/`, `404`)
    } else if (toPathIsBlocked && options.stay) {
      assertOnNavigate(`page2`, `not`, `/page-2/`, `index`)
    } else {
      const [assertShouldBe, locationAssert] =
        toPath === blockedPath && shouldLink
          ? [`404`, `not`]
          : [`page-2`, `equal`]
      assertOnNavigate(`page2`, locationAssert, `/page-2/`, assertShouldBe)
    }
  })

  it(`Navigates to 404 page - ${blockedPath}`, () => {
    cy.get(`[data-testid="dom-marker"]`)
      .invoke(`text`)
      .then(currentDom => {
        const currentPath = `/page-2/`
        const toPath = `/404.html`
        const isCurrentBlocked = currentPath === blockedPath
        if (currentDom.includes(`page-2`)) {
          if (isCurrentBlocked && options.alternate) {
            assertOnNavigate(null, `not`, `/page-3/`, `404`)
          } else {
            const [assertShouldBe, locationAssert] =
              toPath === blockedPath && options.safeNotFound
                ? [`page-2`, `not`]
                : [`404`, `equal`]
            assertOnNavigate(`404`, locationAssert, `/page-3/`, assertShouldBe)
          }
        } else {
          assertOnNavigate(null, `not`, `/page-3/`, currentDom)
        }
      })
  })

  it(`Loads 404 - ${blockedPath}`, () => {
    cy.visit(`/page-3/`, {
      failOnStatusCode: false,
    })
      .waitForAPIorTimeout(`onRouteUpdate`, waitForAPIOptions)
      .location(`pathname`)
      .should(`equal`, `/page-3/`)
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`Can navigate from 404 to index - ${blockedPath}`, () => {
    const toPath = `/`
    if (toPath === blockedPath && options.stay) {
      assertOnNavigate(`index`, `equal`, `/page-3/`, `404`)
    } else {
      const [assertShouldBe, locationAssert] =
        toPath === blockedPath && shouldLink
          ? [`404`, `equal`]
          : [`index`, `not`]
      assertOnNavigate(`index`, locationAssert, `/`, assertShouldBe)
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
          stay: true && !Cypress.env(`TEST_PLUGIN_OFFLINE`),
          safeNotFound: true && !Cypress.env(`TEST_PLUGIN_OFFLINE`),
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
          alternate: false || Cypress.env(`TEST_PLUGIN_OFFLINE`),
          link: false || Cypress.env(`TEST_PLUGIN_OFFLINE`),
          safeNotFound: false || Cypress.env(`TEST_PLUGIN_OFFLINE`),
        },
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
