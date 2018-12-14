describe(`page not found`, () => {
  beforeEach(() => {
    cy.visit(`/__404__`)
  })
  it(`should display message `, () => {
    cy.get(`h1`)
      .invoke(`text`)
      .should(`equal`, `Gatsby.js development 404 page`)
  })
  it.skip(`can preview 404 page`, () => {
    cy.get(`button`).click()

    cy.get(`h1`)
      .invoke(`text`)
      .should(`equal`, `NOT FOUND`)
  })
  it(`shows page listing`, () => {
    cy.get(`ul`)
      .find(`li`)
      .should(`have.length`, 4)
  })
})
