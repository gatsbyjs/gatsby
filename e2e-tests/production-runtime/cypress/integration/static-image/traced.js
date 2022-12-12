const tracedTestId = `image-traced`

Cypress.on("uncaught:exception", err => {
  if (
    (err.message.includes("Minified React error #418") ||
      err.message.includes("Minified React error #423") ||
      err.message.includes("Minified React error #425")) &&
    Cypress.env(`TEST_PLUGIN_OFFLINE`)
  ) {
    return false
  }
})

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
