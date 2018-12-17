const FILE_CONTENT = `
---
title: A new post
date: ${new Date().toJSON()}
---

A brand new post

`.trim()

describe(`on new file`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })

  /*
   * TODO: This seems to cause a page re-load
   */
  it.skip(`re-runs GraphQL queries with new file contents`, () => {
    cy.exec(
      `npm run update -- --file content/sample.md --file-content '${JSON.stringify(
        FILE_CONTENT
      )}'`
    )

    cy.get(`ul`)
      .find(`li`)
      .its(`length`)
      .should(`be.gt`, 1)
  })
})
