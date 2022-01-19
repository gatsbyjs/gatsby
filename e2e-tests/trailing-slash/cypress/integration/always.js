describe(`always`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
  it(`page-creator without slash`, () => {
    cy.getTestElement(`page-creator-without`).click()
    cy.waitForRouteChange().assertRoute(`/page-2/`)
  })
  it(`page-creator with slash`, () => {
    cy.getTestElement(`page-creator-with`).click()
    cy.waitForRouteChange().assertRoute(`/page-2/`)
  })
  it(`create-page with slash`, () => {
    cy.getTestElement(`create-page-with`).click()
    cy.waitForRouteChange().assertRoute(`/create-page/with/`)
  })
  it(`create-page without slash`, () => {
    cy.getTestElement(`create-page-without`).click()
    cy.waitForRouteChange().assertRoute(`/create-page/without/`)
  })
  it(`fs-api with slash`, () => {
    cy.getTestElement(`fs-api-with`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api/with/`)
  })
  it(`fs-api without slash`, () => {
    cy.getTestElement(`fs-api-without`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api/without/`)
  })
  it(`fs-api client only splat without slash`, () => {
    cy.getTestElement(`fs-api-client-only-without`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api/without/without/`)
    cy.getTestElement(`title`).should(`have.text`, `without`)
  })
  it(`fs-api client only splat with slash`, () => {
    cy.getTestElement(`fs-api-client-only-with`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api/with/with/`)
    cy.getTestElement(`title`).should(`have.text`, `with`)
  })
  it(`fs-api-simple with slash`, () => {
    cy.getTestElement(`fs-api-simple-with`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api-simple/with/`)
  })
  it(`fs-api-simple without slash`, () => {
    cy.getTestElement(`fs-api-simple-without`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api-simple/without/`)
  })
  it(`gatsbyPath works`, () => {
    cy.getTestElement(`gatsby-path-1`).should(
      "have.attr",
      "href",
      "/fs-api-simple/with/"
    )
    cy.getTestElement(`gatsby-path-2`).should(
      "have.attr",
      "href",
      "/fs-api-simple/without/"
    )
  })
  it(`hash`, () => {
    cy.getTestElement(`hash`).click()
    cy.waitForRouteChange().assertRoute(`/page-2/#anchor`)
  })
  it(`hash trailing`, () => {
    cy.getTestElement(`hash-trailing`).click()
    cy.waitForRouteChange().assertRoute(`/page-2/#anchor`)
  })
  it(`query-param`, () => {
    cy.getTestElement(`query-param`).click()
    cy.waitForRouteChange().assertRoute(`/page-2/?query_param=hello`)
  })
  it(`query-param-hash`, () => {
    cy.getTestElement(`query-param-hash`).click()
    cy.waitForRouteChange().assertRoute(`/page-2/?query_param=hello#anchor`)
  })
  it(`client-only-simple without slash`, () => {
    cy.getTestElement(`client-only-simple-without`).click()
    cy.waitForRouteChange().assertRoute(`/client-only/without/`)
    cy.getTestElement(`title`).should(`have.text`, `without`)
  })
  it(`client-only-simple with slash`, () => {
    cy.getTestElement(`client-only-simple-with`).click()
    cy.waitForRouteChange().assertRoute(`/client-only/with/`)
    cy.getTestElement(`title`).should(`have.text`, `with`)
  })
})

describe(`always (direct visits)`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
  it(`page-creator`, () => {
    cy.visit(`/page-2`).waitForRouteChange().assertRoute(`/page-2/`)
  })
  it(`create-page with`, () => {
    cy.visit(`/create-page/with/`)
      .waitForRouteChange()
      .assertRoute(`/create-page/with/`)
  })
  it(`create-page without`, () => {
    cy.visit(`/create-page/without`)
      .waitForRouteChange()
      .assertRoute(`/create-page/without/`)
  })
  it(`fs-api-simple with`, () => {
    cy.visit(`/fs-api-simple/with/`)
      .waitForRouteChange()
      .assertRoute(`/fs-api-simple/with/`)
  })
  it(`fs-api-simple without`, () => {
    cy.visit(`/fs-api-simple/without`)
      .waitForRouteChange()
      .assertRoute(`/fs-api-simple/without/`)
  })
  it(`fs-api client only splat with`, () => {
    cy.visit(`/fs-api/with/with/`)
      .waitForRouteChange()
      .assertRoute(`/fs-api/with/with/`)
  })
  it(`fs-api client only splat without`, () => {
    cy.visit(`/fs-api/without/without`)
      .waitForRouteChange()
      .assertRoute(`/fs-api/without/without/`)
  })
  it(`client-only with`, () => {
    cy.visit(`/client-only/with/`)
      .waitForRouteChange()
      .assertRoute(`/client-only/with/`)
  })
  it(`client-only without`, () => {
    cy.visit(`/client-only/without`)
      .waitForRouteChange()
      .assertRoute(`/client-only/without/`)
  })
  it(`client-only-splat with`, () => {
    cy.visit(`/client-only-splat/with/with/`)
      .waitForRouteChange()
      .assertRoute(`/client-only-splat/with/with/`)
  })
  it(`client-only-splat without`, () => {
    cy.visit(`/client-only-splat/without/without`)
      .waitForRouteChange()
      .assertRoute(`/client-only-splat/without/without/`)
  })
  it(`query-param-hash with`, () => {
    cy.visit(`/page-2/?query_param=hello#anchor`)
      .waitForRouteChange()
      .assertRoute(`/page-2/?query_param=hello#anchor`)
  })
  it(`query-param-hash without`, () => {
    cy.visit(`/page-2?query_param=hello#anchor`)
      .waitForRouteChange()
      .assertRoute(`/page-2/?query_param=hello#anchor`)
  })
})
