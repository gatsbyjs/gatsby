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

    let prevActionIndex = -1
    for (let i = 0; i < actionsLength; i += 1) {
      const nextActionIndex = prevActionIndex + 1

      // if the next action is found in the correct order
      if (actions[i].action === expectedActionCallOrder[nextActionIndex]) {
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

Cypress.Commands.add(`assertRoute`, route => {
  cy.url().should(`equal`, `${window.location.origin}${route}`)
})

// react-error-overlay is iframe, so this is just convenience helper
// https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/#custom-command
Cypress.Commands.add(`getOverlayIframe`, () => {
  // get the iframe > document > body
  // and retry until the body element is not empty
  return (
    cy
      .get(`iframe`, { log: true, timeout: 150000 })
      .its(`0.contentDocument.body`)
      .should(`not.be.empty`)
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      // https://on.cypress.io/wrap
      .then(cy.wrap, { log: true })
  )
})

Cypress.Commands.add(`assertNoOverlayIframe`, () => {
  // get the iframe > document > body
  // and retry until the body element is not empty
  return cy.get(`iframe`, { log: true, timeout: 15000 }).should(`not.exist`)
})
