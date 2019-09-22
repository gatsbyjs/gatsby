describe(`Alternate configuration`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
  it(`returns 200 on base route`, () => {
    cy.location(`pathname`).should(`eq`, `/`)
  })

  it(`has the alternate site title`, () => {
    cy.title().should(`eq`, `Home | Gatsby Default Starter`)
  })
})
