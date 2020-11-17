describe(`anonymous arrow function pages`, () => {
  beforeEach(() => {
    cy.visit(`/anonymous-arrow`).waitForRouteChange()
  })

  it(`displays arrow function component correctly`, () => {
    cy.getTestElement(`title`)
      .invoke(`text`)
      .should(`contain`, `Anonymous Arrow Function`)
  })

  it(`updates page on navigation`, () => {
    cy.getTestElement(`link`).click().waitForRouteChange()

    cy.getTestElement(`title`).invoke(`text`).should(`contain`, `Two`)
  })
})
