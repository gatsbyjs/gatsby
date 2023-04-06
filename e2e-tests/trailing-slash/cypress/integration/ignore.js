import { assertPageVisits } from "../utils/trailing-slash"

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) {
    return false
  }
})

describe(`ignore`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
  it(`page-creator without slash`, () => {
    cy.getTestElement(`page-creator-without`).click()
    cy.waitForRouteChange().assertRoute(`/page-2`)
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
    cy.waitForRouteChange().assertRoute(`/create-page/without`)
  })
  it(`fs-api with slash`, () => {
    cy.getTestElement(`fs-api-with`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api/with/`)
  })
  it(`fs-api without slash`, () => {
    cy.getTestElement(`fs-api-without`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api/without`)
  })
  it(`fs-api client only splat without slash`, () => {
    cy.getTestElement(`fs-api-client-only-without`).click()
    cy.waitForRouteChange().assertRoute(`/fs-api/without/without`)
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
    cy.waitForRouteChange().assertRoute(`/fs-api-simple/without`)
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
      "/fs-api-simple/without"
    )
  })
  it(`hash`, () => {
    cy.getTestElement(`hash`).click()
    cy.waitForRouteChange().assertRoute(`/page-2#anchor`)
  })
  it(`hash trailing`, () => {
    cy.getTestElement(`hash-trailing`).click()
    cy.waitForRouteChange().assertRoute(`/page-2/#anchor`)
  })
  it(`query-param`, () => {
    cy.getTestElement(`query-param`).click()
    cy.waitForRouteChange().assertRoute(`/page-2?query_param=hello`)
  })
  it(`query-param-hash`, () => {
    cy.getTestElement(`query-param-hash`).click()
    cy.waitForRouteChange().assertRoute(`/page-2?query_param=hello#anchor`)
  })
  it(`client-only without slash`, () => {
    cy.getTestElement(`client-only-simple-without`).click()
    cy.waitForRouteChange().assertRoute(`/client-only/without`)
    cy.getTestElement(`title`).should(`have.text`, `without`)
  })
  it(`client-only with slash`, () => {
    cy.getTestElement(`client-only-simple-with`).click()
    cy.waitForRouteChange().assertRoute(`/client-only/with/`)
    cy.getTestElement(`title`).should(`have.text`, `with`)
  })
  it(`client-only-splat without slash`, () => {
    cy.getTestElement(`client-only-splat-without`).click()
    cy.waitForRouteChange().assertRoute(`/client-only-splat/without/without`)
    cy.getTestElement(`title`).should(`have.text`, `without/without`)
  })
  it(`client-only-splat with slash`, () => {
    cy.getTestElement(`client-only-splat-with`).click()
    cy.waitForRouteChange().assertRoute(`/client-only-splat/with/with/`)
    cy.getTestElement(`title`).should(`have.text`, `with/with`)
  })
})

const IS_BUILD = Cypress.env(`IS_BUILD`)

describe(`ignore (direct visits)`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`page-creator`, () => {
    assertPageVisits([
      {
        path: "/page-2",
        destinationPath: IS_BUILD ? `/page-2/` : false,
        status: IS_BUILD ? 301 : 200,
      },
    ])

    cy.visit(`/page-2`)
      .waitForRouteChange()
      .assertRoute(`/page-2`)
  })

  it(`create-page with`, () => {
    assertPageVisits([{ path: "/create-page/with/", status: 200 }])

    cy.visit(`/create-page/with/`)
      .waitForRouteChange()
      .assertRoute(`/create-page/with/`)
  })

  it(`create-page without`, () => {
    assertPageVisits([{ path: "/create-page/without", status: 200 }])

    cy.visit(`/create-page/without`)
      .waitForRouteChange()
      .assertRoute(`/create-page/without`)
  })

  it(`fs-api-simple with`, () => {
    assertPageVisits([{ path: "/fs-api-simple/with/", status: 200 }])

    cy.visit(`/fs-api-simple/with/`)
      .waitForRouteChange()
      .assertRoute(`/fs-api-simple/with/`)
  })

  it(`fs-api-simple without`, () => {
    assertPageVisits([{ path: "/fs-api-simple/without", status: 200 }])

    cy.visit(`/fs-api-simple/without`)
      .waitForRouteChange()
      .assertRoute(`/fs-api-simple/without`)
  })

  it(`fs-api client only splat with`, () => {
    assertPageVisits([{ path: "/fs-api/with/with/", status: 200 }])

    cy.visit(`/fs-api/with/with/`)
      .waitForRouteChange()
      .assertRoute(`/fs-api/with/with/`)
  })

  it(`fs-api client only splat without`, () => {
    assertPageVisits([{ path: "/fs-api/without/without", status: 200 }])

    cy.visit(`/fs-api/without/without`)
      .waitForRouteChange()
      .assertRoute(`/fs-api/without/without`)
  })

  it(`client-only with`, () => {
    assertPageVisits([{ path: "/client-only/with/", status: 200 }])

    cy.visit(`/client-only/with/`)
      .waitForRouteChange()
      .assertRoute(`/client-only/with/`)
  })
  it(`client-only without`, () => {
    assertPageVisits([{ path: "/create-page/without", status: 200 }])

    cy.visit(`/client-only/without`)
      .waitForRouteChange()
      .assertRoute(`/client-only/without`)
  })
  it(`client-only-splat with`, () => {
    assertPageVisits([{ path: "/create-page/without", status: 200 }])

    cy.visit(`/client-only-splat/with/with/`)
      .waitForRouteChange()
      .assertRoute(`/client-only-splat/with/with/`)
  })
  it(`client-only-splat without`, () => {
    assertPageVisits([{ path: "/create-page/without", status: 200 }])

    cy.visit(`/client-only-splat/without/without`)
      .waitForRouteChange()
      .assertRoute(`/client-only-splat/without/without`)
  })
  it(`query-param-hash with`, () => {
    assertPageVisits([{ path: "/create-page/without", status: 200 }])

    cy.visit(`/page-2/?query_param=hello#anchor`)
      .waitForRouteChange()
      .assertRoute(IS_BUILD ? `/page-2?query_param=hello#anchor` : `/page-2/?query_param=hello#anchor`)
  })
  it(`query-param-hash without`, () => {
    assertPageVisits([
      {
        path: "/page-2?query_param=hello#anchor",
        status: IS_BUILD ? 301 : 200,
        destinationPath: IS_BUILD
          ? "/page-2/?query_param=hello#anchor"
          : false,
      },
    ])

    cy.visit(`/page-2?query_param=hello#anchor`)
      .waitForRouteChange()
      .assertRoute(`/page-2?query_param=hello#anchor`)
  })
})
