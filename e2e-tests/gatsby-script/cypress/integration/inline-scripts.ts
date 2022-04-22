import { InlineScript } from "../../scripts"
import { ResourceRecord, MarkRecord } from "../../records"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { ScriptStrategy } from "gatsby-script"

// The page that we will assert against
const page = `/inline-scripts`

const typesOfInlineScripts = [
  {
    descriptor: `dangerouslySetInnerHTML`,
    inlineScriptType: InlineScript.dangerouslySet,
  },
  {
    descriptor: `template literals`,
    inlineScriptType: InlineScript.templateLiteral,
  },
]

beforeEach(() => {
  cy.intercept(new RegExp(`framework`), { middleware: true }, req => {
    req.on(`before:response`, res => {
      res.headers[`cache-control`] = `no-store` // Do not cache responses
    })
  })
})

/**
 * Normally we would duplicate the tests so they're flatter and easier to debug,
 * but since the test count grew and the cases are exactly the same we'll iterate.
 */

for (const { descriptor, inlineScriptType } of typesOfInlineScripts) {
  describe(`inline scripts set via ${descriptor}`, () => {
    describe(`using the ${ScriptStrategy.postHydrate} strategy`, () => {
      it(`should execute successfully`, () => {
        cy.visit(page)

        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          `success`,
          true
        ).should(`equal`, `true`)
      })

      it(`should load after the framework bundle has loaded`, () => {
        cy.visit(page)

        // Assert framework is loaded before inline script is executed
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          MarkRecord.executeStart
        ).then(dangerouslySetExecuteStart => {
          cy.getRecord(`framework`, ResourceRecord.responseEnd).should(
            `be.lessThan`,
            dangerouslySetExecuteStart
          )
        })
      })
    })

    describe(`using the ${ScriptStrategy.idle} strategy`, () => {
      it(`should execute successfully`, () => {
        cy.visit(page)

        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          `success`,
          true
        ).should(`equal`, `true`)
      })

      it(`should load before other strategies`, () => {
        cy.visit(page)

        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          MarkRecord.executeStart
        ).then(dangerouslySetExecuteStart => {
          cy.getRecord(
            `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
            MarkRecord.executeStart
          ).should(`be.lessThan`, dangerouslySetExecuteStart)
        })
      })
    })

    describe(`when navigation occurs`, () => {
      it(`should load only once on initial page load`, () => {
        cy.visit(page)

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.postHydrate)
        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.idle)
      })

      it(`should load only once after the page is refreshed`, () => {
        cy.visit(page)
        cy.reload()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.postHydrate)
        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.idle)
      })

      it(`should load only once after anchor link navigation`, () => {
        cy.visit(page)
        cy.get(`a[id=anchor-link-back-to-index]`).click()
        cy.get(`a[href="${page}"][id=anchor-link]`).click()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.postHydrate)
        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.idle)
      })

      it(`should load only once if the page is revisited via browser back/forward buttons after anchor link navigation`, () => {
        cy.visit(`/`)
        cy.get(`a[href="${page}"][id=anchor-link]`).click()
        cy.go(`back`)
        cy.go(`forward`)

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.postHydrate)
        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.idle)
      })

      it(`should load only once after Gatsby link navigation`, () => {
        cy.visit(page)
        cy.get(`a[id=gatsby-link-back-to-index]`).click()
        cy.get(`a[href="${page}"][id=gatsby-link]`).click()

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.postHydrate)
        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.idle)
      })

      it(`should load only once if the page is revisited via browser back/forward buttons after Gatsby link navigation`, () => {
        cy.visit(`/`)
        cy.get(`a[href="${page}"][id=gatsby-link]`).click()
        cy.go(`back`)
        cy.go(`forward`)

        cy.get(`table[id=script-mark-records] tbody`)
          .children()
          .should(`have.length`, 4)
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.postHydrate)
        cy.getRecord(
          `${ScriptStrategy.idle}-${inlineScriptType}`,
          `strategy`,
          true
        ).should(`equal`, ScriptStrategy.idle)
      })
    })
  })
}
