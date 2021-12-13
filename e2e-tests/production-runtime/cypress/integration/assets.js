describe(`webpack assets`, () => {
  beforeEach(() => {
    cy.intercept("/gatsby-astronaut.png").as("static-folder-image")
    cy.intercept("/static/merriweather-latin-300-**.woff2").as("font")
    cy.visit(`/assets/`).waitForRouteChange()
  })

  // Service worker is handling requests so this one is cached by previous runs
  if (!Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    it(`should only create one font file (no duplicates with different hashes)`, () => {
      console.log(cy.state('requests'))
      cy.wait("@font").should(req => {
        console.log('first', req)
      })
      cy.wait("@font").should(req => {
        console.log('second', req)
      })
    })
  }

  it(`todo`, () => {
    cy.getTestElement(`assets-img-static-folder`).should(`have.css`, `zIndex`, "auto")
  })
})
