const tracedTestId = `image-traced`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/traced`).waitForRouteChange()
  })

  it(`renders a traced svg`, () => {
    cy.getTestElement(tracedTestId)
      .find(`picture:nth-of-type(1) img`)
      .should(`have.attr`, `src`)
      .and(src => {
        ;[`data:image/svg+xml`, `fill='white'`].forEach(part =>
          expect(src).to.include(part)
        )
      })
  })
})
