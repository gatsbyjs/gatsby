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

// This command is to find out that the lifecycle methods have
// been called in the expected order, not to check the exact order.
// It checks an array and makes sure that each item in the array is called at some point after the last.
// It will return a boolean value if the order has been called correctly according to what has been passed in.
Cypress.Commands.add(`lifecycleCallOrder`, expectedActionCallOrder =>
  cy.window().then(win => {
    const actions = win.___PageComponentLifecycleCallsLog
    const expectedActionCallOrderLength = expectedActionCallOrder.length
    const actionsLength = actions.length

    if (expectedActionCallOrderLength > actionsLength) {
      return false
    }

    // get loop starting point from the first actions index
    const firstOccurrence = actions.findIndex(
      action => action.action === expectedActionCallOrder[0]
    )
    if (firstOccurrence === -1) return false
    
    let prevActionIndex = 0
    for (let i = 1; i < actionsLength; i += 1) {
      const currentIndex = i + firstOccurrence
      const nextActionIndex = prevActionIndex + 1

      // if the next action is found in the correct order
      if (actions[currentIndex].action === expectedActionCallOrder[nextActionIndex]) {
        prevActionIndex = nextActionIndex
      }
    }

    // if not all actions have been found then it has failed
    if (prevActionIndex !== expectedActionCallOrderLength - 1) {
      return false
    }

    return true
  })
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
