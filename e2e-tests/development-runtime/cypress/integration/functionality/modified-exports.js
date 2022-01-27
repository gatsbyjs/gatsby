/**
 * Test that page templates have certain exports removed while other files are left alone.
 *
 * Page templates support only a default exported React component and named exports of
 * `config` and `getServerData`, so it's not necessary (or possible) to test other exports
 * in page templates.
 */
describe(`modifed exports`, () => {
  beforeEach(() => {
    cy.visit(`/modified-exports`).waitForRouteChange()
  })

  describe(`page templates`, () => {
    it(`should have exports named config removed`, () => {
      cy.getTestElement(`modified-exports-config`)
        .invoke(`text`)
        .should(`contain`, `undefined`)
    })
    it(`should have exports named getServerData removed`, () => {
      cy.getTestElement(`modified-exports-get-server-data`)
        .invoke(`text`)
        .should(`contain`, `undefined`)
    })
  })

  describe(`other JS files`, () => {
    it(`should have exports named config left alone`, () => {
      cy.getTestElement(`unmodified-exports-config`)
        .invoke(`text`)
        .should(`contain`, `config exported from a non-page template module`)
    })

    it(`should have exports named getServerData left alone`, () => {
      cy.getTestElement(`unmodified-exports-get-server-data`)
        .invoke(`text`)
        .should(
          `contain`,
          `getServerData exported from a non-page template module`
        )
    })

    it(`should have other named exports left alone`, () => {
      cy.getTestElement(`unmodified-exports-hello-world`)
        .invoke(`text`)
        .should(`contain`, `hello world`)
    })
  })
})
