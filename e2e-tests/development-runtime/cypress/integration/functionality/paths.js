const basePath = `paths`

describe(`develop`, () => {
  it(`works with the parent client side path`, () => {
    cy.visit(`/${basePath}/app`).waitForRouteChange()
    cy.get(`h1`).contains(`App Page`)
  })

  it(`works with a child of the client side path`, () => {
    cy.visit(`/${basePath}/app/12345`).waitForRouteChange()
    cy.get(`h1`).contains(`Not Found in App`)
  })
})
