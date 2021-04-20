describe(`content-reference`, () => {
  beforeEach(() => {
    cy.visit("/content-reference")
  })
  it(`content-reference-many-2nd-level-loop`, () => {
    cy.get('[data-cy-id="content-reference-many-2nd-level-loop"]')
      .invoke("text")
      .snapshot()
  })
  it(`content-reference-many-loop-a-greater-b`, () => {
    cy.get('[data-cy-id="content-reference-many-loop-a-greater-b"]')
      .invoke("text")
      .snapshot()
  })
  it(`content-reference-many-loop-b-greater-a`, () => {
    cy.get('[data-cy-id="content-reference-many-loop-b-greater-a"]')
      .invoke("text")
      .snapshot()
  })
  it(`content-reference-many-self-reference`, () => {
    cy.get('[data-cy-id="content-reference-many-self-reference"]')
      .invoke("text")
      .snapshot()
  })
  it(`content-reference-one`, () => {
    cy.get('[data-cy-id="content-reference-one"]').invoke("text").snapshot()
  })
  it(`content-reference-one-loop-a-greater-b`, () => {
    cy.get('[data-cy-id="content-reference-one-loop-a-greater-b"]')
      .invoke("text")
      .snapshot()
  })
  it(`content-reference-one-loop-b-greater-a`, () => {
    cy.get('[data-cy-id="content-reference-one-loop-b-greater-a"]')
      .invoke("text")
      .snapshot()
  })
  it(`content-reference-one-self-reference`, () => {
    cy.get('[data-cy-id="content-reference-one-self-reference"]')
      .invoke("text")
      .snapshot()
  })
})
