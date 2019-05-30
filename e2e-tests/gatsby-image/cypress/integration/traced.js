const tracedTestId = `image-traced`
const placeholderImage = `picture:nth-of-type(1)`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/traced`).waitForRouteChange()
  })

  it(`renders a traced svg`, () => {
    cy.getTestElement(tracedTestId)
      .find(`${placeholderImage} img`)
      .should(`have.attr`, `src`)
      .and(src => {
        ;[`data:image/svg+xml`, `fill='white'`].forEach(part =>
          expect(src).to.include(part)
        )
      })
  })
})
