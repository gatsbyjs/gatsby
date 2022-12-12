const fluidTestId = `image-fluid`

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`Production gatsby-image`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/full-width`).waitForRouteChange()
  })

  describe(`wrapping elements`, () => {
    describe(`outer div`, () => {
      it(`exists`, () => {
        cy.getTestElement(fluidTestId)
          .find(`.gatsby-image-wrapper`)
          .its(`length`)
          .should(`eq`, 1)
      })
    })
  })

  describe(`invalid image`, () => {
    it(`will not appear`, () => {
      cy.getTestElement(`invalid-image`)
        .find(`.gatsby-image-wrapper`)
        .should(`not.exist`)
    })
  })
})
