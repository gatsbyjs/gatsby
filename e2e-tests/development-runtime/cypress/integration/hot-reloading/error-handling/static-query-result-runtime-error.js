Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

before(() => {
  cy.exec(
    `npm run update -- --file content/error-recovery/static-query.json --restore`
  )
  cy.exec(
    `npm run update -- --file src/pages/error-handling/static-query-result-runtime-error.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file content/error-recovery/static-query.json --restore`
  )
  cy.exec(
    `npm run update -- --file src/pages/error-handling/static-query-result-runtime-error.js --restore`
  )
})

const errorPlaceholder = `false`
const errorReplacement = `true`

describe(`testing error overlay and ability to automatically recover from runtime errors (static queries variant)`, () => {
  it(`displays content initially (no errors yet)`, () => {
    cy.visit(
      `/error-handling/static-query-result-runtime-error/`
    ).waitForRouteChange()
    cy.findByTestId(`hot`).should(`contain.text`, `Working`)
    cy.findByTestId(`results`)
      .should(`contain.text`, `"hasError": false`)
  })

  it(`displays error with overlay on runtime errors`, () => {
    cy.exec(
      `npm run update -- --file content/error-recovery/static-query.json  --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )

    // that's the exact error we throw and we expect to see that
    // cy.getOverlayIframe().contains(`Static query results caused runtime error`)
    // contains details
    // cy.getOverlayIframe().contains(
    //   `src/pages/error-handling/static-query-result-runtime-error.js`
    // )
  })

  it(`can recover without need to refresh manually`, () => {
    cy.exec(
      `npm run update -- --file content/error-recovery/static-query.json  --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )
    cy.exec(
      `npm run update -- --file src/pages/error-handling/static-query-result-runtime-error.js --replacements "Working:Updated" --exact`
    )

    cy.findByTestId(`hot`).should(`contain.text`, `Updated`)
    cy.findByTestId(`results`)
      .should(`contain.text`, `"hasError": false`)

    cy.assertNoFastRefreshOverlay()
  })
})
