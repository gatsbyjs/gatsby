Cypress.on("uncaught:exception", err => {
  if (err.message.includes("Minified React error")) {
    return false
  }
})

describe("Sub-Router", () => {
  const routes = [
    {
      path: "/routes/sub-router",
      marker: "index",
      label: "Index route",
    },
    {
      path: `/routes/sub-router/page/profile`,
      marker: `profile`,
      label: `Dynamic route`,
    },
    {
      path: `/routes/sub-router/not-found`,
      marker: `NotFound`,
      label: `Default route (not found)`,
    },
    {
      path: `/routes/sub-router/nested`,
      marker: `nested-page/index`,
      label: `Index route inside nested router`,
    },
    {
      path: `/routes/sub-router/nested/foo`,
      marker: `nested-page/foo`,
      label: `Dynamic route inside nested router`,
    },
    {
      path: `/routes/sub-router/static`,
      marker: `static-sibling`,
      label: `Static route that is a sibling to client only path`,
    },
  ] as const

  routes.forEach(({ path, marker, label }) => {
    it(label, () => {
      cy.visit(path).waitForRouteChange()
      cy.get(`[data-testid="dom-marker"]`).contains(marker)

      cy.url().should(
        `match`,
        new RegExp(`^${Cypress.config().baseUrl + path}/?$`)
      )
    })
  })
})

describe("Paths", () => {
  const routes = [
    {
      name: "client-only",
      param: "dune",
    },
    {
      name: "client-only/wildcard",
      param: "atreides/harkonnen",
    },
    {
      name: "client-only/named-wildcard",
      param: "corinno/fenring",
    },
  ] as const

  for (const route of routes) {
    it(`should return "${route.name}" result`, () => {
      cy.visit(
        `/routes/${route.name}${route.param ? `/${route.param}` : ""}`
      ).waitForRouteChange()
      cy.get("[data-testid=title]").should("have.text", route.name)
      cy.get("[data-testid=params]").should("have.text", route.param)
    })
  }
})

describe("Prioritize", () => {
  it("should prioritize static page over matchPath page with wildcard", () => {
    cy.visit("/routes/client-only/prioritize").waitForRouteChange()
    cy.get("[data-testid=title]").should(
      "have.text",
      "client-only/prioritize static"
    )
  })
  it("should return result for wildcard on nested prioritized path", () => {
    cy.visit("/routes/client-only/prioritize/nested").waitForRouteChange()
    cy.get("[data-testid=title]").should(
      "have.text",
      "client-only/prioritize matchpath"
    )
    cy.get("[data-testid=params]").should("have.text", "nested")
  })
})
