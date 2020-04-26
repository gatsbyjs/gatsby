jest.mock(`graphql`)

const createGraphqlRunner = require(`../graphql-runner`)
const { execute, validate, parse } = require(`graphql`)

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

describe(`grapqhl-runner`, () => {
  let reporter

  beforeEach(() => {
    reporter = {
      panicOnBuild: jest.fn(),
    }
  })

  it(`should return the result when grapqhl has no errors`, async () => {
    const graphqlRunner = createGraphqlRunner(createStore(), reporter)

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
    const graphqlRunner = createGraphqlRunner(createStore(), reporter)

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
    const graphqlRunner = createGraphqlRunner(createStore(), reporter)

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
