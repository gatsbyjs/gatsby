const TEST_ID = `message`
const TEMPLATE = `MESSAGE`

describe(`hot reloading template component`, () => {
  beforeEach(() => {
    cy.visit(`/2018-12-14-hello-world/`).waitForAPI(`onRouteUpdate`)
  })
  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`contain`, TEMPLATE)
  })

  it(`hot reloads with new content`, () => {
    const message = `World`
    cy.exec(
      `npm run update -- --file src/templates/blog-post.js --replacements "${TEMPLATE}:${message}"`
    )

    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`eq`, `Hello ${message}`)
  })
})
