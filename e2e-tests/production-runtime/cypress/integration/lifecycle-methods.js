import React from "react";
const skipIfReact18 = (name, test) => {
  const isReact18 = /^18/.test(React.version)
  const runner = isReact18 ? it.skip : it
  const testName = isReact18 ? `skipped due to react 18: ${name}` : name
  runner(testName, test)
}

describe(`Production build tests`, () => {
  skipIfReact18(`should remount when navigating to different template`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`page2`).click().waitForRouteChange()

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for second page
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 2)
    cy.lifecycleCallCount(`render`).should(`equal`, 2)
  })

  skipIfReact18(`should remount when navigating to different page using same template`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`duplicated`).click().waitForRouteChange()

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for duplicated page
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 2)
    cy.lifecycleCallCount(`render`).should(`equal`, 2)
  })

  it(`should NOT remount when navigating within client only paths`, () => {
    cy.visit(`/client-only-paths`).waitForRouteChange()

    cy.getTestElement(`/page/profile`).click().waitForRouteChange()

    cy.getTestElement(`/nested/foo`).click().waitForRouteChange()

    // we expect just 1 `componentDidMount` call, when navigating inside matchPath
    cy.lifecycleCallCount(`componentDidMount`).should(`equal`, 1)
    cy.lifecycleCallCount(`render`).should(`equal`, 3)
  })
})
