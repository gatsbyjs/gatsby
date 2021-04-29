Cypress.on(
  `uncaught:exception`,
  (err, runnable) =>
    // returning false here prevents Cypress from
    // failing the test
    false
)

before(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/dev-ssr-error.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file src/pages/error-handling/dev-ssr-error.js --restore`
  )
})

const errorPlaceholder = `// dev-ssr-error`
const errorReplacement = `const a = window.location.href`

describe(`testing error overlay for DEV_SSR errors`, () => {
  it(`displays content initially (no errors yet)`, () => {
    cy.visit(`/error-handling/dev-ssr-error/`, {
      // Hacky way to disable "uncaught:exception" message in error message itself
      // See https://github.com/cypress-io/cypress/issues/254#issuecomment-292190924
      onBeforeLoad: win => {
        win.onerror = null
      },
    }).waitForRouteChange()
    cy.findByTestId(`hot`).should(`contain.text`, `Working`)
  })

  it(`doesn't display error overlay after a save of the file`, () => {
    cy.exec(
      `npm run update -- --file src/pages/error-handling/dev-ssr-error.js --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )
    cy.findByTestId(`hot`).should(`contain.text`, `Working`)
    cy.assertNoFastRefreshOverlay()
  })

  it(`displays error overlay after a reload (due to SSR)`, () => {
    cy.reload()
    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-labelledby`)
      .should(`contain.text`, `Failed to server render (SSR)`)
    cy.getFastRefreshOverlay()
      .find(`[data-gatsby-overlay="header__cause-file"] span`)
      .should(`contain.text`, `src/pages/error-handling/dev-ssr-error.js`)
    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-describedby`)
      .should(
        `contain.text`,
        `React Components in Gatsby must render both successfully in the browser and in a Node.js environment. When we tried to render your page component in Node.js, it errored.`
      )
    cy.getFastRefreshOverlay().find(`[data-gatsby-overlay="body"] pre`)
  })

  it(`doesn't hide error overlay when reload page is pressed without fixing the error`, () => {
    cy.getFastRefreshOverlay().findByText(`Reload page`).click()
    cy.getFastRefreshOverlay()
      .find(`#gatsby-overlay-labelledby`)
      .should(`contain.text`, `Failed to server render (SSR)`)
  })

  it(`hides overlay when skip SSR is clicked`, () => {
    cy.getFastRefreshOverlay().findByText(`Skip SSR`).click()
    cy.assertNoFastRefreshOverlay()
  })

  it(`it hides overlay when error is fixed after a reload`, () => {
    cy.visit(`/error-handling/dev-ssr-error/`, {
      // Hacky way to disable "uncaught:exception" message in error message itself
      // See https://github.com/cypress-io/cypress/issues/254#issuecomment-292190924
      onBeforeLoad: win => {
        win.onerror = null
      },
    }).waitForRouteChange()
    cy.exec(
      `npm run update -- --file src/pages/error-handling/dev-ssr-error.js --replacements "Working:Updated" --replacements "${errorReplacement}:${errorPlaceholder}" --exact`
    )
    cy.getFastRefreshOverlay().findByText(`Reload page`).click()

    cy.findByTestId(`hot`).should(`contain.text`, `Updated`)
    cy.assertNoFastRefreshOverlay()
  })
})
