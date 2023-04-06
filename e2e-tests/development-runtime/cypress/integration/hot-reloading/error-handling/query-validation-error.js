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

describe(`testing error overlay and ability to automatically recover from query extraction validation errors`, { testIsolation: false }, () => {
  before(() => {
    cy.visit(`/error-handling/query-validation-error/`).waitForRouteChange()
  })

  it(`displays content initially (no errors yet)`, () => {
    cy.findByTestId(`hot`).should(`contain.text`, `Working`)
  })

  it(`displays error with overlay on compilation errors`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/query-validation-error.js --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )

    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-labelledby`)
      .should(`contain.text`, `Unhandled GraphQL Error`)
    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-describedby`)
      .should(
        `contain.text`,
        `One unhandled GraphQL error found in your files. See the list below to fix it:`
      )
    cy.getFastRefreshOverlay()
      .find(
        `[data-gatsby-overlay="accordion"] [data-gatsby-overlay="accordion__item__title"]`
      )
      .should(
        `contain.text`,
        `Cannot query field "fieldThatDoesNotExistOnSiteMapType" on type "SiteSiteMetadata".`
      )
  })

  it(`can recover without need to refresh manually`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/query-validation-error.js --replacements "Working:Updated" --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )

    cy.findByTestId(`hot`).should(`contain.text`, `Updated`)
    cy.assertNoFastRefreshOverlay()
  })
})
