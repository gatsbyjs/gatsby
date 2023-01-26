describe(`webpack-loader: yaml`, () => {
  beforeEach(() => {
    cy.visit(`/webpack-loader/yaml/`).waitForRouteChange()
  })

  it(`outputs the YAML file as JSON`, () => {
    cy.getTestElement(`webpack-loader-yaml`)
      .invoke(`text`)
      .should(`eq`, `[{"name":"Paul"},{"name":"Leto II"},{"name":"Ghanima"},{"name":"Alia"}]`)
  })
})