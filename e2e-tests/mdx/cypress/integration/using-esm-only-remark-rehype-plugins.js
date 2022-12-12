describe(`ESM only Rehype & Remark plugins`, () => {
  describe("Remark Plugin", () => {
    it(`transforms to github-like checkbox list`, () => {
      cy.visit(`/using-esm-only-rehype-remark-plugins/`).waitForRouteChange()
      cy.get(`.task-list-item`).should("have.length", 2)
    })
  })

  describe("Rehype Plugin", () => {
    it(`use heading text as id `, () => {
      cy.visit(`/using-esm-only-rehype-remark-plugins/`).waitForRouteChange()
      cy.get(`#heading-two`).invoke(`text`).should(`eq`, `Heading two`)
    })
  })
})
