describe(`gatsby-ssr.tsx`, () => {
  it(`works`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`.gatsby-ssr-tsx`).should(`have.attr`, `data-content`, `TSX with gatsby-ssr works`)
  })
})