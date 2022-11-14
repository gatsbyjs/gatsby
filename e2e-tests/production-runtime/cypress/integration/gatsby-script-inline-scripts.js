import { inlineScript } from "../../gatsby-script-scripts"
import { resourceRecord, markRecord } from "../../gatsby-script-records"

const page = {
  target: `/gatsby-script-inline-scripts/`,
  navigation: `/gatsby-script-navigation/`,
}

const typesOfInlineScripts = [
  {
    descriptor: `dangerouslySetInnerHTML`,
    inlineScriptType: inlineScript.dangerouslySet,
  },
  {
    descriptor: `template literals`,
    inlineScriptType: inlineScript.templateLiteral,
  },
]

Cypress.on(`uncaught:exception`, err => {
  if (
    (err.message.includes(`Minified React error #418`) ||
      err.message.includes(`Minified React error #423`) ||
      err.message.includes(`Minified React error #425`)) &&
    Cypress.env(`TEST_PLUGIN_OFFLINE`)
  ) {
    return false
  }
})

/**
 * Normally we would duplicate the tests so they're flatter and easier to debug,
 * but since the test count grew and the cases are exactly the same we'll iterate.
 */

for (const { descriptor, inlineScriptType } of typesOfInlineScripts) {
  describe(`inline scripts set via ${descriptor}`, () => {
    describe(`using the post-hydrate strategy`, () => {
      it(`should execute successfully`, () => {
        cy.visit(page.target).waitForRouteChange()

        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `success`,
          true
        ).should(`equal`, `true`)
      })

      it(`should load after the framework bundle has loaded`, () => {
        cy.visit(page.target).waitForRouteChange()

        // Assert framework is loaded before inline script is executed
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          markRecord.executeStart
        ).then(dangerouslySetExecuteStart => {
          cy.getRecord(`framework`, resourceRecord.responseEnd).should(
            `be.lessThan`,
            dangerouslySetExecuteStart
          )
        })
      })
    })

    describe(`using the idle strategy`, () => {
      it(`should execute successfully`, () => {
        cy.visit(page.target).waitForRouteChange()

        cy.getRecord(`idle-${inlineScriptType}`, `success`, true).should(
          `equal`,
          `true`
        )
      })

      it(`should load after other strategies`, () => {
        cy.visit(page.target).waitForRouteChange()

        cy.getRecord(`idle-${inlineScriptType}`, markRecord.executeStart).then(
          dangerouslySetExecuteStart => {
            cy.getRecord(
              `post-hydrate-${inlineScriptType}`,
              markRecord.executeStart
            ).should(`be.lessThan`, dangerouslySetExecuteStart)
          }
        )
      })
    })

    describe(`when navigation occurs`, () => {
      it(`should load only once on initial page load`, () => {
        cy.visit(page.target).waitForRouteChange()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, `post-hydrate`)
        cy.getRecord(`idle-${inlineScriptType}`, `strategy`, true).should(
          `equal`,
          `idle`
        )
      })

      it(`should load only once after the page is refreshed`, () => {
        cy.visit(page.target).waitForRouteChange()
        cy.reload().url().should(`contain`, page.target)

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, `post-hydrate`)
        cy.getRecord(`idle-${inlineScriptType}`, `strategy`, true).should(
          `equal`,
          `idle`
        )
      })

      it(`should load only once after anchor link navigation`, () => {
        cy.visit(page.target).waitForRouteChange()
        cy.get(`a[id=anchor-link-back-to-index]`).click()
        cy.url().should(`contain`, page.navigation)
        cy.get(`a[href="${page.target}"][id=anchor-link]`).click()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, `post-hydrate`)
        cy.getRecord(`idle-${inlineScriptType}`, `strategy`, true).should(
          `equal`,
          `idle`
        )
      })

      it(`should load only once if the page is revisited via browser back/forward buttons after anchor link navigation`, () => {
        cy.visit(page.navigation).waitForRouteChange()
        cy.get(`a[href="${page.target}"][id=anchor-link]`).click()
        cy.get(`table[id=script-mark-records] tbody`) // Make sure history has time to change
        cy.go(`back`).waitForRouteChange()
        cy.go(`forward`).waitForRouteChange()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, `post-hydrate`)
        cy.getRecord(`idle-${inlineScriptType}`, `strategy`, true).should(
          `equal`,
          `idle`
        )
      })

      it(`should load only once after Gatsby link navigation`, () => {
        cy.visit(page.target).waitForRouteChange()
        cy.get(`a[id=gatsby-link-back-to-index]`).click()
        cy.get(`a[href="${page.target}"][id=gatsby-link]`).click()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, `post-hydrate`)
        cy.getRecord(`idle-${inlineScriptType}`, `strategy`, true).should(
          `equal`,
          `idle`
        )
      })

      it(`should load only once if the page is revisited via browser back/forward buttons after Gatsby link navigation`, () => {
        cy.visit(page.navigation).waitForRouteChange()
        cy.get(`a[href="${page.target}"][id=gatsby-link]`).click()
        cy.go(`back`).waitForRouteChange()
        cy.go(`forward`).waitForRouteChange()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, `post-hydrate`)
        cy.getRecord(`idle-${inlineScriptType}`, `strategy`, true).should(
          `equal`,
          `idle`
        )
      })
    })
  })
}
