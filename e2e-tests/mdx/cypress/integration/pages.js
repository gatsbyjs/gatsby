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

    it (`generates a slug with an index file`, () => {
        cy.visit(`/list`).waitForRouteChange()
        cy.getTestElement(`complex-slug`).contains(`about`)
    })

    it (`generates a slug with a slash`, () => {
        cy.visit(`/list`).waitForRouteChange()
        cy.getTestElement(`embed-slug`).contains(`about/embedded`)
    })

    it (`generates a page with an image import for a jpg`, () => {
        cy.visit(`/image_import1`).waitForRouteChange()
        cy.getTestElement(`jpg-image`).should(`have.attr`, `src`).should(`include`, `.jpg`)
    })

    it (`generates a page with an image import for a png`, () => {
        cy.visit(`/image_import2`).waitForRouteChange()
        cy.getTestElement(`png-image`).should(`have.attr`, `src`).should(`include`, `.png`)
    })
})
