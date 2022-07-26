const fluidTestId = `image-fluid`

describe(`full-width`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/full-width`).waitForRouteChange()
  })

  it(`works on png files`, () => {
    cy.getTestElement(`image-fluid-png`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })

  it(`works on relative paths outside of src`, () => {
    cy.getTestElement(`image-fluid-relative`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })

  it(`renders a spacer div`, () => {
    cy.getTestElement(fluidTestId)
      .find(`.gatsby-image-wrapper > div`)
      .should(`have.attr`, `style`)
      .and(`match`, /padding/)
  })

  it(`includes sizes attribute`, () => {
    cy.getTestElement(fluidTestId)
      .find(`[data-main-image]`)
      .should(`have.attr`, `sizes`)
      .should(`equal`, `100vw`)
  })
})
