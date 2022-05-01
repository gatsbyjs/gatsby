const { build } = require(`..`)
import {
  buildObjectType,
  buildEnumType,
  buildScalarType,
} from "../types/type-builders"
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions/restricted`)
const { actions: publicActions } = require(`../../redux/actions/public`)
const { createParentChildLink } = publicActions
const { printTypeDefinitions } = actions

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
    panic: jest.fn(console.error),
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
    const node1 = {
      id: `test1`,
      internal: {
        type: `Test`,
      },
      children: [],
      foo: 26,
    }
    const node2 = {
      id: `test2`,
      parent: `test1`,
      internal: {
        type: `FooChild`,
      },
      bar: `bar`,
    }
    const node3 = {
      id: `test3`,
      parent: `test1`,
      internal: {
        type: `BarChild`,
      },
      bar: `bar`,
    }
    store.dispatch({ type: `CREATE_NODE`, payload: { ...node1 } })
    store.dispatch({ type: `CREATE_NODE`, payload: { ...node2 } })
    store.dispatch({ type: `CREATE_NODE`, payload: { ...node3 } })
    createParentChildLink({ parent: node1, child: node2 })
    createParentChildLink({ parent: node1, child: node3 })
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
      interface ITest implements Node {
        id: ID!
        date: Date @dateformat(formatString: "YYYY")
      }
      interface ITest2 implements Node {
        id: ID!
        date: Date @dateformat(formatString: "YYYY")
      }
      union ThisOrThat = AnotherTest | OneMoreTest

      enum SDLEnumSimple {
        One
        Two
      }

      scalar SDLScalar
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
      }),
      buildObjectType({
        name: `BarChild`,
        fields: {
          id: `ID!`,
          fieldWithArgsAndDescription: {
            type: `String`,
            args: {
              withDefault: {
                type: `String`,
                description: `This is description`,
                defaultValue: `Test`,
              },
              withoutDefault: {
                type: `String`,
                description: `This is description too`,
              },
              usingDerivedType: `BarChildSortInput`,
            },
          },
        },
        interfaces: [`Node`],
        extensions: {
          childOf: {
            types: [`Test`],
          },
        },
      }),
      buildEnumType({
        name: `BuilderEnum`,
        values: {
          One: {
            value: `One`,
          },
          Two: {
            value: `Two`,
          },
        },
      }),
      buildScalarType({
        name: `BuilderScalar`,
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
    store.dispatch({
      type: `CREATE_TYPES`,
      payload: typeDefs[2],
      plugin: { name: `gatsby-plugin-another-test` },
    })
    store.dispatch({
      type: `CREATE_TYPES`,
      payload: [typeDefs[3], typeDefs[4]],
      plugin: { name: `gatsby-plugin-shared` },
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
