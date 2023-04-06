Cypress.on(
  `uncaught:exception`,
  (err, runnable) =>
    // returning false here prevents Cypress from
    // failing the test
    false
)

before(() => {
  cy.exec(
    `npm run update -- --file content/error-recovery/page-query.json --restore`
  )
  cy.exec(
    `npm run update -- --file src/pages/error-handling/page-query-result-runtime-error.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file content/error-recovery/page-query.json --restore`
  )
  cy.exec(
    `npm run update -- --file src/pages/error-handling/page-query-result-runtime-error.js --restore`
  )
})

const errorPlaceholder = `false`
const errorReplacement = `true`

describe(`testing error overlay and ability to automatically recover runtime errors cause by content changes (page queries variant)`, { testIsolation: false } , () => {
  before(() => {
    cy.visit(`/error-handling/page-query-result-runtime-error/`, {
      // Hacky way to disable "uncaught:exception" message in error message itself
      // See https://github.com/cypress-io/cypress/issues/254#issuecomment-292190924
      onBeforeLoad: win => {
        win.onerror = null
      },
    }).waitForRouteChange()
  })

  it(`displays content initially (no errors yet)`, () => {
    cy.findByTestId(`hot`).should(`contain.text`, `Working`)
    cy.findByTestId(`results`).should(`contain.text`, `"hasError": false`)
  })

  it(`displays error with overlay on runtime errors`, () => {
    cy.exec(
      `npm run update -- --file content/error-recovery/page-query.json  --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
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
        `Error in function PageQueryRuntimeError in ./src/pages/error-handling/page-query-result-runtime-error.js:7`
      )
    cy.getFastRefreshOverlay()
      .find(
        `[data-gatsby-overlay="accordion"] [data-gatsby-overlay="body__error-message"]`
      )
      .should(`contain.text`, `Page query results caused runtime error`)
  })

  it(`can recover without need to refresh manually`, () => {
    cy.exec(
      `npm run update -- --file content/error-recovery/page-query.json  --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )
    cy.exec(
      `npm run update -- --file src/pages/error-handling/page-query-result-runtime-error.js --replacements "Working:Updated" --exact`
    )

    cy.findByTestId(`hot`).should(`contain.text`, `Updated`)
    cy.findByTestId(`results`).should(`contain.text`, `"hasError": false`)

    cy.assertNoFastRefreshOverlay()
  })
})
