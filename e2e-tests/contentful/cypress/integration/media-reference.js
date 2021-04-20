describe(`media-reference`, () => {
  beforeEach(() => {
    cy.visit("/media-reference")
  })
  it(`media-reference: many`, () => {
    cy.get('[data-cy-id="media-reference-many"]').within(() => {
      cy.get(".gatsby-image-wrapper").should("have.length", 2)
      cy.get(".gatsby-image-wrapper > img")
        .should("have.attr", "src")
        .should("match", /^data:image\//)
      cy.get(".gatsby-image-wrapper picture img")
        .should("have.attr", "src")
        .should("match", /^\/\/images\.ctfassets\.net/)
    })
  })

  it(`media-reference: one`, () => {
    cy.get('[data-cy-id="media-reference-one"]').within(() => {
      cy.get(".gatsby-image-wrapper").should("have.length", 1)
      cy.get(".gatsby-image-wrapper > img")
        .should("have.attr", "src")
        .should("match", /^data:image\//)
      cy.get(".gatsby-image-wrapper picture img")
        .should("have.attr", "src")
        .should("match", /^\/\/images\.ctfassets\.net/)
    })
  })
})
