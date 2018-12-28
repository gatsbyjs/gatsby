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

  describe(`non-existant route`, () => {
    beforeEach(() => {
      cy.getTestElement(`broken-link`)
        .click()
        .waitForAPI(`onRouteUpdate`)
    })

    it(`displays 404 page on broken link`, () => {
      cy.get(`h1`)
        .invoke(`text`)
        .should(`eq`, `Gatsby.js development 404 page`)

      /*
       * Two route updates:
       * - initial render of /
       * - (default) development 404 page
       */
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
    })

    it(`can display a custom 404 page`, () => {
      cy.get(`button`).click()

      cy.getTestElement(`page-title`)
        .invoke(`text`)
        .should(`eq`, `NOT FOUND`)

      /*
       * Two route updates:
       * - initial render
       * - 404 page
       * a re-render does not occur because the route remains the same
       */
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
    })
  })
})
