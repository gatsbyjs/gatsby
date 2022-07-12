const { data } = require("../../../shared-data/head-function-export")

const TEST_ID = `extra-meta-for-hot-reloading`

describe(`hot reloading Head export`, () => {
  beforeEach(() => {
    cy.visit(`/head-function-export/basic`).waitForRouteChange()
  })

  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID)
      .invoke(`attr`, `content`)
      .should(`contain.equal`, "%SOME_EXTRA_META%")
  })

  it(`hot reloads with new content`, () => {
    const text = `New Title by HMR`
    cy.exec(
      `npm run update -- --file src/pages/head-function-export/basic.js --replacements "SOME_EXTRA_META:${text}"`
    )

    cy.waitForHmr()

    cy.getTestElement(TEST_ID)
      .invoke(`attr`, `content`)
      .should(`contain.equal`, text)
  })
})
