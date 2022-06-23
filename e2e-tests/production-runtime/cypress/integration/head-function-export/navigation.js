import { page, data } from "../../../shared-data/head-function-export.js"

// No need to test SSR navigation (anchor tags) because it's effectively covered in the html insertion tests

it(`head function export behavior during CSR navigation (Gatsby Link)`, () => {
  // Initial load
  cy.visit(page.basic)

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
  cy.getTestElement(`gatsby-link`).click()

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
  cy.getTestElement(`gatsby-link`).click()

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
