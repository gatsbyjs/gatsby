const ROUTE = `2018-12-14-hello-world`
const TEMPLATE = `SUB_TITLE`
const TEST_ID = `sub-title`

describe(`hot reloading non-js file`, () => {
  beforeEach(() => {
    cy.visit(`/${ROUTE}/`).waitForAPI(`onRouteUpdate`)
  })
  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`contain`, TEMPLATE)
  })

  it(`hot reloads with new content`, () => {
    const message = `This is a sub-title`
    cy.exec(
      `npm run update -- --file content/${ROUTE}.md --replacements "${TEMPLATE}:${message}"`
    )

    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`eq`, message)
  })
})
