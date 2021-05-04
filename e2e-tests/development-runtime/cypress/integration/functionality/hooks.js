const COUNT_ID = `count`

describe(`hooks`, () => {
  beforeEach(() => {
    cy.visit(`/hooks`, {
      failOnStatusCode: false,
    }).waitForRouteChange()
  })

  it(`displays initial state`, () => {
    cy.getTestElement(COUNT_ID).invoke(`text`).should(`eq`, `0`)
  })

  it(`can update local state`, () => {
    cy.getTestElement(`increment`).click()

    cy.getTestElement(COUNT_ID).invoke(`text`).should(`eq`, `1`)

    cy.getTestElement(`decrement`).click()

    cy.getTestElement(COUNT_ID).invoke(`text`).should(`eq`, `0`)
  })
})
