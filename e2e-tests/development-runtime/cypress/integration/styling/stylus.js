before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`styling: stylus`, () => {
  it(`initial styling is correct`, () => {
    cy.visit(`/styling/stylus`).waitForRouteChange()

    cy.getTestElement(`stylus-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(`stylus-module-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })

  describe(`hot reloading`, () => {
    beforeEach(() => {
      cy.visit(`/styling/stylus`).waitForRouteChange()
    })

    it(`plain stylus`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/stylus-plain.styl --replacements "red:blue" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`stylus-styled-element`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 255)`
      )
    })

    it(`stylus module`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/stylus.module.styl --replacements "green:blue" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`stylus-module-styled-element`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 255)`
      )
    })
  })
})
