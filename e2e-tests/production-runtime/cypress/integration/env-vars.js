Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423')) {
    return false
  }
})

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

    // EXISTING_VAR is provided by `.env.production`
    // so despite not being prefixed with `GATSBY_` it is
    // available to use in react template as well as in getServerData
    cy.getTestElement(`process.env.EXISTING_VAR`).contains(`"foo bar"`)
    cy.getTestElement(`serverData.envVars.EXISTING_VAR`).contains(`"foo bar"`)

    // VERY_SECRET_VAR is not used by browser bundle, but it's used by getServerData
    // we want to verify that it's available to getServerData and at the same time check
    // if it doesn't leak to browser bundle (we do so by running `test-env-vars` script)
    // We do use alias "VERY_SECRET_ALIAS_VAR" so that "VERY_SECRET_VAR" doesn't end up
    // in public dir and mess with our test scanning public directory
    cy.getTestElement(`serverData.envVars.VERY_SECRET_ALIAS_VAR`).contains(
      `"it's a secret"`
    )

    // NOT_EXISTING_VAR is not defined at all so we expect it to be blank
    // both in react template and in getServerData
    cy.getTestElement(`process.env.NOT_EXISTING_VAR`).should(`be.empty`)
    cy.getTestElement(`serverData.envVars.NOT_EXISTING_VAR`).should(`be.empty`)

    // FROM_COMMAND_LINE is just in `process.env.`, but it's not prefixed with
    // `GATSBY_` so it's not available for react template (process.env.FROM_COMMAND_LINE)
    // but it is available to getServerData
    cy.getTestElement(`process.env.FROM_COMMAND_LINE`).should(`be.empty`)
    cy.getTestElement(`serverData.envVars.FROM_COMMAND_LINE`).contains(`"YES"`)

    //prefix env should be available in `process.env` and getServerData
    cy.getTestElement(`process.env.GATSBY_PREFIXED_FROM_COMMAND_LINE`).contains(`"YES"`)
    cy.getTestElement(`serverData.envVars.GATSBY_PREFIXED_FROM_COMMAND_LINE`).contains(`"YES"`)
  })
})
