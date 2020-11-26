describe(`GatsbyImage / Intersection Observer`, () => {
  it(`lazy loads an image using the fast intersection observer`, () => {
    cy.visit(`/intersection-observer`)

    cy.get(`[data-cy=already-loaded-image]`)
      .should(`be.visible`)
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.equal(240)
      })

    // Verify that the image at the bottom exist but has not been loaded yet
    cy.get(`[data-cy=lazy-loaded-image]`)
      .should(`exist`)
      .then($img => {
        expect($img[0].complete).to.equal(false)
      })

    cy.scrollTo(`bottom`)

    // Image resolves async
    // The expect assertion is not managed by the Cypress scheduler
    // We have to wait for a decent amount of time so that the image can resolve
    cy.wait(300)

    cy.get(`[data-cy=lazy-loaded-image]`)
      .should(`be.visible`)
      .then($img => {
        expect($img[0].complete).to.equal(true)
      })
  })
})
