import { InlineScript } from "../../scripts"
import { ResourceRecord, MarkRecord } from "../../records"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { ScriptStrategy } from "gatsby-script"

// Inline scripts append an element to this container if executed successfully
const container = `[id=elements-appended-by-inline-scripts]`

/**
 * The two test suites below test the same thing, inline scripts via dangerouslySetInnerHTML and template literals.
 * To keep the tests flat and easier to debug they are duplicated instead of iterated over.
 */

describe(`inline scripts set via dangerouslySetInnerHTML`, () => {
  // Force framework script request to not return from cache
  beforeEach(() => {
    cy.intercept(new RegExp(`framework`), { middleware: true }, req => {
      req.on(`before:response`, res => {
        res.headers[`cache-control`] = `no-store`
      })
    })
  })

  describe(`using the ${ScriptStrategy.preHydrate} strategy`, () => {
    it(`should execute successfully`, () => {
      cy.visit(`/`)

      cy.get(
        `${container} [data-strategy=${ScriptStrategy.preHydrate}][data-type=${InlineScript.dangerouslySet}]`
      ).should(`exist`)
    })

    it(`should load before other strategies`, () => {
      cy.visit(`/`)

      cy.getRecord(
        `${ScriptStrategy.preHydrate}-${InlineScript.dangerouslySet}`,
        MarkRecord.executeStart
      ).then(dangerouslySetExecuteStart => {
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${InlineScript.dangerouslySet}`,
          MarkRecord.executeStart
        ).should(`be.greaterThan`, dangerouslySetExecuteStart)

        cy.getRecord(
          `${ScriptStrategy.idle}-${InlineScript.dangerouslySet}`,
          MarkRecord.executeStart
        ).should(`be.greaterThan`, dangerouslySetExecuteStart)
      })
    })
  })

  describe(`using the ${ScriptStrategy.postHydrate} strategy`, () => {
    it(`should execute successfully`, () => {
      cy.visit(`/`)

      cy.get(
        `${container} [data-strategy=${ScriptStrategy.postHydrate}][data-type=${InlineScript.dangerouslySet}]`
      ).should(`exist`)
    })

    it(`should load after the framework bundle has loaded`, () => {
      cy.intercept(`GET`, new RegExp(`framework`)).as(`framework`)

      cy.visit(`/`)
      cy.wait(`@framework`)

      // Ensure framework request has completed successfully
      cy.get(`@framework`).its(`response.statusCode`).should(`equal`, 200)

      // Assert framework is loaded before inline script is executed
      cy.getRecord(
        `${ScriptStrategy.postHydrate}-${InlineScript.dangerouslySet}`,
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
      cy.visit(`/`)

      cy.get(
        `${container} [data-strategy=${ScriptStrategy.idle}][data-type=${InlineScript.dangerouslySet}]`
      ).should(`exist`)
    })

    it(`should load before other strategies`, () => {
      cy.visit(`/`)

      cy.getRecord(
        `${ScriptStrategy.idle}-${InlineScript.dangerouslySet}`,
        MarkRecord.executeStart
      ).then(dangerouslySetExecuteStart => {
        cy.getRecord(
          `${ScriptStrategy.preHydrate}-${InlineScript.dangerouslySet}`,
          MarkRecord.executeStart
        ).should(`be.lessThan`, dangerouslySetExecuteStart)

        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${InlineScript.dangerouslySet}`,
          MarkRecord.executeStart
        ).should(`be.lessThan`, dangerouslySetExecuteStart)
      })
    })
  })
})

describe(`inline scripts set via template literals`, () => {
  // Force framework script request to not return from cache
  beforeEach(() => {
    cy.intercept(new RegExp(`framework`), { middleware: true }, req => {
      req.on(`before:response`, res => {
        res.headers[`cache-control`] = `no-store`
      })
    })
  })

  describe(`using the ${ScriptStrategy.preHydrate} strategy`, () => {
    it(`should execute successfully`, () => {
      cy.visit(`/`)

      cy.get(
        `${container} [data-strategy=${ScriptStrategy.preHydrate}][data-type=${InlineScript.templateLiteral}]`
      ).should(`exist`)
    })

    it(`should load before other strategies`, () => {
      cy.visit(`/`)

      cy.getRecord(
        `${ScriptStrategy.preHydrate}-${InlineScript.templateLiteral}`,
        MarkRecord.executeStart
      ).then(templateLiteralExecuteStart => {
        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${InlineScript.templateLiteral}`,
          MarkRecord.executeStart
        ).should(`be.greaterThan`, templateLiteralExecuteStart)

        cy.getRecord(
          `${ScriptStrategy.idle}-${InlineScript.templateLiteral}`,
          MarkRecord.executeStart
        ).should(`be.greaterThan`, templateLiteralExecuteStart)
      })
    })
  })

  describe(`using the ${ScriptStrategy.postHydrate} strategy`, () => {
    it(`should execute successfully`, () => {
      cy.visit(`/`)

      cy.get(
        `${container} [data-strategy=${ScriptStrategy.postHydrate}][data-type=${InlineScript.templateLiteral}]`
      ).should(`exist`)
    })

    it(`should load after the framework bundle has loaded`, () => {
      cy.intercept(`GET`, new RegExp(`framework`)).as(`framework`)

      cy.visit(`/`)
      cy.wait(`@framework`)

      // Ensure framework request has completed successfully
      cy.get(`@framework`).its(`response.statusCode`).should(`equal`, 200)

      // Assert framework is loaded before inline script is executed
      cy.getRecord(
        `${ScriptStrategy.postHydrate}-${InlineScript.templateLiteral}`,
        MarkRecord.executeStart
      ).then(templateLiteralExecuteStart => {
        cy.getRecord(`framework`, ResourceRecord.responseEnd).should(
          `be.lessThan`,
          templateLiteralExecuteStart
        )
      })
    })
  })

  describe(`using the ${ScriptStrategy.idle} strategy`, () => {
    it(`should execute successfully`, () => {
      cy.visit(`/`)

      cy.get(
        `${container} [data-strategy=${ScriptStrategy.idle}][data-type=${InlineScript.templateLiteral}]`
      ).should(`exist`)
    })

    it(`should load before other strategies`, () => {
      cy.visit(`/`)

      cy.getRecord(
        `${ScriptStrategy.idle}-${InlineScript.templateLiteral}`,
        MarkRecord.executeStart
      ).then(templateLiteralExecuteStart => {
        cy.getRecord(
          `${ScriptStrategy.preHydrate}-${InlineScript.templateLiteral}`,
          MarkRecord.executeStart
        ).should(`be.lessThan`, templateLiteralExecuteStart)

        cy.getRecord(
          `${ScriptStrategy.postHydrate}-${InlineScript.templateLiteral}`,
          MarkRecord.executeStart
        ).should(`be.lessThan`, templateLiteralExecuteStart)
      })
    })
  })
})
