const fluidTestId = `image-fluid`

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

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
