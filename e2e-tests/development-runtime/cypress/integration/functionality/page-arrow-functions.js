describe.skip(`anonymous arrow function pages`, () => {
  beforeEach(() => {
    cy.visit(`/anonymous-arrow`).waitForAPI(`onRouteUpdate`)
  })

  it(`displays arrow function component correctly`, () => {
    cy.get(`h1`)
      .invoke(`text`)
      .should(`eq`, `Anonymous Arrow Function`)
  })

  it(`updates page on navigation`, () => {
    cy.get(`a`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.get(`h1`)
      .invoke(`text`)
      .should(`contain`, `Two`)
  })
})
