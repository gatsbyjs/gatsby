const reset = () => cy.exec(`npm run reset:preview`)

beforeEach(() => {
  cy.exec(`npm run reset:preview`)
  cy.visit(`/preview`).waitForRouteChange()
})

after(() => reset())

describe(`Gatsby Preview (Refreshing)`, () => {
  it(`displays initial data`, () => {
    cy.get(`#pinc-data li`).should(`have.length`, 1)

    cy.get(`#fake-data li`).should(`have.length`, 1)
  })

  it(`updates no data for an unknown plugin`, () => {
    cy.exec(`npm run update:cms-webhook gatsby-source-unknown`)

    cy.get(`#pinc-data li`).should(`have.length`, 1)

    cy.get(`#fake-data li`).should(`have.length`, 1)
  })

  it(`updates the data from the matching plugin`, () => {
    cy.exec(`npm run update:cms-webhook gatsby-source-pinc-data`)

    cy.get(`#pinc-data li`).should(`have.length`, 2)

    cy.get(`#fake-data li`).should(`have.length`, 1)

    cy.exec(`npm run update:cms-webhook gatsby-source-fake-data`)

    cy.get(`#pinc-data li`).should(`have.length`, 2)

    cy.get(`#fake-data li`).should(`have.length`, 2)
  })
})
