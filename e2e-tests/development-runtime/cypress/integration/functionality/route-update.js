describe(`hooks`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })

  it(`registers one route update on initial route`, () => {
    cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 1)
  })

  it(`registers new route update on page navigation`, () => {
    cy.getTestElement(`page-two`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
  })
})
