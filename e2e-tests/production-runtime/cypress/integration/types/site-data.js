Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`the site data object`, () => {
  beforeEach(() => {
    cy.visit(`/site-data`)
  })

  it(`includes the title`, () => {
    cy.getTestElement(`title`)
      .invoke(`text`)
      .should(`equal`, `Gatsby Default Starter`)
  })

  it(`description is overridden by value in config`, () => {
    cy.getTestElement(`description`)
      .invoke(`text`)
      .should(`equal`, `This is site for production runtime e2e tests`)
  })

  it(`can recognise valid date strings`, () => {
    cy.getTestElement(`validdate`)
      .invoke(`text`)
      .should(`equal`, `Invalid dates can be detected`)
  })

  it(`includes valid build time`, () => {
    cy.getTestElement(`buildtime`)
      .invoke(`text`)
      .should(`equal`, `buildTime is valid`)
  })
})
