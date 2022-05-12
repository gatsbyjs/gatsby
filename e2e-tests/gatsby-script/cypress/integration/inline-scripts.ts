import { InlineScript } from "../../scripts"
import { ResourceRecord, MarkRecord } from "../../records"

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
    describe(`using the post-hydrate strategy`, () => {
      it(`should execute successfully`, () => {
        cy.visit(page)

        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          `success`,
          true
        ).should(`equal`, `true`)
      })

      it(`should load after the framework bundle has loaded`, () => {
        cy.visit(page)

        // Assert framework is loaded before inline script is executed
        cy.getRecord(
          `post-hydrate-${inlineScriptType}`,
          MarkRecord.executeStart
        ).then(dangerouslySetExecuteStart => {
          cy.getRecord(`framework`, ResourceRecord.responseEnd).should(
            `be.lessThan`,
            dangerouslySetExecuteStart
          )
        })
      })
    })

    describe(`using the idle strategy`, () => {
      it(`should execute successfully`, () => {
        cy.visit(page)

        cy.getRecord(`idle-${inlineScriptType}`, `success`, true).should(
          `equal`,
          `true`
        )
      })

      it(`should load after other strategies`, () => {
        cy.visit(page)

        cy.getRecord(`idle-${inlineScriptType}`, MarkRecord.executeStart).then(
          dangerouslySetExecuteStart => {
            cy.getRecord(
              `post-hydrate-${inlineScriptType}`,
              MarkRecord.executeStart
            ).should(`be.lessThan`, dangerouslySetExecuteStart)
          }
        )
      })
    })

    describe(`when navigation occurs`, () => {
      it(`should load only once on initial page load`, () => {
        cy.visit(page)

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
        cy.visit(page)
        cy.reload()

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
        cy.visit(page)
        cy.get(`a[id=anchor-link-back-to-index]`).click()
        cy.get(`a[href="${page}"][id=anchor-link]`).click()

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
        cy.visit(`/`)
        cy.get(`a[href="${page}"][id=anchor-link]`).click()
        cy.go(`back`)
        cy.go(`forward`)

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
        cy.visit(page)
        cy.get(`a[id=gatsby-link-back-to-index]`).click()
        cy.get(`a[href="${page}"][id=gatsby-link]`).click()

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
        cy.visit(`/`)
        cy.get(`a[href="${page}"][id=gatsby-link]`).click()
        cy.go(`back`)
        cy.go(`forward`)

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
