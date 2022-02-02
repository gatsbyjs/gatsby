describe(`gatsby-ssr.tsx`, () => {
  it(`works`, () => {
    const parentDoc = cy.state('window').parent.document
    const iframe = parentDoc.querySelector('.iframes-container iframe')
    iframe.sandbox = ""
    cy.visit(`/`)
    cy.get(`.gatsby-ssr-tsx`).should(`have.attr`, `data-content`, `TSX with gatsby-ssr works`)
  })
})