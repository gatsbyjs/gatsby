const COUNT_ID = `count`

describe(`hot-reloading hooks`, () => {
  beforeEach(() => {
    cy.visit(`/hooks`).waitForRouteChange()
  })

  it.skip(`can update component`, () => {
    const amount = 100
    cy.exec(
      `npm run update -- --file src/pages/hooks.js --replacements "count + 1:count + ${amount}" --exact`
    )

    cy.getTestElement(`increment`).click()

    cy.getTestElement(COUNT_ID).invoke(`text`).should(`eq`, `${amount}`)
  })
})
