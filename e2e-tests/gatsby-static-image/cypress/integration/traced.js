const tracedTestId = `image-traced`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/traced`).waitForRouteChange()
  })

  it(`renders a traced svg`, () => {
    cy.getTestElement(tracedTestId)
      .find(`.gatsby-image > img`)
      .should(`have.attr`, `src`)
      .and(src => {
        ;[`data:image/svg+xml`].forEach(part =>
          expect(src).to.include(part)
        )
      })
  })

  it(`works on png files`, () => {
    cy.getTestElement(`image-traced-png`)
      .find(`.gatsby-image`)
      .should(`exist`)
  })

  it(`works on relative paths outside of src`, () => {
    cy.getTestElement(`image-traced-relative`)
      .find(`.gatsby-image`)
      .should(`exist`)
  })

})
