Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`constrained`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/constrained`).waitForRouteChange()
  })

  it(`renders a spacer svg`, () => {
    cy.getTestElement(`image-constrained`)
      .find(`img[role=presentation]`)
      .should(`have.attr`, `src`)
      .and(`match`, /svg\+xml/)
  })

  it(`includes sizes attribute with default width`, () => {
    cy.getTestElement(`image-constrained`)
      .find(`[data-main-image]`)
      .should(`have.attr`, `sizes`)
      .and(`equal`, `(min-width: 4015px) 4015px, 100vw`)
  })

  it(`includes sizes attribute with specified width`, () => {
    cy.getTestElement(`image-constrained-limit`)
      .find(`[data-main-image]`)
      .should(`have.attr`, `sizes`)
      .and(`equal`, `(min-width: 500px) 500px, 100vw`)
  })

  it(`overrides sizes`, () => {
    cy.getTestElement(`image-constrained-override`)
      .find(`[data-main-image]`)
      .should(`have.attr`, `sizes`)
      .and(`equal`, `100vw`)
  })
})
