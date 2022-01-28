Cypress.Commands.add(`assertRoute`, route => {
  cy.url().should(`equal`, `${window.location.origin}${route}`)
})
