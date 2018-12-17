const TEMPLATE = `SUB_TITLE`
const TEST_ID = `sub-title`

describe(`hot reloading non-js file`, () => {
  beforeEach(() => {
    cy.visit(`/2018-12-14-hello-world/`).waitForAPI(`onRouteUpdate`)
  })

  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`contain`, TEMPLATE)
  })

  it.skip(`hot reloads with new content`, () => {
    const message = `This is a sub-title`
    cy.exec(
      `npm run update -- --file content/2018-12-14-hello-world.md --replacements "${TEMPLATE}:${message}"`
    )

    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`eq`, message)
  })
})
