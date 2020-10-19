Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

before(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/runtime-error.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/runtime-error.js --restore`
  )
})

const errorPlaceholder = `// runtime-error`
const errorReplacement = `window.a.b.c.d.e.f.g()`

describe(`testing error overlay and ability to automatically recover from runtime errors`, () => {
  it(`displays content initially (no errors yet)`, () => {
    cy.visit(`/error-handling/runtime-error/`).waitForRouteChange()
    cy.getTestElement(`hot`).invoke(`text`).should(`contain`, `Working`)
  })

  it(`displays error with overlay on runtime errors`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/runtime-error.js --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )

    cy.getOverlayIframe().contains(`Cannot read property`)
    // contains details
    cy.getOverlayIframe().contains(`src/pages/error-handling/runtime-error.js`)
    cy.screenshot()
  })

  it(`can recover without need to refresh manually`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/runtime-error.js --replacements "Working:Updated" --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )

    cy.getTestElement(`hot`).invoke(`text`).should(`contain`, `Updated`)
    cy.assertNoOverlayIframe()
    cy.screenshot()
  })
})
