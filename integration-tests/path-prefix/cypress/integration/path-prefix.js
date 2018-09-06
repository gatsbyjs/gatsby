/* eslint-disable no-undef */
const { pathPrefix } = require('../../gatsby-config')

const withTrailingSlash = url => `${url}/`

describe(`Production pathPrefix`, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it(`returns 200 on base route`, () => {
    cy.location('pathname').should('eq', withTrailingSlash(pathPrefix))
  })

  describe('navigation', () => {
    const pageTwoLink = `a[data-test-id="page-2-link"]`

    it('prefixes link with /blog', () => {
      cy.get(pageTwoLink)
        .should('have.attr', 'href')
        .and('include', '/blog')
    })

    it('can navigate to secondary page', () => {
      cy.get(pageTwoLink).click()

      cy.location('pathname').should(
        'eq',
        withTrailingSlash(`${pathPrefix}/page-2`)
      )
    })

    it('can navigate back from secondary page', () => {
      cy.get(pageTwoLink).click()

      cy.get('a[data-test-id="index-link"]').click()

      cy.location('pathname').should('eq', withTrailingSlash(pathPrefix))
    })

    it('can go back', () => {
      cy.get(pageTwoLink).click()

      cy.go('back')

      cy.location('pathname', { timeout: 10000 }).should(
        'eq',
        withTrailingSlash(pathPrefix)
      )
    })
  })
})
