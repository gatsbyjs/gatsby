import { Script, scripts } from "../../scripts"
import { ResourceRecord } from "../../records"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { ScriptStrategy } from "gatsby-script"

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
  describe(`using the ${ScriptStrategy.preHydrate} strategy`, () => {
    it(`should load successfully`, () => {
      cy.visit(page)
      cy.getRecord(Script.dayjs, `success`, true).should(`equal`, `true`)
    })

    it(`should load before other strategies`, () => {
      cy.visit(page)

      cy.getRecord(Script.dayjs, ResourceRecord.fetchStart).then(
        dayjsFetchStart => {
          cy.getRecord(Script.three, ResourceRecord.fetchStart).should(
            `be.greaterThan`,
            dayjsFetchStart
          )

          cy.getRecord(Script.marked, ResourceRecord.fetchStart).should(
            `be.greaterThan`,
            dayjsFetchStart
          )
        }
      )
    })
  })

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
          cy.getRecord(Script.dayjs, ResourceRecord.fetchStart).should(
            `be.lessThan`,
            markedFetchStart
          )

          cy.getRecord(Script.three, ResourceRecord.fetchStart).should(
            `be.lessThan`,
            markedFetchStart
          )
        }
      )
    })
  })
})
