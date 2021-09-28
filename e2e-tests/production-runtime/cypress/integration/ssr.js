const staticPath = `/ssr/static-path/`

describe(`Static path ('${staticPath}')`, () => {
  it(`Direct visit no query params`, () => {
    cy.visit(staticPath).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{}`)
  })

  it(`Direct visit with query params`, () => {
    cy.visit(staticPath + `?foo=bar`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{}`)
  })

  it(`Client navigation to same path with different query params`, () => {
    cy.visit(staticPath).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{}`)
    cy.window()
      .then(win => win.___navigate(staticPath + `?foo=bar`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{}`)
    cy.window()
      .then(win => win.___navigate(staticPath + `?foo=baz`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"baz"}`)
    cy.getTestElement(`params`).contains(`{}`)
    cy.window()
      .then(win => win.___navigate(staticPath))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{}`)
  })
})
