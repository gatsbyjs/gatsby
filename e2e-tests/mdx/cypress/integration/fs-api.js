Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || ('Minified React error #425')) {
    return false
  }
})

describe(`creates pages using the file system routing API`, () => {
  it(`index`, () => {
    cy.visit("/fs-api/").waitForRouteChange()
    cy.contains(`src/pages/index.mdx`)
    cy.get(`h2`).invoke(`text`).should(`eq`, `Do you work`)
    cy.contains(`"slug": "/"`)
  })
  it(`another`, () => {
    cy.visit("/fs-api/another").waitForRouteChange()
    cy.contains(`src/pages/another.mdx`)
    cy.contains(`This is to add another source page for slugification.`)
    cy.contains(`"slug": "/another"`)
  })
  it(`post in deep directory`, () => {
    cy.visit("/fs-api/about/embedded").waitForRouteChange()
    cy.contains(`src/posts/about/embedded.mdx`)
    cy.contains(`This is a page that should include a slash slug`)
    cy.contains(`"slug": "/about/embedded"`)
  })
})
