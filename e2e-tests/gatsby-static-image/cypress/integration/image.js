const fluidTestId = `image-fluid`

describe(`Production gatsby-image`, () => {
  beforeEach(() => {
    cy.visit(`/fullWidth`).waitForRouteChange()
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
