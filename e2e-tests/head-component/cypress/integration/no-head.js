describe(`no-head`, () => {
  beforeEach(() => {
    cy.visit(`/no-head`)
  })

  it(`renders the meta tags based on the siteMetdata`, () => {
    // NOTE(@mxstbr): @cypress/snapshot does not have support for snapshotting
    // multiple DOM elements, so we manually iterate through them and snapshot each one
    // @see https://github.com/cypress-io/snapshot/issues/23
    cy.get(`[data-react-helmet="true"]`).then($elems => {
      Array.from($elems).forEach($elem => {
        cy.wrap($elem).snapshot()
      })
    })
  })
})
