before(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/query-validation-error.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/query-validation-error.js --restore`
  )
})

const errorPlaceholder = `# query-validation-error`
const errorReplacement = `fieldThatDoesNotExistOnSiteMapType`

describe(`testing error overlay and ability to automatically recover from query extraction validation errors`, () => {
  it(`displays content initially (no errors yet)`, () => {
    cy.visit(`/error-handling/query-validation-error/`).waitForRouteChange()
    cy.getTestElement(`hot`).invoke(`text`).should(`contain`, `Working`)
  })

  it(`displays error with overlay on compilation errors`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/query-validation-error.js --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )

    cy.getOverlayIframe().contains(`Failed to compile`)
    cy.getOverlayIframe().contains(`There was an error in your GraphQL query`)
    // make sure we mark location
    cy.getOverlayIframe().contains(
      `src/pages/error-handling/query-validation-error.js`
    )
    cy.screenshot()
  })

  it(`can recover without need to refresh manually`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/query-validation-error.js --replacements "Working:Updated" --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )

    cy.getTestElement(`hot`).invoke(`text`).should(`contain`, `Updated`)
    cy.assertNoOverlayIframe()
    cy.screenshot()
  })
})
