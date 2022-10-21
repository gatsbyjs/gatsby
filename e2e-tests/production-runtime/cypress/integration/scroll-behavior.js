Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`Scroll behaviour`, () => {
  it(`should restore scroll position only when going back in history`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`long-page`).click().waitForRouteChange()

    cy.scrollTo(`bottom`)

    // allow ScrollContext to update scroll position store
    // it uses requestAnimationFrame so wait a bit to allow
    // it to store scroll position
    cy.wait(500)

    cy.getTestElement(`below-the-fold`).click().waitForRouteChange()

    // after going back we expect page will
    // be restore previous scroll position
    cy.go(`back`).waitForRouteChange()

    cy.window().then(win => {
      expect(win.scrollY).not.to.eq(0, 0)
    })

    cy.go(`forward`).waitForRouteChange()

    // after clicking link we expect page will be scrolled to top
    cy.getTestElement(`long-page`).click().waitForRouteChange()

    cy.window().then(win => {
      expect(win.scrollY).to.eq(0, 0)
    })

    // reset to index page
    cy.getTestElement(`index-link`).click().waitForRouteChange()
  })

  it(`should scroll to hashes - even with encoded characters`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.getTestElement(`long-page-id`).click().waitForRouteChange()

    // UI should auto scroll to the id with a matching hash
    cy.window().then(win => {
      let idScrollY = win.scrollY
      expect(win.scrollY).not.to.eq(0, 0)

      cy.scrollTo(`bottom`)
      cy.wait(500) // allow ScrollContext to update scroll position store
      cy.go(`back`).waitForRouteChange()
      cy.go(`forward`).waitForRouteChange()

      cy.window().then(updatedWindow => {
        expect(updatedWindow.scrollY).to.eq(idScrollY)
      })
    })
  })

  it(`should keep track of location.key`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`long-page`).click().waitForRouteChange()

    cy.getTestElement(`below-the-fold`)
      .scrollIntoView({
        // this is weird hack - seems like Cypress in run mode doesn't update scroll correctly
        duration: 100,
      })
      .wait(500) // allow ScrollContext to update scroll position store
      .storeScrollPosition(`middle-of-the-page`)
      .click()
      .waitForRouteChange()

    cy.getTestElement(`long-page`).click().waitForRouteChange()

    cy.getTestElement(`even-more-below-the-fold`)
      .scrollIntoView({
        // this is weird hack - seems like Cypress in run mode doesn't update scroll correctly
        duration: 100,
      })
      .wait(500) // allow ScrollContext to update scroll position store
      .storeScrollPosition(`bottom-of-the-page`)
      .click()
      .waitForRouteChange()

    cy.go(`back`).waitForRouteChange()

    cy.location(`pathname`)
      .should(`equal`, `/long-page/`)
      .wait(500)
      // we went back in hitsory 1 time, so we should end up at the bottom of the page
      .shouldMatchScrollPosition(`bottom-of-the-page`)
      .shouldNotMatchScrollPosition(`middle-of-the-page`)

    cy.go(`back`).waitForRouteChange()
    cy.go(`back`).waitForRouteChange()

    cy.location(`pathname`)
      .should(`equal`, `/long-page/`)
      .wait(500)
      // we went back in hitsory 2 more times, so we should end up in the middle of the page
      // instead of at the bottom
      .shouldMatchScrollPosition(`middle-of-the-page`)
      .shouldNotMatchScrollPosition(`bottom-of-the-page`)
  })
})
