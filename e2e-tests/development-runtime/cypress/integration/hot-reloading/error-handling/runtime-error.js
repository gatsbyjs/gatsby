Cypress.on(
  `uncaught:exception`,
  (err, runnable) =>
    // returning false here prevents Cypress from
    // failing the test
    false
)

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

describe(`testing error overlay and ability to automatically recover from runtime errors`, { testIsolation: false }, () => {
  before(() => {
    cy.visit(`/error-handling/runtime-error/`, {
      // Hacky way to disable "uncaught:exception" message in error message itself
      // See https://github.com/cypress-io/cypress/issues/254#issuecomment-292190924
      onBeforeLoad: win => {
        win.onerror = null
      },
    }).waitForRouteChange()
  })

  it(`displays content initially (no errors yet)`, () => {
    cy.findByTestId(`hot`).should(`contain.text`, `Working`)
  })

  it(`displays error with overlay on runtime errors`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/runtime-error.js --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )

    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-labelledby`)
      .should(`contain.text`, `Unhandled Runtime Error`)
    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-describedby`)
      .should(
        `contain.text`,
        `One unhandled runtime error found in your files. See the list below to fix it:`
      )
    cy.getFastRefreshOverlay()
      .find(
        `[data-gatsby-overlay="accordion"] [data-gatsby-overlay="accordion__item__title"]`
      )
      .should(
        `contain.text`,
        `Error in function RuntimeError in ./src/pages/error-handling/runtime-error.js:4`
      )
    cy.getFastRefreshOverlay()
      .find(
        `[data-gatsby-overlay="accordion"] [data-gatsby-overlay="body__error-message"]`
      )
      .should(`contain.text`, `Cannot read properties of undefined (reading 'b')`)
    cy.getFastRefreshOverlay().find(`[data-gatsby-overlay="body"] pre`)
  })

  it(`can recover without need to refresh manually`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/runtime-error.js --replacements "Working:Updated" --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )

    cy.findByTestId(`hot`).should(`contain.text`, `Updated`)
    cy.assertNoFastRefreshOverlay()
  })
})
