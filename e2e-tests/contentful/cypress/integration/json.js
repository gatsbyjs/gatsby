describe(`json`, () => {
  beforeEach(() => {
    cy.visit("/json")
  })
  it(`json: Simple`, () => {
    cy.get('[data-cy-id="simple"]').within(() => {
      cy.get(`[data-cy-value-name]`).should("have.text", "Name: John")
      cy.get(`[data-cy-value-city]`).should("have.text", "City: New York")
      cy.get(`[data-cy-value-age]`).should("have.text", "Age: 31")
    })
  })
  it(`json: Complex`, () => {
    cy.get('[data-cy-id="complex"] > div:first-child').snapshot()
    cy.get('[data-cy-id="complex"] > div:last-child').snapshot()
  })
})
