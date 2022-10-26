import { ExecutionResult } from "graphql"
import { GraphQLRunner } from "../graphql-runner"
import { actions } from "../../redux/actions"
import { store } from "../../redux"
import { build } from "../../schema"
import reporter from "gatsby-cli/lib/reporter"

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: (): any => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
    phantomActivity: (): any => {
      return {
        start: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

beforeAll(() => {
  store.dispatch({ type: `DELETE_CACHE` })
})

afterEach(() => {
  reporter.error.mockClear()
  reporter.warn.mockClear()

  store.getState().schemaCustomization.composer.clear()
  store.getState().schemaCustomization.types = []
})

const FooNodes = {
  Node1: {
    id: `1`,
    foo: `foo`,
    bar: `bar`,
    internal: { type: `Foo`, contentDigest: `1` },
  },
}

describe(`Deprecation warnings`, () => {
  it(`displays warnings when querying deprecated fields`, async () => {
    await buildSchema(
      `
      type Foo implements Node {
        id: ID!
        foo: String @deprecated(reason: "Tired.")
        bar: String
      }
      `,
      [FooNodes.Node1]
    )
    const result = await runQuery(`
      query {
        foo {
          foo
          bar
        }
      }
    `)
    expect(result.errors).not.toBeDefined()
    expect(result.data).toEqual({
      foo: {
        foo: `foo`,
        bar: `bar`,
      },
    })
    expect(reporter.warn).toHaveBeenCalledTimes(1)
    expect(reporter.warn).toHaveBeenCalledWith(
      `The field Foo.foo is deprecated. Tired.\nQueried in /test`
    )
    expect(reporter.error).not.toHaveBeenCalled()
  })

  it(`displays warnings when when using deprecated arguments`, async () => {
    await buildSchema(
      `
      type Foo implements Node {
        id: ID!
        foo(
          arg: String @deprecated(reason: "Tired")
        ): String
        bar: String
      }
    `,
      [FooNodes.Node1]
    )
    const result = await runQuery(`
      query {
        foo {
          foo(arg: "Tired")
          bar
        }
      }
    `)
    expect(result.errors).not.toBeDefined()
    expect(result.data).toEqual({
      foo: {
        foo: `foo`,
        bar: `bar`,
      },
    })
    expect(reporter.warn).toHaveBeenCalledTimes(1)
    expect(reporter.warn).toHaveBeenCalledWith(
      `Field "Foo.foo" argument "arg" is deprecated. Tired\n` +
        `Queried in /test`
    )
  })

  it(`displays warnings when when using deprecated input fields`, async () => {
    await buildSchema(
      `
      input Filter {
        foo: String @deprecated(reason: "Tired.")
      }
      type Foo implements Node {
        id: ID!
        foo(arg: Filter): String
        bar: String
      }
    `,
      [FooNodes.Node1]
    )
    const result = await runQuery(`
      query {
        foo {
          foo(arg: { foo: "whatever" })
          bar
        }
      }
    `)
    expect(result.errors).not.toBeDefined()
    expect(result.data).toEqual({
      foo: {
        foo: `foo`,
        bar: `bar`,
      },
    })
    expect(reporter.warn).toHaveBeenCalledTimes(1)
    expect(reporter.warn).toHaveBeenCalledWith(
      `The input field Filter.foo is deprecated. Tired.\nQueried in /test`
    )
  })

  it(`displays componentPath when passed`, async () => {
    await buildSchema(`
      type Foo implements Node {
        id: ID!
        foo: String @deprecated(reason: "Tired.")
      }
    `)
    await runQuery(
      `query {
        foo { foo }
      }`,
      { componentPath: `/example/path` }
    )
    expect(reporter.warn).toHaveBeenCalledWith(
      `The field Foo.foo is deprecated. Tired.\nQueried in /example/path`
    )
  })
})

async function buildSchema(typeDefs, nodes = []): Promise<void> {
  store.dispatch(actions.createTypes(typeDefs))
  nodes.forEach(nodeInput => {
    // Satisfy node validation
    const node = {
      children: [],
      ...nodeInput,
      internal: { ...nodeInput.internal },
    }
    store.dispatch(actions.createNode(node, { name: `test-plugin` }))
  })
  await build({})
}

async function runQuery(
  query: string,
  params = { componentPath: `/test` }
): Promise<ExecutionResult> {
  const context = { path: `/test` }
  const graphqlRunner = new GraphQLRunner(store)
  return graphqlRunner.query(query, context, {
    parentSpan: undefined,
    queryName: context.path,
    componentPath: params.componentPath,
  })
}
