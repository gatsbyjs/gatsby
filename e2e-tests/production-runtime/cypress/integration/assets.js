describe(`webpack assets`, () => {
  beforeEach(() => {
    cy.intercept("/gatsby-astronaut.png").as("static-folder-image")
    // Should load two files: normal and italic
    cy.intercept("/static/merriweather-latin-300-**.woff2").as("font-regular")
    cy.intercept("/static/merriweather-latin-300italic-**.woff2").as("font-italic")
    cy.intercept("/static/gatsby-astronaut-**.png").as("img-import")
    cy.visit(`/assets/`).waitForRouteChange()
  })

  // Service worker is handling requests so this one is cached by previous runs
  if (!Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    it(`should only create one font file (no duplicates with different hashes)`, () => {
      cy.wait("@font-regular").should(req => {
        expect(req.response.url).to.match(/merriweather-latin-300-/i)
      })
      
      cy.wait("@font-italic").should(req => {
        expect(req.response.url).to.match(/merriweather-latin-300italic-/i)
      })
    })

    it(`should load image import`, () => {
      cy.wait("@img-import").should(req => {
        expect(req.response.statusCode).to.be.gte(200).and.lt(400)
      })
    })

    it(`should load file import`, () => {
      cy.getTestElement('assets-pdf-import').should('have.attr', 'href').and('match', /\/static\/pdf-example-.*\.pdf/i)
    })
  }

  it(`should load static folder asset`, () => {
    cy.wait("@static-folder-image").should(req => {
      expect(req.response.statusCode).to.be.gte(200).and.lt(400)
    })
  })
})
