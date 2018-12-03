describe(`Production build tests`, () => {
  it(`should remount when navigating to different template`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`page2`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.window().then(win => {
      cy.wrap(win.___PageComponentLifecycleCallsLog).snapshot()
    })
  })

  it(`should remount when navigating to different page using same template`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`duplicated`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.window().then(win => {
      cy.wrap(win.___PageComponentLifecycleCallsLog).snapshot()
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

    cy.window().then(win => {
      cy.wrap(win.___PageComponentLifecycleCallsLog).snapshot()
    })
  })
})
