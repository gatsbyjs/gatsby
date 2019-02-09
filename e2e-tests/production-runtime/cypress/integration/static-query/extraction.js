beforeEach(() => {
  cy.visit(`/`).waitForAPIorTimeout(`onRouteUpdate`)
})

it(`replaces StaticQuery`, () => {
  cy.getTestElement(`bio`)
    .invoke(`text`)
    .should(`not.contain`, `Loading`)
})
