describe(`date`, () => {
  beforeEach(() => {
    cy.visit("/date")
  })
  it(`date: Date only`, () => {
    cy.get('[data-cy-id="date-date-only"]').within(() => {
      cy.get(`[data-cy-value]`).should("have.text", "2021-04-20")
      cy.get(`[data-cy-value-formatted]`).should("have.text", "20.4.2021")
    })
  })
  it(`date: Date and Time`, () => {
    cy.get('[data-cy-id="date-date-and-time"]').within(() => {
      cy.get(`[data-cy-value]`).should("have.text", "2021-04-20T16:20")
      cy.get(`[data-cy-value-formatted]`).should(
        "have.text",
        "20.4.2021 - 04:20"
      )
    })
  })
  it(`date: Date and Time with Timezone`, () => {
    cy.get('[data-cy-id="date-date-and-time-with-timezone"]').within(() => {
      cy.get(`[data-cy-value]`).should("have.text", "2021-04-20T04:20+10:30")
      cy.get(`[data-cy-value-formatted]`).should(
        "have.text",
        "19.4.2021 - 05:50 (UTC)"
      )
    })
  })
})
