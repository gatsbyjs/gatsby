const tracedTestId = `image-traced`

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) {
    return false
  }
})

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/traced`).waitForRouteChange()
  })

  it(`renders a traced svg`, () => {
    cy.getTestElement(tracedTestId)
      .find(`.gatsby-image-wrapper > img`)
      .should(`have.attr`, `src`)
      .and(src => {
        ;[`data:image/svg+xml`].forEach(part => expect(src).to.include(part))
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
