const cwd = Cypress.config(`projectRoot`)

describe(`overlay handlers don't serve unrelated files`, () => {
  it(`__file-code-frame`, () => {
    cy.request(
      `__file-code-frame?filePath=${cwd}/SHOULD_NOT_SERVE&lineNumber=0`
    ).should(response => {
      expect(response.body.codeFrame).not.to.match(/CYPRESS-MARKER/)
    })
  })
})
