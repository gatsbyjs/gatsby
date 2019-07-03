/* global cy */
describe(`circular references`, () => {
  beforeEach(() => {
    cy.visit(`/circular-reference`).waitForRouteChange()
  })

  it(`fetches correctly from contentful`, () => {
    cy.getTestElement(`first`)
      .invoke(`text`)
      .should(`eq`, `Test1`)

    cy.getTestElement(`second`)
      .invoke(`text`)
      .should(`eq`, `Test2`)

    cy.getTestElement(`third`)
      .invoke(`text`)
      .should(`eq`, `Test1`)
  })
})
