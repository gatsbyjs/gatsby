describe(`page not found`, () => {
  beforeEach(() => {
    cy.visit(`/__404__`, {
      failOnStatusCode: false,
    })
  })
  it(`should display message `, () => {
    cy.get(`h1`).invoke(`text`).should(`eq`, `Gatsby.js development 404 page`)
  })
  it(`can preview 404 page`, () => {
    cy.get(`button`).click()

    cy.getTestElement(`page-title`).invoke(`text`).should(`eq`, `NOT FOUND`)
  })
  it(`shows page listing`, () => {
    cy.get(`ul`).find(`li`).its(`length`).should(`be.gte`, 4)
  })
})
