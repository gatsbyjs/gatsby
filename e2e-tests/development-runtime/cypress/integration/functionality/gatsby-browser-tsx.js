describe(`gatsby-browser.tsx`, () => {
  it(`works`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`.gatsby-browser-tsx`).should(`have.attr`, `data-content`, `TSX with gatsby-browser works`)
  })
})