/* global cy */

describe(`Pages`, () => {
    it(`can be created with MDX`, () => {
        cy.visit(`/`).waitForRouteChange()
        cy.get(`h2`).invoke(`text`).should(`eq`, `Do you work`)
    })

    it(`can include shortcode component`, () => {
        cy.visit(`/`).waitForRouteChange()
        cy.getTestElement(`shortcode`).contains(`I am an example of a component in MDX.`)
    })

    it(`can include external import`, () => {
        cy.visit(`/`).waitForRouteChange()
        cy.getTestElement(`external`).contains(`Now an external import`)
    })

    it (`generates slug for mdx in pages dir`, () => {
        cy.visit(`/list`).waitForRouteChange()
        cy.getTestElement(`mdx-slug`).contains(`another`)
    })

    it (`generates complex slug with md extension`, () => {
        cy.visit(`/list`).waitForRouteChange()
        cy.getTestElement(`md-slug`).contains(`my-blog`)
    })
})
