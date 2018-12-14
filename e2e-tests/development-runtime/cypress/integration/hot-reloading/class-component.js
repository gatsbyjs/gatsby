const TEST_ID = `class-component`

describe(`reloading class component`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })
  it(`displays placeholder on launch`, () => {
    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`contain`, `%CLASS_COMPONENT%`)
  })

  it.skip(`updates placeholder and hot reloads`, () => {
    const text = `class component`
    cy.exec(
      `npm run update -- --file src/components/class-component.js --replacements "CLASS_COMPONENT:${text}"`
    ).then(() => {
      cy.getTestElement(TEST_ID)
        .invoke(`text`)
        .should(`contain`, text)
    })
  })
})
