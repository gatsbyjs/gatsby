// TODO: In https://github.com/gatsbyjs/gatsby/pull/35226 the count changes need to be reverted
// And Hydration error in gatsby-plugin-image fixed

describe(`Production build tests`, () => {
  it(`should remount when navigating to different template`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`page2`).click().waitForRouteChange()

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for second page
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 2)
    // TODO: This should equal 2
    cy.lifecycleCallCount(`render`).should(`equal`, 3)
  })

  it(`should remount when navigating to different page using same template`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`duplicated`).click().waitForRouteChange()

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for duplicated page
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 2)
    // TODO: This should equal 2
    cy.lifecycleCallCount(`render`).should(`equal`, 3)
  })

  it(`should NOT remount when navigating within client only paths`, () => {
    cy.visit(`/client-only-paths`).waitForRouteChange()

    cy.getTestElement(`/page/profile`).click().waitForRouteChange()

    cy.getTestElement(`/nested/foo`).click().waitForRouteChange()

    // we expect just 1 `componentDidMount` call, when navigating inside matchPath
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 1)
    // TODO: This should equal 3
    cy.lifecycleCallCount(`render`).should(`equal`, 4)
  })
})
