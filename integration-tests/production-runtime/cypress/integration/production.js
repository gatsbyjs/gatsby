/* global cy */

describe(`Production build tests`, () => {
  it(`should render properly`, () => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`should restore scroll position only when going back in history`, () => {
    cy.getTestElement(`long-page`)
      .click()
      .waitForRouteChange()

    cy.scrollTo(`bottom`)

    // allow ScrollContext to update scroll position store
    // it uses requestAnimationFrame so wait a bit to allow
    // it to store scroll position
    cy.wait(500)

    cy.getTestElement(`below-the-fold`)
      .click()
      .waitForRouteChange()

    // after going back we expect page will
    // be restore previous scroll position
    cy.go(`back`).waitForRouteChange()

    cy.window().then(win => {
      expect(win.scrollY).not.to.eq(0, 0)
    })

    cy.go(`forward`).waitForRouteChange()

    // after clicking link we expect page will be scrolled to top
    cy.getTestElement(`long-page`)
      .click()
      .waitForRouteChange()

    cy.window().then(win => {
      expect(win.scrollY).to.eq(0, 0)
    })

    // reset to index page
    cy.getTestElement(`index-link`)
      .click()
      .waitForRouteChange()
  })

  it(`should navigate back after a reload`, () => {
    cy.getTestElement(`page2`).click()

    cy.waitForRouteChange()
      .location(`pathname`)
      .should(`equal`, `/page-2/`)

    cy.reload().go(`back`)

    cy.waitForRouteChange()
      .getTestElement(`page2`)
      .should(`exist`)
      .location(`pathname`)
      .should(`equal`, `/`)
  })

  it(`should show 404 page when visiting non-existent page route`, () => {
    cy.getTestElement(`404`).click()

    cy.waitForRouteChange()
      .location(`pathname`)
      .should(`equal`, `/page-3/`)
      .getTestElement(`404`)
      .should(`exist`)
  })
})
