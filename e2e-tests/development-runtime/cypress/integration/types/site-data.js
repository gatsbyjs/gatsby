describe(`the site data object`, () => {
  beforeEach(() => {
    cy.visit(`/site-data`)
  })

  it(`includes the title`, () => {
    cy.getTestElement(`title`)
      .invoke(`text`)
      .should(`equal`, `Gatsby Default Starter`)
  })

  it(`includes site host`, () => {
    cy.getTestElement(`host`).invoke(`text`).should(`equal`, `localhost`)
  })

  it(`default description is null`, () => {
    cy.getTestElement(`description`)
      .invoke(`text`)
      .should(`equal`, `description is null`)
  })

  it(`includes nested metadata`, () => {
    cy.getTestElement(`twitter`).invoke(`text`).should(`equal`, `kylemathews`)
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
