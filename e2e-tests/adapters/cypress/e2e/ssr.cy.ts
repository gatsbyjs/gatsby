const staticPath = "/routes/ssr/static"
const paramPath = "/routes/ssr/param"

const PATH_PREFIX = Cypress.env(`PATH_PREFIX`) || ``

describe("Server Side Rendering (SSR)", () => {
  it(`direct visit no query params (${staticPath})`, () => {
    cy.visit(staticPath).waitForRouteChange()
    cy.get(`[data-testid="query"]`).contains(`{}`)
    cy.get(`[data-testid="params"]`).contains(`{}`)
  })

  it(`direct visit with query params (${staticPath})`, () => {
    cy.visit(staticPath + `?foo=bar`).waitForRouteChange()
    cy.get(`[data-testid="query"]`).contains(`{"foo":"bar"}`)
    cy.get(`[data-testid="params"]`).contains(`{}`)
  })

  it(`direct visit no query params (${paramPath})`, () => {
    cy.visit(paramPath + `/foo`).waitForRouteChange()
    cy.get(`[data-testid="query"]`).contains(`{}`)
    cy.get(`[data-testid="params"]`).contains(`{"param":"foo"}`)
  })

  it(`direct visit with query params (${paramPath})`, () => {
    cy.visit(paramPath + `/foo` + `?foo=bar`).waitForRouteChange()
    cy.get(`[data-testid="query"]`).contains(`{"foo":"bar"}`)
    cy.get(`[data-testid="params"]`).contains(`{"param":"foo"}`)
  })

  it(`should display custom 500 page`, () => {
    const errorPath = `/routes/ssr/error-path`

    cy.visit(errorPath, { failOnStatusCode: false }).waitForRouteChange()

    cy.location(`pathname`)
      .should(`equal`, PATH_PREFIX + errorPath)
      .get(`h1`)
      .should(`have.text`, `INTERNAL SERVER ERROR (custom)`)
  })
})
