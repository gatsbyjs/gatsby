before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`styling: plain css`, () => {
  it(`initial styling is correct`, () => {
    cy.visit(`/styling/plain-css`).waitForRouteChange()

    cy.getTestElement(`styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(`styled-element-that-is-not-styled-initially`).should(
      `have.css`,
      `color`,
      `rgb(0, 0, 0)`
    )

    cy.getTestElement(`styled-element-by-not-visited-template`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(
      `styled-element-that-is-not-styled-initially-by-not-visited-template`
    ).should(`have.css`, `color`, `rgb(0, 0, 0)`)
  })

  describe(`changing styles/imports imported by visited template`, () => {
    beforeEach(() => {
      cy.visit(`/styling/plain-css`).waitForRouteChange()
    })

    it(`updates on already imported css file change`, () => {
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

    it(`importing new css file result in styles being applied`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/plain-css.js --replacements "// UNCOMMENT-IN-TEST:/* IMPORT-TO-COMMENT-OUT-AGAIN */" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`styled-element-that-is-not-styled-initially`).should(
        `have.css`,
        `color`,
        `rgb(255, 0, 0)`
      )
    })

    it(`updating newly imported css file result in styles being applied`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/plain-css-not-imported-initially.css --replacements "red:green" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`styled-element-that-is-not-styled-initially`).should(
        `have.css`,
        `color`,
        `rgb(0, 128, 0)`
      )
    })

    it(`removing css import results in styles being removed`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/plain-css.js --replacements "/* IMPORT-TO-COMMENT-OUT-AGAIN */:// COMMENTED-AGAIN" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`styled-element-that-is-not-styled-initially`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 0)`
      )
    })
  })

  describe(`changing styles/imports imported by NOT visited template`, () => {
    beforeEach(() => {
      cy.visit(`/styling/plain-css`).waitForRouteChange()
    })
    
    it(`updates on already imported css file change by not visited template`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/not-visited-plain-css.css --replacements "red:blue" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`styled-element-by-not-visited-template`).should(
        `have.css`,
        `color`,
        `rgb(0, 0, 255)`
      )
    })

    it(`importing new css file result in styles being applied`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/not-visited-plain-css.js --replacements "// UNCOMMENT-IN-TEST:/* IMPORT-TO-COMMENT-OUT-AGAIN */" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(
        `styled-element-that-is-not-styled-initially-by-not-visited-template`
      ).should(`have.css`, `color`, `rgb(255, 0, 0)`)
    })

    it(`updating newly imported css file result in styles being applied`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/not-visited-plain-css-not-imported-initially.css --replacements "red:green" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(
        `styled-element-that-is-not-styled-initially-by-not-visited-template`
      ).should(`have.css`, `color`, `rgb(0, 128, 0)`)
    })

    it(`removing css import results in styles being removed`, () => {
      cy.exec(
        `npm run update -- --file src/pages/styling/not-visited-plain-css.js --replacements "/* IMPORT-TO-COMMENT-OUT-AGAIN */:// COMMENTED-AGAIN" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(
        `styled-element-that-is-not-styled-initially-by-not-visited-template`
      ).should(`have.css`, `color`, `rgb(0, 0, 0)`)
    })
  })
})
