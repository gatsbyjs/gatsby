import "@testing-library/cypress/add-commands"

Cypress.Commands.add(`lifecycleCallCount`, action =>
  cy
    .window()
    .then(
      win =>
        win.___PageComponentLifecycleCallsLog.filter(
          entry => entry.action === action
        ).length
    )
)

Cypress.Commands.add(`assertRouterWrapperFocus`, (shouldBeFocused = true) =>
  cy
    .focused()
    .should(
      shouldBeFocused ? `have.attr` : `not.have.attr`,
      `id`,
      `gatsby-focus-wrapper`
    )
)

Cypress.Commands.add(
  `navigateAndWaitForRouteChange`,
  {
    prevSubject: `optional`,
  },
  (subject, pathname) => {
    cy.window().then(win => {
      win.___navigate(pathname)
    })

    return cy.waitForAPI(`onRouteUpdate`).then(() => subject)
  }
)

Cypress.Commands.add(
  `changeFocus`,
  {
    prevSubject: `optional`,
  },
  subject => {
    cy.get(`a`)
      .first()
      .focus()
      .then(() => subject)
  }
)
