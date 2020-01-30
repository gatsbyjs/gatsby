describe(`redirect`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`should redirect page to index page when there is no such page`, () => {
    cy.visit(`/redirect-without-page`).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  it(`should redirect page to index page even there is a such page`, () => {
    cy.visit(`/redirect`).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
  })
})
