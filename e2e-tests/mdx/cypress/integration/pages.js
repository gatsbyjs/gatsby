/* global cy */

describe(`Pages`, () => {
    it(`can be created with MDX`, () => {
        cy.visit(`/`).waitForRouteChange()
        cy.findByText(`Do you work`).should(`exist`)
    })

    it(`can include shortcode component`, () => {
        cy.visit(`/`).waitForRouteChange()
        cy.getTestElement(`shortcode`).contains(`I am an example of a component in MDX.`)
    })

    it(`can include external import`, () => {
        cy.visit(`/`).waitForRouteChange()
        cy.getTestElement(`external`).contains(`Now an external import`)
    })
})
