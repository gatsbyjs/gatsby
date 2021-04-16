before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`styling: sass`, () => {
  it(`initial styling is correct`, () => {
    cy.visit(`/styling/sass`).waitForRouteChange()

    cy.getTestElement(`sass-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(`sass-module-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })

  describe(`hot reloading`, () => {
    it(`plain sass`, () => {
      // we don't want to visit page for each test - we want to visit once and then test HMR
      cy.window().then(win => {
        cy.spy(win.console, `log`).as(`hmrConsoleLog`)
      })

      cy.exec(
        `npm run update -- --file src/pages/styling/sass-plain.scss --replacements "red:blue" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`sass-styled-element`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 255)`
      )
    })

    it(`sass module`, () => {
      // we don't want to visit page for each test - we want to visit once and then test HMR
      cy.window().then(win => {
        cy.spy(win.console, `log`).as(`hmrConsoleLog`)
      })

      cy.exec(
        `npm run update -- --file src/pages/styling/sass.module.scss --replacements "green:blue" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`sass-module-styled-element`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 255)`
      )
    })
  })
})
