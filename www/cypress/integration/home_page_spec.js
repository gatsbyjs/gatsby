/* eslint-disable no-undef*/
const getFullUrl = (route) => `${Cypress.config(`baseUrl`)}/${route}/`

describe(`Gatsby Home Page`, () => {
  it(`should load fine`, () => {
    cy.visit(`/`)
  })

  describe(`Nav Links should work`, () => {
    it(`should navigate to docs`, () => {
      cy.get(`.navigation`)
        .contains(`Docs`)
        .click()

      cy.url().should(`eq`, getFullUrl(`docs`))
    })

    it(`should navigate to Tutorial`, () => {
      cy.get(`.navigation`)
        .contains(`Tutorial`)
        .click()

      cy.url().should(`eq`, getFullUrl(`tutorial`))
    })

    it(`should navigate to Plugins doc`, () => {
      cy.get(`.navigation`)
        .contains(`Plugins`)
        .click()

      cy.url().should(`eq`, getFullUrl(`plugins`))
    })

    it(`should navigate to Features doc`, () => {
      cy.get(`.navigation`)
        .contains(`Features`)
        .click()

      cy.url().should(`eq`, getFullUrl(`features`))
    })


    it(`should navigate to Blog`, () => {
      cy.get(`.navigation`)
        .contains(`Blog`)
        .click()

      cy.url().should(`eq`, getFullUrl(`blog`))
    })


    it(`should navigate to Showcase`, () => {
      cy.get(`.navigation`)
        .contains(`Showcase`)
        .click()

      cy.url().should(`eq`, getFullUrl(`showcase`))
    })
  })


  describe(`Newsletter subscription`, () => {
    beforeEach(() => {
      cy.visit(`/`)
    })

    it(`should work`, () => {
      cy.get(`input[name=email]`)
        .type(`fake@email.com`)
        .should(`have.value`, `fake@email.com`)

      cy.get(`input[value=Subscribe]`)
        .click()

      cy.wait(1000)

      cy.get(`div.submitted-message p`).should(`have.text`, `Success! You have been subscribed to the Gatsby newsletter. Expect to see a newsletter in your inbox each Wednesday (or the equivalent of US Wednesday in your time zone)!`)
    })
  })
})