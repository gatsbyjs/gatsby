before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`styling: less`, () => {
  it(`initial styling is correct`, () => {
    cy.visit(`/styling/less`).waitForRouteChange()

    cy.getTestElement(`less-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(`less-module-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })

  describe(`hot reloading`, () => {
    beforeEach(() => {
      cy.visit(`/styling/less`).waitForRouteChange()
    })

    it(`plain less`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/less-plain.less --replacements "red:blue" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`less-styled-element`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 255)`
      )
    })

    it(`less module`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/less.module.less --replacements "green:blue" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`less-module-styled-element`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 255)`
      )
    })
  })
})
