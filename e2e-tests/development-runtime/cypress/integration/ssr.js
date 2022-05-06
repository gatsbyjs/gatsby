const staticPath = `/ssr/static-path/`
const paramPath = `/ssr/param-path/`
const wildcardPath = `/ssr/wildcard-path/`

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

  it(`Preserves window.location.search as querystring passed`, () => {
    const queryString = `?a=b%23&x=y%25&j=`
    cy.visit(staticPath + queryString).waitForRouteChange()
    cy.window().then(win => {
      expect(win.location.search).to.equal(queryString)
    })
  })
})

describe(`Param path ('${paramPath}:param')`, () => {
  it(`Direct visit no query params`, () => {
    cy.visit(paramPath + `foo/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"param":"foo"}`)
  })

  it(`Direct visit with query params`, () => {
    cy.visit(paramPath + `foo/` + `?foo=bar`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{"param":"foo"}`)
  })

  it(`Client navigation to same param path with different query params and url params`, () => {
    cy.visit(paramPath + `foo/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"param":"foo"}`)
    cy.window()
      .then(win => win.___navigate(paramPath + `foo/` + `?foo=bar`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{"param":"foo"}`)
    cy.window()
      .then(win => win.___navigate(paramPath + `baz/` + `?foo=bar`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{"param":"baz"}`)
    cy.window()
      .then(win => win.___navigate(paramPath + `baz/`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"param":"baz"}`)
  })
})

describe(`Wildcard path ('${wildcardPath}*')`, () => {
  it(`Direct visit no query params`, () => {
    cy.visit(wildcardPath + `foo/nested/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"wildcard":"foo/nested"}`)
  })

  it(`Direct visit with query params`, () => {
    cy.visit(wildcardPath + `foo/nested/` + `?foo=bar`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{"wildcard":"foo/nested"}`)
  })

  it(`Client navigation to same param path with different query params and url params`, () => {
    cy.visit(wildcardPath + `foo/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"wildcard":"foo"}`)
    cy.window()
      .then(win => win.___navigate(wildcardPath + `foo/` + `?foo=bar`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{"wildcard":"foo"}`)
    cy.window()
      .then(win => win.___navigate(wildcardPath + `baz/` + `?foo=bar`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{"foo":"bar"}`)
    cy.getTestElement(`params`).contains(`{"wildcard":"baz"}`)
    cy.window()
      .then(win => win.___navigate(wildcardPath + `baz/`))
      .waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"wildcard":"baz"}`)
  })
})
