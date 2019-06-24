describe(`serve`, () => {
  it(`works with the client side path`, () => {
    cy.visit(`/paths/app`).waitForRouteChange()
    cy.get(`h1`).contains(`App Page`)
  })

  it(`works with a child of the client side path`, () => {
    cy.visit(`/paths/app/12345`).waitForRouteChange()
    cy.get(`h1`).contains(`Not Found in App`)
  })
})
