describe(`navigation`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })

  it(`displays content from other pages`, () => {
    cy.visit(`/page-2`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`page-2-message`)
      .invoke(`text`)
      .should(`equal`, `Hi from the second page`)
  })

  it(`re-routes on link click`, () => {
    cy.getTestElement(`page-two`).click()

    cy.location(`pathname`).should(`equal`, `/page-2/`)
  })

  it(`can navigate to and from pages`, () => {
    cy.getTestElement(`page-two`).click()

    cy.getTestElement(`back-button`).click()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  /*
   * Browser API onRouteUpdate is not triggered on a 404
   */
  it.skip(`displays 404 page on broken link`, () => {
    cy.getTestElement(`broken-link`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.get(`h1`)
      .invoke(`text`)
      .should(`eq`, `Gatsby.js development 404 page`)
  })
})
