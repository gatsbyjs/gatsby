describe(`legacy`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
 it(`page-creator without slash`, () => {
  cy.getTestElement(`page-creator-without`).click()
  cy.waitForRouteChange()
    .assertRoute(`/page-2`)
 })
 it(`page-creator with slash`, () => {
  cy.getTestElement(`page-creator-with`).click()
  cy.waitForRouteChange()
    .assertRoute(`/page-2/`)
 })
 it(`create-page with slash`, () => {
  cy.getTestElement(`create-page-with`).click()
  cy.waitForRouteChange()
    .assertRoute(`/create-page/with/`)
 })
 it(`create-page without slash`, () => {
  cy.getTestElement(`create-page-without`).click()
  cy.waitForRouteChange()
    .assertRoute(`/create-page/without`)
 })
 it(`fs-api-simple with slash`, () => {
  cy.getTestElement(`fs-api-simple-with`).click()
  cy.waitForRouteChange()
    .assertRoute(`/fs-api-simple/with/`)
 })
 it(`fs-api-simple without slash`, () => {
  cy.getTestElement(`fs-api-simple-without`).click()
  cy.waitForRouteChange()
    .assertRoute(`/fs-api-simple/without`)
 })
 it(`fs-api-simple with slash`, () => {
  cy.getTestElement(`fs-api-simple-with`).click()
  cy.waitForRouteChange()
    .assertRoute(`/fs-api-simple/with/`)
 })
 it(`fs-api-simple without slash`, () => {
  cy.getTestElement(`fs-api-simple-without`).click()
  cy.waitForRouteChange()
    .assertRoute(`/fs-api-simple/without`)
 })
 it(`gatsbyPath works`, () => {
  cy.getTestElement(`gatsby-path-1`)
    .should('have.attr', 'href', '/fs-api-simple/with/')
  cy.getTestElement(`gatsby-path-2`)
    .should('have.attr', 'href', '/fs-api-simple/without/')
 })
 it(`hash`, () => {
  cy.getTestElement(`hash`).click()
  cy.waitForRouteChange()
    .assertRoute(`/page-2#anchor`)
 })
 it(`hash trailing`, () => {
  cy.getTestElement(`hash-trailing`).click()
  cy.waitForRouteChange()
    .assertRoute(`/page-2/#anchor`)
 })
 it(`query-param`, () => {
  cy.getTestElement(`query-param`).click()
  cy.waitForRouteChange()
    .assertRoute(`/page-2?query_param=hello`)
 })
 it(`query-param-hash`, () => {
  cy.getTestElement(`query-param-hash`).click()
  cy.waitForRouteChange()
    .assertRoute(`/page-2?query_param=hello#anchor`)
 })
})

describe(`ignore (direct visits)`, () => {
  it(`page-creator`, () => {
    cy.visit(`/page-2`).waitForRouteChange()
      .assertRoute(`/page-2/`)
  })
  it(`create-page`, () => {
    cy.visit(`/create-page/with/`).waitForRouteChange()
      .assertRoute(`/create-page/with/`)
    cy.visit(`/create-page/without`).waitForRouteChange()
      .assertRoute(`/create-page/without`)
  })
  it(`fs-api-simple`, () => {
    cy.visit(`/fs-api-simple/with/`).waitForRouteChange()
      .assertRoute(`/fs-api-simple/with/`)
    cy.visit(`/fs-api-simple/without`).waitForRouteChange()
      .assertRoute(`/fs-api-simple/without/`)
  })
  it(`client-only-simple`, () => {
    cy.visit(`/client-only/with/`).waitForRouteChange()
      .assertRoute(`/client-only/with/`)
    cy.visit(`/client-only/without`).waitForRouteChange()
      .assertRoute(`/client-only/without`)
  })
  it(`client-only`, () => {
    cy.visit(`/fs-api/with/with/`).waitForRouteChange()
      .assertRoute(`/fs-api/with/with/`)
    cy.visit(`/fs-api/without/without`).waitForRouteChange()
      .assertRoute(`/fs-api/without/without`)
  })
})
