const fluidTestId = `image-fluid`

describe(`Production gatsby-image`, () => {
  beforeEach(() => {
    cy.visit(`/fluid`).waitForRouteChange()
  })

  describe(`wrapping elements`, () => {
    describe(`outer div`, () => {
      it(`exists`, () => {
        cy.getTestElement(fluidTestId)
          .find(`.gatsby-image-wrapper`)
          .its(`length`)
          .should(`eq`, 1)
      })

      it(`contains position relative`, () => {
        cy.getTestElement(fluidTestId)
          .find(`.gatsby-image-wrapper`)
          .should(`have.attr`, `style`)
          .and(`contains`, `position:relative`)
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

  describe(`fallback image`, () => {
    it(`renders base-64 src`, () => {
      cy.getTestElement(fluidTestId)
        .find(`.gatsby-image-wrapper > img`)
        .should(`have.attr`, `src`)
        .and(`contains`, `base64`)
    })
  })
})
