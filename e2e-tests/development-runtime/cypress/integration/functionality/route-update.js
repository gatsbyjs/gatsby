describe(`hooks`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`registers one route update on initial route`, () => {
    cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 1)
  })

  it(`registers new route update on page navigation`, () => {
    cy.getTestElement(`page-two`).click().waitForRouteChange()

    cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
  })
})
