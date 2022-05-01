describe(`media-reference`, () => {
  beforeEach(() => {
    cy.visit("/media-reference").waitForRouteChange()
  })
  it(`media-reference: many`, () => {
    cy.get('[data-cy-id="media-reference-many"]').within(() => {
      cy.get("img")
        .should("have.length", 2)
        .should("have.attr", "src")
        .should("match", /^\/\/images\.ctfassets\.net/)
    })
  })

  it(`media-reference: one`, () => {
    cy.get('[data-cy-id="media-reference-one"]').within(() => {
      cy.get("img")
        .should("have.attr", "src")
        .should("match", /^\/\/images\.ctfassets\.net/)
    })
  })
})

describe(`media-reference localized`, () => {
  beforeEach(() => {
    cy.visit("/media-reference")
  })
  it(`media-reference: many with localized field`, () => {
    cy.get(
      '[data-cy-id="english-media-reference-many-localized-field"]'
    ).snapshot()
    cy.get(
      '[data-cy-id="german-media-reference-many-localized-field"]'
    ).snapshot()
  })
  it(`media-reference: many with localized asset`, () => {
    cy.get(
      '[data-cy-id="english-media-reference-many-with-localized-asset"]'
    ).snapshot()
    cy.get(
      '[data-cy-id="german-media-reference-many-with-localized-asset"]'
    ).snapshot()
  })
  it(`media-reference: one with localized asset`, () => {
    cy.get(
      '[data-cy-id="english-media-reference-one-localized-asset"]'
    ).snapshot()
    cy.get(
      '[data-cy-id="german-media-reference-one-localized-asset"]'
    ).snapshot()
  })
  it(`media-reference: one with localized field`, () => {
    cy.get(
      '[data-cy-id="english-media-reference-one-localized-field"]'
    ).snapshot()
    cy.get(
      '[data-cy-id="german-media-reference-one-localized-field"]'
    ).snapshot()
  })
})
