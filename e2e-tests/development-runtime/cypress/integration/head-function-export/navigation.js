const path = `/head-function-export`

const page = {
  basic: `${path}/basic`,
  pageQuery: `${path}/page-query`,
  reExport: `${path}/re-exported-function`,
  staticQuery: `${path}/static-query-component`,
  staticQueryOverride: `${path}/static-query-component-override`,
  warnings: `${path}/warnings`,
  allProps: `${path}/all-props`,
}

const data = {
  hardcoded: {
    base: `http://localhost:8000`,
    title: `Ella Fitzgerald's Page`,
    author: `Ella Fitzgerald`,
    noscript: `You take romance - I'll take Jell-O!`,
    style: `rebeccapurple`,
    link: `/used-by-head-function-export-basic.css`,
  },
  queried: {
    base: `http://localhost:8000`,
    title: `Nat King Cole's Page`,
    author: `Nat King Cole`,
    noscript: `There's just one thing I can't figure out. My income tax!`,
    style: `blue`,
    link: `/used-by-head-function-export-query.css`,
  },
}

// No need to test SSR navigation (anchor tags) because it's effectively covered in the html insertion tests

it(`head function export behavior during CSR navigation (Gatsby Link)`, () => {
  // Initial load
  cy.visit(page.basic)

  // Validate data from initial load
  cy.getTestElement(`base`)
    .invoke(`attr`, `href`)
    .should(`equal`, data.hardcoded.base)
  cy.getTestElement(`title`).should(`have.text`, data.hardcoded.title)
  cy.getTestElement(`meta`)
    .invoke(`attr`, `content`)
    .should(`equal`, data.hardcoded.author)
  cy.getTestElement(`noscript`).should(`have.text`, data.hardcoded.noscript)
  cy.getTestElement(`style`).should(`contain`, data.hardcoded.style)
  cy.getTestElement(`link`)
    .invoke(`attr`, `href`)
    .should(`equal`, data.hardcoded.link)

  // Navigate to a different page via Gatsby Link
  cy.getTestElement(`gatsby-link`).click()

  // Validate data on navigated-to page
  cy.getTestElement(`base`)
    .invoke(`attr`, `href`)
    .should(`equal`, data.queried.base)
  cy.getTestElement(`title`).should(`have.text`, data.queried.title)
  cy.getTestElement(`meta`)
    .invoke(`attr`, `content`)
    .should(`equal`, data.queried.author)
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
    .should(`equal`, data.hardcoded.base)
  cy.getTestElement(`title`).should(`have.text`, data.hardcoded.title)
  cy.getTestElement(`meta`)
    .invoke(`attr`, `content`)
    .should(`equal`, data.hardcoded.author)
  cy.getTestElement(`noscript`).should(`have.text`, data.hardcoded.noscript)
  cy.getTestElement(`style`).should(`contain`, data.hardcoded.style)
  cy.getTestElement(`link`)
    .invoke(`attr`, `href`)
    .should(`equal`, data.hardcoded.link)
})
