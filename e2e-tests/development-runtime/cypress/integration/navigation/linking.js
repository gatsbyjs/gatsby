describe(`navigation`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`displays content from other pages`, () => {
    cy.visit(`/page-2`).waitForRouteChange()

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

  it(`can navigate back using history`, () => {
    cy.getTestElement(`page-two`)
      .click()
      .waitForRouteChange()

    cy.go(`back`).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  describe(`non-existent route`, () => {
    beforeEach(() => {
      cy.getTestElement(`broken-link`)
        .click()
        .waitForRouteChange()
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

  describe(`Supports unicode characters in urls`, () => {
    it(`Can navigate directly`, () => {
      cy.visit(`/안녕`).waitForRouteChange()
      cy.getTestElement(`page-2-message`)
        .invoke(`text`)
        .should(`equal`, `Hi from the second page`)
    })

    it(`Can navigate on client`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.getTestElement(`page-with-unicode-path`)
        .click()
        .waitForRouteChange()

      cy.getTestElement(`page-2-message`)
        .invoke(`text`)
        .should(`equal`, `Hi from the second page`)
    })

    it(`should show 404 page when url with unicode characters point to a non-existent page route when navigating directly`, () => {
      cy.visit(`/안녕404/`, {
        failOnStatusCode: false,
      }).waitForRouteChange()

      cy.get(`h1`)
        .invoke(`text`)
        .should(`eq`, `Gatsby.js development 404 page`)
    })

    it(`should show 404 page when url with unicode characters point to a non-existent page route when navigating on client`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.window()
        .then(win => win.___navigate(`/안녕404/`))
        .waitForRouteChange()

      cy.get(`h1`)
        .invoke(`text`)
        .should(`eq`, `Gatsby.js development 404 page`)
    })
  })
})
