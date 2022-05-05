import { InlineScript, Script } from "../../scripts"
import { ResourceRecord, MarkRecord } from "../../records"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { ScriptStrategy } from "gatsby-script"

beforeEach(() => {
  cy.intercept(new RegExp(`framework`), { middleware: true }, req => {
    req.on(`before:response`, res => {
      res.headers[`cache-control`] = `no-store` // Do not cache responses
    })
  })
})

describe(`gatsby-browser`, () => {
  it(`Loads script via wrapPageElement`, () => {
    cy.visit("/adds-scripts-via-gatsby-browser")

    cy.getRecord(Script.jQuery, `success`, true).should(`equal`, `true`)
  })

  it(`Loads script via wrapRootElement`, () => {
    cy.visit("/adds-scripts-via-gatsby-browser")

    cy.getRecord(Script.popper, `success`, true).should(`equal`, `true`)
  })
})
