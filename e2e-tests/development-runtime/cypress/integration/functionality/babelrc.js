const TEST_ELEMENT = `test-element`

after(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`babelrc`, () => {
  it(`Applies .babelrc`, () => {
    cy.visit(`/babelrc/base/`).waitForRouteChange()

    cy.getTestElement(TEST_ELEMENT)
      .invoke(`text`)
      .should(`eq`, `babel-rc-is-used`)
  })

  describe(`hot reload`, () => {
    it(`editing .babelrc`, () => {
      cy.visit(`/babelrc/edit/`).waitForRouteChange()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-initial`)

      cy.exec(
        `npm run update -- --file src/pages/babelrc/edit/.babelrc --replacements "babel-rc-initial:babel-rc-edited" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-edited`)
    })
  })
})
