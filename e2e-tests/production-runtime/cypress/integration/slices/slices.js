/**
 * Test basic Slices API behaviour like context, props, ....
 */

Cypress.on(`uncaught:exception`, err => {
  if (
    (err.message.includes(`Minified React error #418`) ||
      err.message.includes(`Minified React error #423`) ||
      err.message.includes(`Minified React error #425`)) &&
    Cypress.env(`TEST_PLUGIN_OFFLINE`)
  ) {
    return false
  }
})

describe(`Slices`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`Slice content show on screen`, () => {
    cy.getTestElement(`footer-static-text`)
      .invoke(`text`)
      .should(`contain`, `Built with`)
  })

  it(`Slice recieves context passed via createSlice`, () => {
    cy.getTestElement(`footer-slice-context-value`)
      .invoke(`text`)
      .should(`contain`, `Gatsby`)
  })

  it(`Slice can take in props`, () => {
    cy.getTestElement(`footer-props`)
      .invoke(`text`)
      .should(`contains`, `Gatsbyjs`)
  })

  it(`Slice can consume a context wrapped in WrapRootElement`, () => {
    cy.getTestElement(`footer-context-derieved-value`)
      .invoke(`text`)
      .should(`contain`, `2`)
  })

  it(`Slice with static query works`, () => {
    cy.getTestElement(`footer-static-query-title`).contains(
      `Gatsby Default Starter`
    )
  })
})
