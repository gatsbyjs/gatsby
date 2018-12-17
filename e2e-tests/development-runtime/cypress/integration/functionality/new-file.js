const FILE_CONTENT = `
---
title: A new post
date: ${new Date().toJSON()}
---

A brand new post

`.trim()

describe(`new file functionality`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })

  it(`re-runs GraphQL queries upon new file`, () => {
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
