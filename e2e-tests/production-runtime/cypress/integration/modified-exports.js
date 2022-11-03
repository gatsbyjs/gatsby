/**
 * Test that page templates have certain exports removed while other files are left alone.
 *
 * Page templates support only a default exported React component and named exports of
 * `config` and `getServerData`, so it's not necessary (or possible) to test other exports
 * in page templates.
 */

const config = `config exported from a non-page template module`
const getServerData = `getServerData exported from a non-page template module`
const helloWorld = `hello world`

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || ('Minified React error #425')) {
    return false
  }
})

describe(`modifed exports`, () => {
  beforeEach(() => {
    cy.visit(`/modified-exports`).waitForRouteChange()
  })

  describe(`page templates`, () => {
    it(`should have exports named config removed`, () => {
      cy.getTestElement(`modified-exports-page-template-config`)
        .invoke(`text`)
        .should(`contain`, `undefined`)
    })
    it(`should have exports named getServerData removed`, () => {
      cy.getTestElement(`modified-exports-page-template-get-server-data`)
        .invoke(`text`)
        .should(`contain`, `undefined`)
    })
    it(`should have imported exports named config left alone`, () => {
      cy.getTestElement(`unmodified-exports-page-template-config`)
        .invoke(`text`)
        .should(`contain`, config)
    })
    it(`should have imported exports named getServerData left alone`, () => {
      cy.getTestElement(`unmodified-exports-page-template-get-server-data`)
        .invoke(`text`)
        .should(`contain`, getServerData)
    })
    it(`should have other imported exports left alone`, () => {
      cy.getTestElement(`unmodified-exports-page-template-hello-world`)
        .invoke(`text`)
        .should(`contain`, helloWorld)
    })
  })

  describe(`other JS files`, () => {
    it(`should have exports named config left alone`, () => {
      cy.getTestElement(`unmodified-exports-config`)
        .invoke(`text`)
        .should(`contain`, config)
    })

    it(`should have exports named getServerData left alone`, () => {
      cy.getTestElement(`unmodified-exports-get-server-data`)
        .invoke(`text`)
        .should(`contain`, getServerData)
    })

    it(`should have other named exports left alone`, () => {
      cy.getTestElement(`unmodified-exports-hello-world`)
        .invoke(`text`)
        .should(`contain`, helloWorld)
    })
  })
})
