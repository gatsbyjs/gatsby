import { ScriptStrategy } from "gatsby"
import { Script, scripts } from "../../scripts"
import { ResourceRecord } from "../../records"

// The page that we will assert against
const page = `/scripts-with-sources`

beforeEach(() => {
  // @ts-ignore Object.values does exist, Cypress wants ES5 in tsconfig
  for (const script of [...Object.values(scripts), new RegExp(`framework`)]) {
    cy.intercept(script, { middleware: true }, req => {
      req.on(`before:response`, res => {
        res.headers[`cache-control`] = `no-store` // Do not cache responses
      })
    })
  }
})

describe(`scripts with sources`, () => {
  describe(`using the ${ScriptStrategy.postHydrate} strategy`, () => {
    it(`should load successfully`, () => {
      cy.visit(page)
      cy.getRecord(Script.three, `success`, true).should(`equal`, `true`)
    })

    it(`should load after the framework bundle has loaded`, () => {
      cy.visit(page)

      // Assert framework is loaded before three starts loading
      cy.getRecord(Script.three, ResourceRecord.fetchStart).then(
        threeFetchStart => {
          cy.getRecord(`framework`, ResourceRecord.responseEnd).should(
            `be.lessThan`,
            threeFetchStart
          )
        }
      )
    })

    it(`should call an on load callback once the script has loaded`, () => {
      cy.visit(page)
      cy.getRecord(Script.three, ResourceRecord.responseEnd).then(() => {
        cy.get(`[data-on-load-result=${ScriptStrategy.postHydrate}]`)
      })
    })

    it(`should call an on error callback if an error occurred`, () => {
      cy.visit(page)
      cy.get(`[data-on-error-result=${ScriptStrategy.postHydrate}]`)
    })
  })

  describe(`using the ${ScriptStrategy.idle} strategy`, () => {
    it(`should load successfully`, () => {
      cy.visit(page)
      cy.getRecord(Script.marked, `success`, true).should(`equal`, `true`)
    })

    it(`should load after other strategies`, () => {
      cy.visit(page)

      cy.getRecord(Script.marked, ResourceRecord.fetchStart).then(
        markedFetchStart => {
          cy.getRecord(Script.three, ResourceRecord.fetchStart).should(
            `be.lessThan`,
            markedFetchStart
          )
        }
      )
    })

    it(`should call an on load callback once the script has loaded`, () => {
      cy.visit(page)
      cy.getRecord(Script.marked, ResourceRecord.responseEnd).then(() => {
        cy.get(`[data-on-load-result=${ScriptStrategy.idle}]`)
      })
    })

    it(`should call an on error callback if an error occurred`, () => {
      cy.visit(page)
      cy.get(`[data-on-error-result=${ScriptStrategy.idle}]`)
    })
  })

  describe(`when navigation occurs`, () => {
    it(`should load only once on initial page load`, () => {
      cy.visit(page)

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 3)
      cy.getRecord(Script.three, `strategy`, true).should(
        `equal`,
        ScriptStrategy.postHydrate
      )
      cy.getRecord(Script.marked, `strategy`, true).should(
        `equal`,
        ScriptStrategy.idle
      )
    })

    it(`should load only once after the page is refreshed`, () => {
      cy.visit(page)
      cy.reload()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 3)
      cy.getRecord(Script.three, `strategy`, true).should(
        `equal`,
        ScriptStrategy.postHydrate
      )
      cy.getRecord(Script.marked, `strategy`, true).should(
        `equal`,
        ScriptStrategy.idle
      )
    })

    it(`should load only once after anchor link navigation`, () => {
      cy.visit(page)
      cy.get(`a[id=anchor-link-back-to-index]`).click()
      cy.get(`a[href="${page}"][id=anchor-link]`).click()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 3)
      cy.getRecord(Script.three, `strategy`, true).should(
        `equal`,
        ScriptStrategy.postHydrate
      )
      cy.getRecord(Script.marked, `strategy`, true).should(
        `equal`,
        ScriptStrategy.idle
      )
    })

    it(`should load only once if the page is revisited via browser back/forward buttons after anchor link navigation`, () => {
      cy.visit(`/`)
      cy.get(`a[href="${page}"][id=anchor-link]`).click()
      cy.go(`back`)
      cy.go(`forward`)

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 3)
      cy.getRecord(Script.three, `strategy`, true).should(
        `equal`,
        ScriptStrategy.postHydrate
      )
      cy.getRecord(Script.marked, `strategy`, true).should(
        `equal`,
        ScriptStrategy.idle
      )
    })

    it(`should load only once after Gatsby link navigation`, () => {
      cy.visit(page)
      cy.get(`a[id=gatsby-link-back-to-index]`).click()
      cy.get(`a[href="${page}"][id=gatsby-link]`).click()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 3)
      cy.getRecord(Script.three, `strategy`, true).should(
        `equal`,
        ScriptStrategy.postHydrate
      )
      cy.getRecord(Script.marked, `strategy`, true).should(
        `equal`,
        ScriptStrategy.idle
      )
    })

    it(`should load only once if the page is revisited via browser back/forward buttons after Gatsby link navigation`, () => {
      cy.visit(`/`)
      cy.get(`a[href="${page}"][id=gatsby-link]`).click()
      cy.go(`back`)
      cy.go(`forward`)

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 3)
      cy.getRecord(Script.three, `strategy`, true).should(
        `equal`,
        ScriptStrategy.postHydrate
      )
      cy.getRecord(Script.marked, `strategy`, true).should(
        `equal`,
        ScriptStrategy.idle
      )
    })
  })
})
