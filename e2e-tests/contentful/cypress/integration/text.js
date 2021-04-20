describe(`text`, () => {
  beforeEach(() => {
    cy.visit("/text").waitForRouteChange()
  })

  it(`text: Short`, () => {
    cy.get(`[data-cy-id="short"] [data-cy-value]`).should(
      `have.text`,
      `The quick brown fox jumps over the lazy dog.`
    )
  })
  it(`text: Long Plain`, () => {
    cy.get(`[data-cy-id="long-plain"] [data-cy-value]`)
      .invoke("text")
      .then(text => {
        expect(text.length).to.be.equal(748)
        expect(text).to.match(
          /^The European languages are members of the same family. Their/
        )
      })
  })

  it(`text: Short List`, () => {
    cy.get(`[data-cy-id="short-list"]`).snapshot()
  })
  it(`text: Long Markdown Simple`, () => {
    cy.get(`[data-cy-id="long-markdown-simple"]`).snapshot()
  })
  it(`text: Long Markdown Complex`, () => {
    cy.get(`[data-cy-id="long-markdown-complex"]`).snapshot()
  })
})
