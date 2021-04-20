describe(`rich-text`, () => {
  beforeEach(() => {
    cy.visit("/rich-text")
  })
  it(`rich-text: All Features`, () => {
    cy.get(`[data-cy-id="rich-text-all-features"]`).snapshot()
  })
  it(`rich-text: Basic`, () => {
    cy.get(`[data-cy-id="rich-text-basic"]`).snapshot()
  })
  it(`rich-text: Embedded Entry`, () => {
    cy.get(`[data-cy-id="rich-text-embedded-entry"]`).snapshot()
  })
  it(`rich-text: Embedded Asset`, () => {
    cy.get(`[data-cy-id="rich-text-embedded-asset"]`).snapshot()
  })
  it(`rich-text: Embedded Entry With Deep Reference Loop`, () => {
    cy.get(
      `[data-cy-id="rich-text-embedded-entry-with-deep-reference-loop"]`
    ).snapshot()
  })
  it(`rich-text: Embedded Entry With Reference Loop`, () => {
    cy.get(
      `[data-cy-id="rich-text-embedded-entry-with-reference-loop"]`
    ).snapshot()
  })
  it(`rich-text: Inline Entry`, () => {
    cy.get(`[data-cy-id="rich-text-inline-entry"]`).snapshot()
  })
  it(`rich-text: Inline Entry With Deep Reference Loop`, () => {
    cy.get(
      `[data-cy-id="rich-text-inline-entry-with-deep-reference-loop"]`
    ).snapshot()
  })
  it(`rich-text: Inline Entry With Reference Loop`, () => {
    cy.get(
      `[data-cy-id="rich-text-inline-entry-with-reference-loop"]`
    ).snapshot()
  })
})
