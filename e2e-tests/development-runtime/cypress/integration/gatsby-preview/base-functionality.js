beforeEach(() => {
  cy.exec(`npm run reset:preview`)
  cy.visit(`/preview`).waitForRouteChange()
})

describe(`Gatsby Preview, base functionality`, () => {
  it(`has data, by default`, () => {
    cy.get(`ul`).its(`length`).should(`equal`, 1)
  })

  it(`displays correct data/id`, () => {
    cy.get(`li`).should(`have.text`, `Hello World (1)`)
  })
})
