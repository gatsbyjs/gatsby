const tracedTestId = `image-traced`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/traced`).waitForRouteChange()
  })

  it(`traced svg (falls back to DOMINANT_COLOR)`, () => {
    cy.getTestElement(tracedTestId)
      .find(`.gatsby-image-wrapper > [data-placeholder-image]`)
      .first()
      .should($el => {
        // traced falls
        expect($el.prop("tagName")).to.be.equal("DIV")
        expect($el).to.be.empty
      })
  })

  it(`works on png files`, () => {
    cy.getTestElement(`image-traced-png`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })

  it(`works on relative paths outside of src`, () => {
    cy.getTestElement(`image-traced-relative`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })
})
