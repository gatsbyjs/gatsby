Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`Production build tests`, () => {
  it(`should remount when navigating to different template`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`page2`).click().waitForRouteChange()

    // add buffer time so that componentDidMount has time to be called after route change
    cy.wait(1000)

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for second page
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 2)
    cy.lifecycleCallCount(`render`).should(`equal`, 2)
  })

  it(`should remount when navigating to different page using same template`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`duplicated`).click().waitForRouteChange()

    // add buffer time so that componentDidMount has time to be called after route change
    cy.wait(1000)

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for duplicated page
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 2)
    cy.lifecycleCallCount(`render`).should(`equal`, 2)
  })

  it(`should NOT remount when navigating within client only paths`, () => {
    cy.visit(`/client-only-paths`).waitForRouteChange()

    cy.getTestElement(`/page/profile`).click().waitForRouteChange()

    cy.getTestElement(`/nested/foo`).click().waitForRouteChange()

    // add buffer time so that componentDidMount has time to be called after route change
    cy.wait(1000)

    // we expect just 1 `componentDidMount` call, when navigating inside matchPath
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 1)
    cy.lifecycleCallCount(`render`).should(`equal`, 3)
  })
})
