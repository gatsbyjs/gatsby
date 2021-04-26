const TEST_ELEMENT = `test-element`

describe(`babelrc`, () => {
  it(`Applies .babelrc`, () => {
    cy.visit(`/babelrc/base/`).waitForRouteChange()

    cy.getTestElement(TEST_ELEMENT)
      .invoke(`text`)
      .should(`eq`, `babel-rc-is-used`)
  })
})
