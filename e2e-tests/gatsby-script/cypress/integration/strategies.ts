import { Script, scripts, framework } from "../../scripts"
import { ResourceRecord } from "../../resource-records"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { ScriptStrategy } from "gatsby-script"

beforeEach(() => {
  // Force script requests to not return from cache
  for (const script of [...Object.values(scripts), new RegExp(framework)]) {
    cy.intercept(script, { middleware: true }, req => {
      req.on(`before:response`, res => {
        res.headers[`cache-control`] = `no-store`
      })
    })
  }
})

describe(`${ScriptStrategy.preHydrate} strategy`, () => {
  it(`should load successfully`, () => {
    const script = Script.dayjs
    const alias = `@${script}`

    cy.intercept(`GET`, scripts[script]).as(script)
    cy.visit(`/`)
    cy.wait(alias)

    cy.get(alias).its(`response.statusCode`).should(`equal`, 200)
  })

  it(`should load before other strategies`, () => {
    const aliases: Array<string> = []

    // Intercept all scripts
    for (const script in scripts) {
      cy.intercept(`GET`, scripts[script]).as(script)
      aliases.push(`@${script}`)
    }

    cy.visit(`/`)

    // Ensure all script requests have completed successfully
    for (const alias of aliases) {
      cy.get(alias).its(`response.statusCode`).should(`equal`, 200)
    }

    /**
     * Assert script fetch start order.
     * Cypress doesn't support async/await syntax so we'll use nested promises like they recommend.
     * @see {@link https://docs.cypress.io/faq/questions/using-cypress-faq#Can-I-use-the-new-ES7-async-await-syntax}
     */

    cy.getResourceRecord(Script.dayjs, ResourceRecord.fetchStart).then(
      dayjsFetchStart => {
        cy.getResourceRecord(Script.three, ResourceRecord.fetchStart).should(
          `be.greaterThan`,
          dayjsFetchStart
        )

        cy.getResourceRecord(Script.marked, ResourceRecord.fetchStart).should(
          `be.greaterThan`,
          dayjsFetchStart
        )
      }
    )
  })
})

describe(`${ScriptStrategy.postHydrate} strategy`, () => {
  it(`should load successfully`, () => {
    const script = Script.three
    const alias = `@${script}`

    cy.intercept(`GET`, scripts[script]).as(script)
    cy.visit(`/`)
    cy.wait(alias)

    cy.get(alias).its(`response.statusCode`).should(`equal`, 200)
  })

  it(`should load after the framework bundle has loaded`, () => {
    const script = Script.three

    cy.intercept(`GET`, scripts[script]).as(script)
    cy.intercept(`GET`, new RegExp(framework)).as(framework)

    cy.visit(`/`)

    // Ensure both script requests have completed successfully
    cy.get(`@${script}`).its(`response.statusCode`).should(`equal`, 200)
    cy.get(`@${framework}`).its(`response.statusCode`).should(`equal`, 200)

    // Assert framework is loaded before three starts loading
    cy.getResourceRecord(script, ResourceRecord.fetchStart).then(
      threeFetchStart => {
        cy.getResourceRecord(framework, ResourceRecord.responseEnd).should(
          `be.lessThan`,
          threeFetchStart
        )
      }
    )
  })
})

describe(`${ScriptStrategy.idle} strategy`, () => {
  it(`should load successfully`, () => {
    const script = Script.marked
    const alias = `@${script}`

    cy.intercept(`GET`, scripts[script]).as(script)
    cy.visit(`/`)
    cy.wait(alias)

    cy.get(alias).its(`response.statusCode`).should(`equal`, 200)
  })

  it(`should load after other strategies`, () => {
    const aliases: Array<string> = []

    // Intercept all scripts
    for (const script in scripts) {
      cy.intercept(`GET`, scripts[script]).as(script)
      aliases.push(`@${script}`)
    }

    cy.visit(`/`)

    // Ensure all script requests have completed successfully
    for (const alias of aliases) {
      cy.get(alias).its(`response.statusCode`).should(`equal`, 200)
    }

    cy.getResourceRecord(Script.marked, ResourceRecord.fetchStart).then(
      markedFetchStart => {
        cy.getResourceRecord(Script.dayjs, ResourceRecord.fetchStart).should(
          `be.lessThan`,
          markedFetchStart
        )

        cy.getResourceRecord(Script.three, ResourceRecord.fetchStart).should(
          `be.lessThan`,
          markedFetchStart
        )
      }
    )
  })
})
