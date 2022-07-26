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
