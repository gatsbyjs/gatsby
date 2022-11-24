/**
 * Test basic Slices API behaviour like context, props, ....
 */

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
})
