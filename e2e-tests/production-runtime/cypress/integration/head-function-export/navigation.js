import { page, data } from "../../../shared-data/head-function-export.js"

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

// No need to test SSR navigation (anchor tags) because it's effectively covered in the html insertion tests

describe(`Head function export behavior during CSR navigation (Gatsby Link)`, () => {
  it(`should remove tags not on next page`, () => {
    cy.visit(page.basic).waitForRouteChange()

    cy.getTestElement(`extra-meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, data.static.extraMeta)

    cy.getTestElement(`gatsby-link`).click().waitForRouteChange()

    cy.get(`[data-testid="extra-meta"]`).should(`not.exist`)
  })

  it(`should add tags not on next page`, () => {
    cy.visit(page.basic).waitForRouteChange()

    cy.get(`[data-testid="extra-meta-2"]`).should(`not.exist`)

    cy.getTestElement(`gatsby-link`).click()

    cy.getTestElement(`extra-meta-2`)
      .invoke(`attr`, `content`)
      .should(`equal`, data.queried.extraMeta2)
  })

  it(`should not contain tags from old tags when we navigate to page without Head export`, () => {
    cy.visit(page.basic).waitForRouteChange()

    cy.getTestElement(`base`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.base)
    cy.getTestElement(`title`).should(`have.text`, data.static.title)
    cy.getTestElement(`meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, data.static.meta)
    cy.getTestElement(`noscript`).should(`have.text`, data.static.noscript)
    cy.getTestElement(`style`).should(`contain`, data.static.style)
    cy.getTestElement(`link`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.link)
    cy.getTestElement(`jsonLD`).should(`have.text`, data.static.jsonLD)

    cy.getTestElement(`navigate-to-page-without-head-export`)
      .click()
      .waitForRouteChange()

      cy.getTestElement(`base`).should(`not.exist`)
      cy.getTestElement(`title`).should(`not.exist`)
      cy.getTestElement(`meta`).should(`not.exist`)
      cy.getTestElement(`noscript`).should(`not.exist`)
      cy.getTestElement(`style`).should(`not.exist`)
      cy.getTestElement(`link`).should(`not.exist`)
      cy.getTestElement(`jsonLD`).should(`not.exist`)
  })

  /**
   * Technically nodes are always removed from the DOM and new ones added (in other words nodes are not reused with different data),
   * but since this is an implementation detail we'll still test the behavior we expect as if we didn't know that.
   */
  it(`should change meta tag values`, () => {
    // Initial load
    cy.visit(page.basic).waitForRouteChange()

    // Validate data from initial load
    cy.getTestElement(`base`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.base)
    cy.getTestElement(`title`).should(`have.text`, data.static.title)
    cy.getTestElement(`meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, data.static.meta)
    cy.getTestElement(`noscript`).should(`have.text`, data.static.noscript)
    cy.getTestElement(`style`).should(`contain`, data.static.style)
    cy.getTestElement(`link`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.link)

    // Navigate to a different page via Gatsby Link
    cy.getTestElement(`gatsby-link`).click().waitForRouteChange()

    // Validate data on navigated-to page
    cy.getTestElement(`base`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.queried.base)
    cy.getTestElement(`title`).should(`have.text`, data.queried.title)
    cy.getTestElement(`meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, data.queried.meta)
    cy.getTestElement(`noscript`).should(`have.text`, data.queried.noscript)
    cy.getTestElement(`style`).should(`contain`, data.queried.style)
    cy.getTestElement(`link`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.queried.link)

    // Navigate back to original page via Gatsby Link
    cy.getTestElement(`gatsby-link`).click().waitForRouteChange()

    // Validate data is same as initial load
    cy.getTestElement(`base`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.base)
    cy.getTestElement(`title`).should(`have.text`, data.static.title)
    cy.getTestElement(`meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, data.static.meta)
    cy.getTestElement(`noscript`).should(`have.text`, data.static.noscript)
    cy.getTestElement(`style`).should(`contain`, data.static.style)
    cy.getTestElement(`link`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.link)
  })
})
