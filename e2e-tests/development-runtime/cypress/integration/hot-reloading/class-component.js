const TEST_ID = `class-component`

describe(`reloading class component`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
  it(`displays placeholder on launch`, () => {
    cy.getTestElement(TEST_ID).should(`contain.text`, `%CLASS_COMPONENT%`)
  })

  it(`updates placeholder and hot reloads`, () => {
    const text = `class component`
    cy.exec(
      `npm run update -- --file src/components/class-component.js --replacements "CLASS_COMPONENT:${text}"`
    )

    cy.getTestElement(TEST_ID).should(`contain.text`, text)
  })

  it(`updates state and hot reloads`, () => {
    const value = `custom`
    cy.exec(
      `npm run update -- --file src/components/class-component.js --replacements "CUSTOM_STATE:${value}"`
    )

    cy.waitForHmr()

    cy.getTestElement(`stateful-${TEST_ID}`).should(
      `have.text`,
      `Custom Message`
    )
  })
})
