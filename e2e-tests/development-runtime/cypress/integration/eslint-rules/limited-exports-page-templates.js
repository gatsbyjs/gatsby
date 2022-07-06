before(() => {
  cy.exec(
    `npm run update -- --file src/pages/eslint-rules/limited-exports-page-templates.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file src/pages/eslint-rules/limited-exports-page-templates.js --restore`
  )
})

const errorPlaceholder = `// export function notAllowed() {}`
const errorReplacement = `export function notAllowed() {}`

describe(`limited-exports-page-templates`, () => {
  beforeEach(() => {
    cy.visit(
      `/eslint-rules/limited-exports-page-templates`
    ).waitForRouteChange()
  })

  it(`should initially not log to console`, () => {
    cy.get(`@hmrConsoleLog`).should(
      `not.be.calledWithMatch`,
      /13:1 {2}warning {2}In page templates only a default export of a valid React component and the named exports of a page query, getServerData, Head or config are allowed./i
    )
  })
  it(`should log warning to console for invalid export`, () => {
    cy.exec(
      `npm run update -- --file src/pages/eslint-rules/limited-exports-page-templates.js --replacements "${errorPlaceholder}:${errorReplacement}" --exact`
    )
    cy.reload()

    cy.get(`@hmrConsoleLog`).should(
      `be.calledWithMatch`,
      /13:1 {2}warning {2}In page templates only a default export of a valid React component and the named exports of a page query, getServerData, Head or config are allowed./i
    )
    cy.get(`@hmrConsoleLog`).should(
      `not.be.calledWithMatch`,
      /15:1 {2}warning {2}In page templates only a default export of a valid React component and the named exports of a page query, getServerData, Head or config are allowed./i
    )
  })
})
