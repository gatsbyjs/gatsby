before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`styling: plain css`, () => {
  beforeEach(() => {
    cy.visit(`/styling/plain-css`).waitForRouteChange()
  })

  it(`initial styling is correct`, () => {
    cy.getTestElement(`styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )
  })

  it(`updates on change`, () => {
    cy.exec(
      `npm run update -- --file src/pages/styling/plain-css.css --replacements "red:blue" --exact`
    )

    cy.waitForHmr()

    cy.getTestElement(`styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 0, 255)`
    )
  })
})
