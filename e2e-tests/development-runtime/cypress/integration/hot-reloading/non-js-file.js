const TEMPLATE = `SUB_TITLE`
const TEST_ID = `sub-title`
const message = `This is a sub-title`

describe(`hot reloading non-js file`, () => {
  beforeEach(() => {
    cy.exec(
      `npm run update -- --file content/2018-12-14-hello-world.md --replacements "${message}:%${TEMPLATE}%" --exact`
    )
    cy.wait(1000)

    cy.visit(`/2018-12-14-hello-world/`).waitForRouteChange()

    cy.wait(1000)
  })

  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID).invoke(`text`).should(`contain`, TEMPLATE)
  })

  it(`hot reloads with new content`, () => {
    cy.getTestElement(TEST_ID).invoke(`text`).should(`contain`, TEMPLATE)

    cy.exec(
      `npm run update -- --file content/2018-12-14-hello-world.md --replacements "${TEMPLATE}:${message}"`
    )

    // wati for socket.io to update
    cy.wait(5000)

    cy.getTestElement(TEST_ID).invoke(`text`).should(`eq`, message)
  })
})
