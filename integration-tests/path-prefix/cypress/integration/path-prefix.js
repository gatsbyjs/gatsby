/* eslint-disable no-undef */

describe(`Production pathPrefix`, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it(`returns 200 on base route`, () => {
    cy.url().should('include', '/blog')
  })

  describe('navigation', () => {
    let anchor
    beforeEach(() => {
      anchor = cy.get('a[data-test-id="page-2-link"]')
    })

    it('prefixes link with /blog', () => {
      anchor.should('have.attr', 'href').and('include', '/blog')
    })

    it('can navigate to secondary page', () => {
      anchor.click()

      cy.url().should('match', /\/blog\/page-2\/$/)
    })

    it('can navigate back from secondary page', () => {
      anchor.click()

      cy.get('a[data-test-id="index-link"]').click()

      cy.url().should('match', /\/blog\/$/)
    })

    it('can go back', () => {
      anchor.click()

      cy.go('back')

      cy.url().should('match', /\/blog\/$/)
    })
  })
})
