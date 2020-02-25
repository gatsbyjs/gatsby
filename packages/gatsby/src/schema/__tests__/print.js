const { build } = require(`..`)
const { buildObjectType } = require(`../types/type-builders`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions/restricted`)
const { printTypeDefinitions } = actions
require(`../../db/__tests__/fixtures/ensure-loki`)()

jest.mock(`fs-extra`)
const fs = require(`fs-extra`)
afterEach(() => {
  fs.writeFile.mockClear()
})

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
    phantomActivity: () => {
      return {
        start: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})
const report = require(`gatsby-cli/lib/reporter`)
afterEach(() => {
  report.error.mockClear()
})

jest.spyOn(global.Date.prototype, `toISOString`).mockReturnValue(`2019-01-01`)

describe(`Print type definitions`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
    const node = {
      id: `test1`,
      internal: {
        type: `Test`,
      },
      foo: 26,
    }
    store.dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    const typeDefs = []
    typeDefs.push(`
      type AnotherTest implements Node & ITest {
        nested: Nested
        date: Date @dateformat(formatString: "YYYY")
        hello(planet: String = "world", language: [Language!]!): String!
      }
      type Nested {
        baz: Boolean
      }
      input Language {
        lang: String
        hello: String
      }
      type OneMoreTest implements Node @infer {
        bar: Boolean
      }
      interface ITest @nodeInterface {
        id: ID!
        date: Date @dateformat(formatString: "YYYY")
      }
      union ThisOrThat = AnotherTest | OneMoreTest
    `)
    typeDefs.push(
      buildObjectType({
        name: `InlineTest`,
        fields: {
          first: `type Inline { foo: Nested }`,
          second: {
            type: `Date`,
            args: {
              bar: `input Baz { qux: Boolean }`,
            },
            extensions: {
              dateformat: {
                formatString: `MM/DD/YYYY`,
              },
            },
          },
        },
        interfaces: [`Node`, `ITest`],
        extensions: {
          infer: true,
          childOf: {
            types: [`OneMoreTest`],
          },
        },
      })
    )
    store.dispatch({
      type: `CREATE_TYPES`,
      payload: typeDefs[0],
      plugin: { name: `gatsby-plugin-test` },
    })
    store.dispatch({
      type: `CREATE_TYPES`,
      payload: typeDefs[1],
      plugin: { name: `gatsby-plugin-another-test` },
    })
  })

  it(`saves type definitions to default file`, async () => {
    store.dispatch(printTypeDefinitions({}))
    await build({})
    expect(fs.writeFile.mock.calls[0][0]).toBe(`schema.gql`)
  })

  it(`saves type definitions to specified file`, async () => {
    store.dispatch(printTypeDefinitions({ path: `typedefs.graphql` }))
    await build({})
    expect(fs.writeFile.mock.calls[0][0]).toBe(`typedefs.graphql`)
  })

  it(`shows error message when file already exists`, async () => {
    fs.existsSync.mockImplementation(() => true)
    store.dispatch(printTypeDefinitions({ path: `typedefs.gql` }))
    await build({})
    expect(report.error).toHaveBeenCalledTimes(1)
    expect(report.error).toHaveBeenCalledWith(
      `Printing type definitions aborted. The file \`typedefs.gql\` already exists.`
    )
    fs.existsSync.mockReset()
  })

  it(`saves correct type definitions`, async () => {
    store.dispatch(printTypeDefinitions({}))
    await build({})
    expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot()
  })

  it(`allows specifying types to include (and includes interfaces and field types)`, async () => {
    store.dispatch(
      printTypeDefinitions({
        include: {
          types: [`AnotherTest`],
        },
      })
    )
    await build({})
    expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot()
  })

  it(`allows specifying types owned by plugins to include`, async () => {
    store.dispatch(
      printTypeDefinitions({
        include: {
          plugins: [`gatsby-plugin-another-test`],
        },
      })
    )
    await build({})
    expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot()
  })

  it(`allows specifying types to exclude`, async () => {
    store.dispatch(
      printTypeDefinitions({
        exclude: {
          types: [`InlineTest`],
        },
      })
    )
    await build({})
    expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot()
  })

  it(`allows specifying types owned by plugins to exclude`, async () => {
    store.dispatch(
      printTypeDefinitions({
        exclude: {
          plugins: [`gatsby-plugin-test`],
        },
      })
    )
    await build({})
    expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot()
  })

  it(`allows explicitly listing types to include without including field types`, async () => {
    store.dispatch(
      printTypeDefinitions({
        include: {
          types: [`InlineTest`],
        },
        withFieldTypes: false,
      })
    )
    await build({})
    expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot()
  })
})
