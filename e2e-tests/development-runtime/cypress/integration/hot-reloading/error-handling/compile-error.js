before(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/compile-error.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/compile-error.js --restore`
  )
})

const errorPlaceholder = `// compile-error`
const errorReplacement = `a b`

describe(`testing error overlay and ability to automatically recover from webpack compile errors`, () => {
  beforeEach(() => {
    cy.visit(`/error-handling/compile-error/`).waitForRouteChange()
  })

  it(`displays content initially (no errors yet)`, () => {
    cy.findByTestId(`hot`).should(`contain.text`, `Working`)
  })

  it(`displays error with overlay on compilation errors`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/compile-error.js --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )

    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-labelledby`)
      .should(`contain.text`, `Failed to compile`)
    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-describedby`)
      .should(
        `contain.text`,
        `This error occurred during the build process and can only be dismissed by fixing the error.`
      )
    cy.getFastRefreshOverlay()
      .find(`[data-gatsby-overlay="header__cause-file"] span`)
      .should(`contain.text`, `./src/pages/error-handling/compile-error.js`)
    cy.getFastRefreshOverlay()
      .find(`[data-gatsby-overlay="body"] h2`)
      .should(`contain.text`, `Source`)
    cy.getFastRefreshOverlay().find(`[data-gatsby-overlay="body"] pre`)
  })

  it(`can recover without need to refresh manually`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/compile-error.js --replacements "Working:Updated" --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )

    cy.findByTestId(`hot`).should(`contain.text`, `Updated`)
    cy.assertNoFastRefreshOverlay()
  })
})
