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

describe(`head function export html insertion`, () => {
  it(`should work with hardcoded data`, () => {
    cy.visit(page.basic)
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

  it(`should work with data from a page query`, () => {
    cy.visit(page.pageQuery)
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
  })

  it(`should work when a head function with harcoded data is re-exported from the page`, () => {
    cy.visit(page.reExport)
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

  it(`should work when an imported head component with queried data is used`, () => {
    cy.visit(page.staticQuery)
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
  })

  it(`should work when an imported head component with queried data and extra/overridden properties is used`, () => {
    cy.visit(page.staticQueryOverride)
    cy.getTestElement(`base`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.queried.base)
    cy.getTestElement(`title`).should(`have.text`, `Override title`)
    cy.getTestElement(`description`)
      .invoke(`attr`, `content`)
      .should(`equal`, `An extra description`)
    cy.getTestElement(`meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, data.queried.author)
    cy.getTestElement(`noscript`).should(`have.text`, data.queried.noscript)
    cy.getTestElement(`style`).should(`contain`, data.queried.style)
    cy.getTestElement(`link`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.queried.link)
  })
})
