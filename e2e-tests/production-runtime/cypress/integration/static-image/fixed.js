const fixedTestId = `image-fixed`

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/fixed`).waitForRouteChange()
  })

  it(`applies height and width to wrapper`, () => {
    cy.getTestElement(fixedTestId)
      .find(`.gatsby-image-wrapper`)
      .should(`have.attr`, `style`)
      .and(style => {
        ;[`height:`, `width:`].forEach(part => {
          expect(style).contains(part)
        })
      })
  })

  it(`works on png files`, () => {
    cy.getTestElement(`image-fixed-png`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })

  it(`works on relative paths outside of src`, () => {
    cy.getTestElement(`image-fixed-relative`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })

  it(`includes sizes attribute`, () => {
    cy.getTestElement(fixedTestId)
      .find(`[data-main-image]`)
      .should(`have.attr`, `sizes`)
      .should(`equal`, `500px`)
  })
})
