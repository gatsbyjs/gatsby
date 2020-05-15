jest.mock(`graphql`)

import { createGraphQLRunner } from "../create-graphql-runner"
import { execute, validate, parse } from "graphql"
import { globalTracer } from "opentracing"

parse.mockImplementation(() => {
  return {}
})
validate.mockImplementation(() => [])

const createStore = (schema = {}) => {
  return {
    getState: () => {
      return {
        schema,
        schemaCustomization: {
          composer: {},
        },
      }
    },
  }
}

const tracingContext = {
  graphqlTracing: false,
  parentSpan: globalTracer().startSpan(`test`),
}

describe(`grapqhl-runner`, () => {
  let reporter

  beforeEach(() => {
    reporter = {
      panicOnBuild: jest.fn(),
    }
  })

  it(`should return the result when grapqhl has no errors`, async () => {
    const graphqlRunner = createGraphQLRunner(
      createStore(),
      reporter,
      tracingContext
    )

    const expectation = {
      data: {
        gatsby: `is awesome`,
      },
    }
    execute.mockImplementation(() => Promise.resolve(expectation))

    const result = await graphqlRunner(``, {})
    expect(reporter.panicOnBuild).not.toHaveBeenCalled()
    expect(result).toBe(expectation)
  })

  it(`should return an errors array when structured errors found`, async () => {
    const graphqlRunner = createGraphQLRunner(
      createStore(),
      reporter,
      tracingContext
    )

    const expectation = {
      errors: [
        {
          message: `Cannot query field boyhowdy on RootQueryType`,
          locations: [{ line: 1, column: 3 }],
        },
      ],
    }
    execute.mockImplementation(() => Promise.resolve(expectation))

    const result = await graphqlRunner(``, {})
    expect(reporter.panicOnBuild).not.toHaveBeenCalled()
    expect(result).toBe(expectation)
  })

  it(`should throw a structured error when created from createPage file`, async () => {
    const graphqlRunner = createGraphQLRunner(
      createStore(),
      reporter,
      tracingContext
    )

    const errorObject = {
      stack: `Error
      at createPages (my-gatsby-project/gatsby-node.js:32:17)
      `,
      message: `Cannot query field boyhowdy on RootQueryType`,
    }

    execute.mockImplementation(() =>
      Promise.resolve({
        errors: [errorObject],
      })
    )

    await graphqlRunner(``, {})
    expect(reporter.panicOnBuild).toHaveBeenCalled()
    expect(reporter.panicOnBuild).toMatchSnapshot()
  })
})
