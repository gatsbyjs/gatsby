describe(`Scroll behaviour`, () => {
  it(`should restore scroll position only when going back in history`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`long-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.scrollTo(`bottom`)

    // allow ScrollContext to update scroll position store
    // it uses requestAnimationFrame so wait a bit to allow
    // it to store scroll position
    cy.wait(500)

    cy.getTestElement(`below-the-fold`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    // after going back we expect page will
    // be restore previous scroll position
    cy.go(`back`).waitForAPI(`onRouteUpdate`)

    cy.window().then(win => {
      expect(win.scrollY).not.to.eq(0, 0)
    })

    cy.go(`forward`).waitForAPI(`onRouteUpdate`)

    // after clicking link we expect page will be scrolled to top
    cy.getTestElement(`long-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.window().then(win => {
      expect(win.scrollY).to.eq(0, 0)
    })

    // reset to index page
    cy.getTestElement(`index-link`)
      .click()
      .waitForAPI(`onRouteUpdate`)
  })

  it(`should keep track of location.key`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`long-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`below-the-fold`)
      .scrollIntoView({
        // this is weird hack - seems like Cypress in run mode doesn't update scroll correctly
        duration: 100,
      })
      .wait(500) // allow ScrollContext to update scroll position store
      .storeScrollPosition(`middle-of-the-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`long-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`even-more-below-the-fold`)
      .scrollIntoView({
        // this is weird hack - seems like Cypress in run mode doesn't update scroll correctly
        duration: 100,
      })
      .wait(500) // allow ScrollContext to update scroll position store
      .storeScrollPosition(`bottom-of-the-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.go(`back`).waitForAPI(`onRouteUpdate`)

    cy.location(`pathname`)
      .should(`equal`, `/long-page/`)
      .wait(500)
      // we went back in hitsory 1 time, so we should end up at the bottom of the page
      .shouldMatchScrollPosition(`bottom-of-the-page`)
      .shouldNotMatchScrollPosition(`middle-of-the-page`)

    cy.go(`back`).waitForAPI(`onRouteUpdate`)
    cy.go(`back`).waitForAPI(`onRouteUpdate`)

    cy.location(`pathname`)
      .should(`equal`, `/long-page/`)
      .wait(500)
      // we went back in hitsory 2 more times, so we should end up in the middle of the page
      // instead of at the bottom
      .shouldMatchScrollPosition(`middle-of-the-page`)
      .shouldNotMatchScrollPosition(`bottom-of-the-page`)
  })
})
