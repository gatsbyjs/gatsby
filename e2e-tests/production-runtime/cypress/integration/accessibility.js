describe(`focus managment`, () => {
  before(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`Focus router wrapper after navigation`, () => {
    cy.getTestElement(`page2`)
      .click()
      .waitForRouteChange()

    cy.routerWrapperFocused()

    cy.getTestElement(`index-link`)
      .click()
      .waitForRouteChange()

    cy.routerWrapperFocused()
  })
})
