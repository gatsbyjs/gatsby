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
    it(`plain less`, () => {
      // we don't want to visit page for each test - we want to visit once and then test HMR
      cy.window().then(win => {
        cy.spy(win.console, `log`).as(`hmrConsoleLog`)
      })

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
      // we don't want to visit page for each test - we want to visit once and then test HMR
      cy.window().then(win => {
        cy.spy(win.console, `log`).as(`hmrConsoleLog`)
      })

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
