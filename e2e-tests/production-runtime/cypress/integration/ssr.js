const staticPath = `/ssr/static-path/`
const paramPath = `/ssr/param-path/`
const wildcardPath = `/ssr/wildcard-path/`
const pathRaking = `/ssr/path-ranking/`

Cypress.on("uncaught:exception", (err, runnable) => {
  if (
    err.message.includes("Minified React error #418") ||
    err.message.includes("Minified React error #423")
  ) {
    return false
  }
})

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

  it("Preserves window.location.search as querystring passed", () => {
    const queryString = `?a=b%23&x=y%25&j=`
    cy.visit(staticPath + queryString).waitForRouteChange()
    cy.window().then(win => {
      expect(win.location.search).to.equal(queryString)
    })
  })

  it(`Slice with static query works`, () => {
    cy.visit(staticPath).waitForRouteChange()
    cy.getTestElement(`footer-static-query-title`).contains(
      `Gatsby Default Starter`
    )
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

describe(`Path ranking resolution ('${pathRaking}*')`, () => {
  it(`Resolves to [...].js template at ${pathRaking}p1`, () => {
    cy.visit(pathRaking + `p1/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"*":"p1"}`)
  })

  it(`Resolves to [p1]/[p2].js template at ${pathRaking}p1/p2`, () => {
    cy.visit(pathRaking + `p1/p2/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"p1":"p1","p2":"p2"}`)
  })

  it(`Resolves to [p1]/page.js template at ${pathRaking}p1/page`, () => {
    cy.visit(pathRaking + `p1/page/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"p1":"p1"}`)
  })

  it(`Resolves to [...].js template at ${pathRaking}p1/p2/p3`, () => {
    cy.visit(pathRaking + `p1/p2/p3/`).waitForRouteChange()
    cy.getTestElement(`query`).contains(`{}`)
    cy.getTestElement(`params`).contains(`{"*":"p1/p2/p3"}`)
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

describe(`500 status`, () => {
  const errorPath = `/ssr/error-path/`

  it(`Display 500 page on direct navigation`, () => {
    cy.visit(errorPath, { failOnStatusCode: false }).waitForRouteChange()

    cy.location(`pathname`)
      .should(`equal`, errorPath)
      .getTestElement(`500`)
      .should(`exist`)
  })

  it(`Display 500 page on client navigation`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.window()
      .then(win => win.___navigate(errorPath))
      .waitForRouteChange()

    cy.location(`pathname`)
      .should(`equal`, errorPath)
      .getTestElement(`500`)
      .should(`exist`)
  })
})

describe(`"node:" protocol`, () => {
  it(`engines work when bundled code contains node:path import`, () => {
    cy.visit(`/ssr/using-node-protocol/`).waitForRouteChange()

    // validating that this page was rendered with SSR mode
    cy.getTestElement(`is-ssr`).contains(`true`)

    // content of field is generated using `node:path` import
    cy.getTestElement(`field-result`).contains(`"foo/bar"`)
  })
})
