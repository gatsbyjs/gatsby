const COUNT_ID = `count`
const amount = 100

describe(`hot-reloading hooks`, () => {
  beforeEach(() => {
    cy.exec(
      `npm run update -- --file src/pages/hooks.js --replacements "count + ${amount}:count + 1" --exact`
    )
    cy.wait(1000)

    cy.visit(`/hooks`).waitForRouteChange()
  })

  it(`can update component`, () => {
    cy.exec(
      `npm run update -- --file src/pages/hooks.js --replacements "count + 1:count + ${amount}" --exact`
    )

    cy.waitForHmr()

    cy.getTestElement(`increment`).click()

    cy.getTestElement(COUNT_ID).invoke(`text`).should(`eq`, `${amount}`)
  })
})
