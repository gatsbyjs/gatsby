before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`styling: css modules`, () => {
  beforeEach(() => {
    cy.visit(`/styling/css-modules`).waitForRouteChange()
  })

  it(`initial styling is correct`, () => {
    cy.getTestElement(`styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })

  it(`updates on change`, () => {
    cy.exec(
      `npm run update -- --file src/pages/styling/css-modules.module.css --replacements "green:blue" --exact`
    )

    cy.waitForHmr()

    cy.getTestElement(`styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 0, 255)`
    )
  })
})
