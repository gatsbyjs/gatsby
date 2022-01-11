

describe(`Uses env vars correctly`, () => {

  it(`SSG page gets right env vars`, () => {
    cy.visit(`/env-vars`).waitForRouteChange()

    cy.getTestElement(`process.env`).contains(`{}`)
    cy.getTestElement(`process.env.EXISTING_VAR`).contains(`"foo bar"`)
    cy.getTestElement(`process.env.NOT_EXISTING_VAR`).should(`be.empty`)
  })

    it(`SSR page gets right env vars`, () => {
    cy.visit(`/ssr/static-path`).waitForRouteChange()

    cy.getTestElement(`process.env`).contains(`{}`)

    cy.getTestElement(`process.env.EXISTING_VAR`).contains(`"foo bar"`)
    cy.getTestElement(`serverData.envVars.EXISTING_VAR`).contains(`"foo bar"`)
  
    cy.getTestElement(`process.env.NOT_EXISTING_VAR`).should(`be.empty`)
    cy.getTestElement(`serverData.envVars.NOT_EXISTING_VAR`).should(`be.empty`)

    cy.getTestElement(`process.env.FROM_COMMAND_LINE`).should(`be.empty`)
    cy.getTestElement(`serverData.envVars.FROM_COMMAND_LINE`).contains(`"YES"`)
 
  })

})
