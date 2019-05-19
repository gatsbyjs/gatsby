/*
 * This e2e test validates that the cache structure
 * is unique per plugin (even sub-plugins)
 * and can interact between Gatsby lifecycles and a plugin
 */
describe(`sub-plugin caching`, () => {
  beforeEach(() => {
    cy.visit(`/2018-12-14-hello-world/`).waitForRouteChange()
  })

  it(`has access to custom sub-plugin cache`, () => {
    cy.getTestElement(`gatsby-remark-subcache-value`)
      .invoke(`text`)
      .should(`eq`, `Hello World`)
  })
})
