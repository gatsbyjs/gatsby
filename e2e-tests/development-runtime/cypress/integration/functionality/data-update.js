const FILE_CONTENT = `
---
title: A new post
date: ${new Date().toJSON()}
# foo: freshField
---

A brand new post

`.trim()

before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`on new file`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`re-runs GraphQL queries with new file contents`, () => {
    const content = JSON.stringify(FILE_CONTENT)
    cy.exec(
      `npm run update -- --file content/new-file.md --file-content \\"${content}\\"`
    )

    cy.get(`ul`).find(`li:nth-child(2)`).should(`exist`, 1)
  })
})

describe(`on schema change`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`rebuilds GraphQL schema`, () => {
    const content = JSON.stringify(FILE_CONTENT)
    cy.exec(
      `npm run update -- --file content/new-file.md --exact --replacements "# foo:foo" --file-content \\"${content}\\"`
    )
    cy.exec(
      `npm run update -- --file src/pages/schema-rebuild.js --exact --replacements "# foo:foo"`
    )

    cy.visit(`/schema-rebuild/`).waitForRouteChange()
    cy.get(`p`).contains(`"foo":"freshField"`)

    cy.exec(
      `npm run update -- --file src/pages/schema-rebuild.js --exact --replacements "foo: # foo"`
    )
  })
})
