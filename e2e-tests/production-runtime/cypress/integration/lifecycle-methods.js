describe(`Production build tests`, () => {
  it(`should remount when navigating to different template`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`page2`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for second page
    cy.window().then(win => {
      expect(
        win.___PageComponentLifecycleCallsLog.filter(
          entry => entry.action === `componentDidMount`
        ).length
      ).to.equal(2)
    })
  })

  it(`should remount when navigating to different page using same template`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`duplicated`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for duplicated page
    cy.window().then(win => {
      expect(
        win.___PageComponentLifecycleCallsLog.filter(
          entry => entry.action === `componentDidMount`
        ).length
      ).to.equal(2)
    })
  })

  it(`should NOT remount when navigating within client only paths`, () => {
    cy.visit(`/client-only-paths`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`/profile`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`/dashboard`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    // we expect just 1 `componentDidMount` call, when navigating inside matchPath
    cy.window().then(win => {
      expect(
        win.___PageComponentLifecycleCallsLog.filter(
          entry => entry.action === `componentDidMount`
        ).length
      ).to.equal(1)
    })
  })
})
