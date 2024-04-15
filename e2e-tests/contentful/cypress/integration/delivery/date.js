describe(`date`, () => {
  beforeEach(() => {
    cy.visit("/date").waitForRouteChange()
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
  it(`date: Localization`, () => {
    cy.get('[data-cy-id="date-english"]').within(() => {
      cy.get(`[data-cy-value]`).should("have.text", "2021-05-24T12:45+00:00")
      cy.get(`[data-cy-value-formatted]`).should(
        "have.text",
        "24.5.2021 - 12:45:00"
      )
    })
    cy.get('[data-cy-id="date-german"]').within(() => {
      cy.get(`[data-cy-value]`).should("have.text", "2021-05-23T16:20+02:00")
      cy.get(`[data-cy-value-formatted]`).should(
        "have.text",
        "23.5.2021 - 14:20:00"
      )
    })
  })
})
