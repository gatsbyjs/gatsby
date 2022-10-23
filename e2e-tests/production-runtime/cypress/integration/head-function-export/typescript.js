describe(`Tsx Pages`, () => {
  it(`Works with Head export`, () => {
    cy.visit(`/head-function-export/tsx-page`)

    cy.getTestElement(`title`).should(`contain`, `TypeScript`)

    cy.getTestElement(`name`)
      .invoke(`attr`, `content`)
      .should(`equal`, `TypeScript`)
  })
})
