const fixedTestId = `image-fixed`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`does not render a spacer div`, () => {
    cy.getTestElement(
      fixedTestId,
      `.gatsby-image-outer-wrapper > .gatsby-image-wrapper > div`
    ).should(`not.exist`)
  })

  it(`renders an image with fixed height`, () => {
    cy.getTestElement(fixedTestId, `.gatsby-image-wrapper`)
      .should(`have.attr`, `style`)
      .and(`match`, /height:\d+/)
  })

  it(`renders an image with fixed width`, () => {
    cy.getTestElement(fixedTestId, `.gatsby-image-wrapper`)
      .should(`have.attr`, `style`)
      .and(`match`, /width:\d+/)
  })
})
