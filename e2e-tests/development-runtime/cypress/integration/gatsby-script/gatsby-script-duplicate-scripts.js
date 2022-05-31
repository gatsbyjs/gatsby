describe(`duplicate scripts`, () => {
  beforeEach(() => {
    cy.visit(`/gatsby-script-duplicate-scripts/`).waitForRouteChange()
  })

  it(`should execute load callbacks of duplicate scripts`, () => {
    cy.get(`[data-on-load-result=duplicate-1]`).should(`have.length`, 1)
    cy.get(`[data-on-load-result=duplicate-2]`).should(`have.length`, 1)
    cy.get(`[data-on-load-result=duplicate-3]`).should(`have.length`, 1)
  })

  it(`should execute error callbacks of duplicate scripts`, () => {
    cy.get(`[data-on-error-result=duplicate-1]`).should(`have.length`, 1)
    cy.get(`[data-on-error-result=duplicate-2]`).should(`have.length`, 1)
    cy.get(`[data-on-error-result=duplicate-3]`).should(`have.length`, 1)
  })

  it(`should execute load callbacks even if the first script has no declared load callback`, () => {
    cy.get(`[data-on-load-result=duplicate-first-script-no-callback]`).should(
      `have.length`,
      1
    )
    cy.get(`[data-on-load-result=duplicate-first-script-no-callback-2]`).should(
      `have.length`,
      1
    )
  })

  it(`should execute error callbacks even if the first script has no declared error callback`, () => {
    cy.get(`[data-on-error-result=duplicate-first-script-no-callback]`).should(
      `have.length`,
      1
    )
    cy.get(
      `[data-on-error-result=duplicate-first-script-no-callback-2]`
    ).should(`have.length`, 1)
  })
})
