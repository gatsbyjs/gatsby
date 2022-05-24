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

const storedScrollPositions = {}

Cypress.Commands.add(`getScrollPosition`, () =>
  cy.window().then(win => win.scrollY)
)

Cypress.Commands.add(`storeScrollPosition`, { prevSubject: true }, (prev, id) =>
  cy.getScrollPosition().then(scrollPosition => {
    storedScrollPositions[id] = scrollPosition
    return prev
  })
)

Cypress.Commands.add(`shouldMatchScrollPosition`, id =>
  cy.getScrollPosition().should(scrollPosition => {
    expect(scrollPosition).to.be.closeTo(storedScrollPositions[id], 100)
  })
)

Cypress.Commands.add(`shouldNotMatchScrollPosition`, id =>
  cy.getScrollPosition().should(scrollPosition => {
    expect(scrollPosition).not.to.be.closeTo(storedScrollPositions[id], 100)
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

/**
 * Get a record from a table cell in one of the test components.
 * @example cy.getRecord(Script.dayjs, ResourceRecord.fetchStart)
 * @example cy.getRecord(`${ScriptStrategy.preHydrate}-${InlineScript.dangerouslySet}`, MarkRecord.executeStart)
 */
Cypress.Commands.add(`getRecord`, (key, metric, raw = false) => {
  return cy
    .get(`[id=${key}] [id=${metric}]`)
    .invoke(`text`)
    .then(value => (raw ? value : Number(value)))
})
