before(() => {
  cy.exec(
    `npm run update -- --file src/pages/eslint-rules/no-anonymous-exports-page-templates.js --restore`
  )
  cy.exec(
    `npm run update -- --file src/pages/eslint-rules/no-anonymous-exports-page-templates-function.js --restore`
  )
})

after(() => {
  cy.exec(
    `npm run update -- --file src/pages/eslint-rules/no-anonymous-exports-page-templates.js --restore`
  )
  cy.exec(
    `npm run update -- --file src/pages/eslint-rules/no-anonymous-exports-page-templates-function.js --restore`
  )
})

const errorPlaceholderAnonExport01 = `const Named = () =>`
const errorReplacementAnonExport01 = `export default () =>`
const errorPlaceholderAnonExport02 = `export default Named`
const errorReplacementAnonExport02 = `// named-default-export`
const errorPlaceholderAnonFunction = `export default function Named()`
const errorReplacementAnonFunction = `export default function ()`

describe(`no-anonymous-exports-page-templates`, () => {
  it(`should initially not log to console`, () => {
    cy.visit(
      `/eslint-rules/no-anonymous-exports-page-templates`
    ).waitForRouteChange()
    cy.get(`@hmrConsoleLog`).should(
      `not.be.calledWithMatch`,
      /Anonymous arrow functions cause Fast Refresh to not preserve local component state./i
    )
    cy.get(`@hmrConsoleLog`).should(
      `not.be.calledWithMatch`,
      /Anonymous function declarations cause Fast Refresh to not preserve local component state./i
    )
  })
  it(`should log warning to console for arrow functions`, () => {
    cy.visit(
      `/eslint-rules/no-anonymous-exports-page-templates`
    ).waitForRouteChange()

    cy.exec(
      `npm run update -- --file src/pages/eslint-rules/no-anonymous-exports-page-templates.js --replacements "${errorPlaceholderAnonExport01}:${errorReplacementAnonExport01}" --replacements "${errorPlaceholderAnonExport02}:${errorReplacementAnonExport02}" --exact`
    )

    cy.reload()

    cy.get(`@hmrConsoleLog`).should(
      `be.calledWithMatch`,
      /Anonymous arrow functions cause Fast Refresh to not preserve local component state./i
    )
  })
  it(`should log warning to console for function declarations`, () => {
    cy.visit(
      `/eslint-rules/no-anonymous-exports-page-templates-function`
    ).waitForRouteChange()

    cy.exec(
      `npm run update -- --file src/pages/eslint-rules/no-anonymous-exports-page-templates-function.js --replacements "${errorPlaceholderAnonFunction}:${errorReplacementAnonFunction}" --exact`
    )

    cy.reload()

    cy.get(`@hmrConsoleLog`).should(
      `be.calledWithMatch`,
      /Anonymous function declarations cause Fast Refresh to not preserve local component state./i
    )
  })
})
