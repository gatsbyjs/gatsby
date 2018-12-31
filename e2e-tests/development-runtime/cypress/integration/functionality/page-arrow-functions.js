describe(`anonymous arrow function pages`, () => {
  beforeEach(() => {
    cy.visit(`/anonymous-arrow`).waitForAPI(`onRouteUpdate`)
  })

  it(`displays arrow function component correctly`, () => {
    cy.getTestElement(`title`)
      .invoke(`text`)
      .should(`contain`, `Anonymous Arrow Function`)
  })

  it(`updates page on navigation`, () => {
    cy.getTestElement(`link`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`title`)
      .invoke(`text`)
      .should(`contain`, `Two`)
  })
})
