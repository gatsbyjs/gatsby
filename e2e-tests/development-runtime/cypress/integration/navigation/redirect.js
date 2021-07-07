const runTests = () => {
  it(`should redirect page to index page when there is no such page`, () => {
    cy.visit(`/redirect-without-page`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  it(`should redirect page to index page even there is a such page`, () => {
    cy.visit(`/redirect`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  it(`should redirect to a dynamically-created replacement page`, () => {
    cy.visit(`/redirect-me/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/pt/redirect-me/`)
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
