const tracedTestId = `image-traced`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  // TODO: test this further
  it(`renders a traced svg`, () => {
    cy.getTestElement(tracedTestId)
      .find(`.gatsby-image-wrapper > img`)
      .should(`have.attr`, `src`)
      .and(`contains`, `data:image/svg+xml`)
  })
})
