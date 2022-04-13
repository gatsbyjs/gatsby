import { Script, scripts } from "../../scripts"

// TODO - Swap this with released package when available
import { ScriptStrategy } from "../../../../packages/gatsby-script"

// Force requests to not return from cache
beforeEach(() => {
  for (const script in scripts) {
    cy.intercept(scripts[script], { middleware: true }, req => {
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
    const aliases = []

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

    // Ensure we have all script resource records in the DOM
    cy.get(`tbody`).children().should(`have.length`, 3)

    /**
     * Assert script fetch start order.
     * Cypress doesn't support async/await syntax so we'll use nested promises like they recommend.
     * @see {@link https://docs.cypress.io/faq/questions/using-cypress-faq#Can-I-use-the-new-ES7-async-await-syntax}
     */

    cy.getFetchStartTimestamp(Script.dayjs).then(dayjsFetchStart => {
      cy.getFetchStartTimestamp(Script.three).should(
        `be.greaterThan`,
        dayjsFetchStart
      )

      cy.getFetchStartTimestamp(Script.marked).should(
        `be.greaterThan`,
        dayjsFetchStart
      )
    })
  })
})
