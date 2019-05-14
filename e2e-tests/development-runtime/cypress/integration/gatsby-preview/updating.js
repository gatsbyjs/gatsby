beforeEach(() => {
  cy.visit(`/preview`).waitForRouteChange()
})

describe(`Gatsby Preview (Updating)`, () => {
  it(`displays initial data`, () => {
    cy.get(`li:eq(0) a`)
      .click()
      .waitForRouteChange()

    cy.queryByText(`Hello World (1)`).should(`exist`)

    cy.queryByText(`0`).should(`exist`)
  })

  it(`updates and hot-reloads preview data`, () => {
    cy.get(`li:eq(0) a`)
      .click()
      .waitForRouteChange()

    cy.exec(`npm run update:preview`)

    cy.queryByText(`1`).should(`exist`)
  })
})
