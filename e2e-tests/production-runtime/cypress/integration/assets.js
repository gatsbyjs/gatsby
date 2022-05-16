describe(`webpack assets`, () => {
  beforeEach(() => {
    cy.intercept("/gatsby-astronaut.png").as("static-folder-image")
    // Should load two files: normal and italic
    cy.intercept("/static/merriweather-latin-300**.woff2").as("font")
    cy.intercept("/static/gatsby-astronaut-**.png").as("img-import")
    cy.visit(`/assets/`).waitForRouteChange()
  })

  // Service worker is handling requests so this one is cached by previous runs
  if (!Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    it(`should only create one font file (no duplicates with different hashes)`, () => {
      // Check that there is no duplicate files (should have italic as second request, not another normal font)
      let filesNeeded = [
        new RegExp(`merriweather-latin-300-`, 'i'),
        new RegExp(`merriweather-latin-300italic-`, 'i'),
      ]

      let totalFiles = filesNeeded.length

      // cy.wait enough times to catch all files
      for (let i = 0; i < totalFiles; i++) {

        // match each one in a list since requests are not deterministic
        cy.wait("@font").should(req => {
          let matched = false;
          for (let i = 0; i < filesNeeded.length; i++) {
            if (filesNeeded[i].test(req.response.url)) {
              matched = true;
              filesNeeded.splice(i, 1)
            }
          }

          expect(matched).to.be.equal(true)
        })
      }
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
