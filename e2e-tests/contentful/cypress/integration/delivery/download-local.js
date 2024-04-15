describe(`downloadLocal`, () => {
  beforeEach(() => {
    cy.visit("/download-local").waitForRouteChange()
  })

  it(`renders dynamic image from static directory`, () => {
    cy.get("#gatsby-plugin-image-download-local").should("be.visible")
    cy.get("#gatsby-plugin-image-download-local").should("have.attr", "srcset")
    cy.get("#gatsby-plugin-image-download-local")
      .should("have.attr", "src")
      .should("match", /^\/static/)
  })
})
