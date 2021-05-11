let spy
Cypress.on(`window:before:load`, win => {
  spy = cy.spy(win.console, `error`).as(`spyWinConsoleError`)
})

const runTests = () => {
  it(`should redirect page to index page when there is no such page`, () => {
    cy.visit(`/redirect-without-page`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
    cy.then(() => {
      const calls = spy.getCalls()

      const callsAboutRedirectMatchingPage = calls.filter(call =>
        call.args[0].includes(
          `matches both a page and a redirect; this is probably not intentional.`
        )
      )

      expect(callsAboutRedirectMatchingPage.length).to.equal(0)
    })
  })

  it(`should redirect page to index page even there is a such page`, () => {
    cy.visit(`/redirect`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
    cy.then(() => {
      const calls = spy.getCalls()

      const callsAboutRedirectMatchingPage = calls.filter(call =>
        call.args[0].includes(
          `matches both a page and a redirect; this is probably not intentional.`
        )
      )

      expect(callsAboutRedirectMatchingPage.length).not.to.equal(0)
      expect(spy).to.be.calledWith(
        `The route "/redirect" matches both a page and a redirect; this is probably not intentional.`
      )
    })
  })

  it(`should redirect to a dynamically-created replacement page`, () => {
    cy.visit(`/redirect-me/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/pt/redirect-me/`)
    cy.then(() => {
      expect(spy).not.to.be.calledWith(
        `The route "/redirect" matches both a page and a redirect; this is probably not intentional.`
      )

      cy.findByText(`This should be at /pt/redirect-me/`, {
        exact: false,
      }).should(`exist`)
    })
  })
}

describe(`redirect`, () => {
  describe(`404 is present`, () => {
    before(() => {
      cy.task(`restoreAllBlockedResources`)
    })

    // this is sanity check for this group
    it(`make sure 404 is present`, () => {
      cy.visit(`/______not_existing_page`, {
        failOnStatusCode: false,
      }).waitForRouteChange()
      cy.findByText(`Preview custom 404 page`).click()
      cy.findByText(`A custom 404 page wasn't detected`, {
        exact: false,
      }).should(`not.exist`)
      cy.findByText(
        `You just hit a route that does not exist... the sadness.`
      ).should(`exist`)
    })

    runTests()
  })

  describe(`no 404`, () => {
    before(() => {
      cy.task(`restoreAllBlockedResources`)

      cy.task(`blockAssetsForPage`, {
        pagePath: `/404`,
        filter: `page-data`,
      })
      cy.task(`blockAssetsForPage`, {
        pagePath: `/404.html`,
        filter: `page-data`,
      })
      cy.task(`blockPageComponent`, {
        path: `pages/404.js`,
      })
    })

    after(() => {
      cy.task(`restoreAllBlockedResources`)
    })

    it(`make sure 404 is NOT present`, () => {
      cy.visit(`/______not_existing_page`, {
        failOnStatusCode: false,
      }).waitForRouteChange()
      cy.findByText(`Preview custom 404 page`).click()
      cy.findByText(`A custom 404 page wasn't detected`, {
        exact: false,
      }).should(`exist`)
      cy.findByText(
        `You just hit a route that does not exist... the sadness.`,
        { exact: false }
      ).should(`not.exist`)
    })

    runTests()
  })
})
