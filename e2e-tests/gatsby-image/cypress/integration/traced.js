const tracedTestId = `image-traced`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/traced`).waitForRouteChange()
  })

  it(`renders a traced svg`, () => {
    cy.getTestElement(tracedTestId)
      .find(`.gatsby-image-wrapper > img`)
      .should(`have.attr`, `src`)
      .and(src => {
        ;[`data:image/svg+xml`, `fill='white'`].forEach(part =>
          expect(src).to.include(part)
        )
      })
  })
})
