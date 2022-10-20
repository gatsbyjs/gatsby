const { graphql } = require(`graphql`)
const { build } = require(`../..`)
const withResolverContext = require(`../../context`)
import { buildInterfaceType, buildObjectType } from "../../types/type-builders"
const { store } = require(`../../../redux`)
const { dispatch } = store
const { actions } = require(`../../../redux/actions`)
const { createTypes, createFieldExtension } = actions

const report = require(`gatsby-cli/lib/reporter`)
report.panic = jest.fn()
report.warn = jest.fn()
afterEach(() => {
  report.panic.mockClear()
  report.warn.mockClear()
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

describe(`Queryable Node interfaces with interface inheritance`, () => {
  beforeEach(() => {
    dispatch({ type: `DELETE_CACHE` })
    const nodes = [
      {
        id: `test1`,
        internal: { type: `Test`, contentDigest: `0` },
        foo: `foo`,
        bar: `bar`,
        date: new Date(`2019-01-01`),
      },
      {
        id: `anothertest1`,
        internal: { type: `AnotherTest`, contentDigest: `0` },
        foo: `foooo`,
        baz: `baz`,
        date: new Date(`2018-01-01`),
      },
      {
        id: `tbtest1`,
        internal: { type: `TBTest`, contentDigest: `0` },
        foo: `foo`,
        bar: `bar`,
        date: new Date(`2019-01-01`),
      },
      {
        id: `anotherbttest1`,
        internal: { type: `AnotherTBTest`, contentDigest: `0` },
        foo: `foooo`,
        baz: `baz`,
        date: new Date(`2018-01-01`),
      },
    ]
    nodes.forEach(node =>
      actions.createNode(node, { name: `test` })(store.dispatch)
    )
    dispatch(
      createTypes(`
        interface TestInterface implements Node {
          id: ID!
          foo: String
          date: Date @dateformat
        }
        type Test implements Node & TestInterface {
          foo: String
          bar: String
          date: Date @dateformat
        }
        type AnotherTest implements Node & TestInterface {
          foo: String
          baz: String
          date: Date @dateformat
        }
      `)
    )
  })

  it(`adds root query fields for interface with Node interface`, async () => {
    const { schema } = await buildSchema()
    const rootQueryFields = schema.getType(`Query`).getFields()
    expect(rootQueryFields.testInterface).toBeDefined()
    expect(rootQueryFields.allTestInterface).toBeDefined()
    expect(rootQueryFields.testInterface.resolve).toBeDefined()
    expect(rootQueryFields.allTestInterface.resolve).toBeDefined()
  })

  it(`does not add root query fields for interface without Node inheritance`, async () => {
    dispatch(
      createTypes(`
        interface WrongInterface {
          id: ID!
          foo: String
        }
        type Wrong implements Node & WrongInterface {
          foo: String
        }
        type WrongAgain implements Node & WrongInterface {
          foo: String
        }
      `)
    )
    const { schema } = await buildSchema()
    const rootQueryFields = schema.getType(`Query`).getFields()
    expect(rootQueryFields.wrongInterface).toBeUndefined()
    expect(rootQueryFields.allWrongInterface).toBeUndefined()
  })

  it(`shows error when not all types implementing the queryable interface implement the Node interface`, async () => {
    dispatch(
      createTypes(`
        interface WrongInterface implements Node {
          id: ID!
          foo: String
        }
        type Wrong implements WrongInterface {
          foo: String
        }
        type WrongAgain implements WrongInterface {
          foo: String
        }
      `)
    )
    await buildSchema()
    expect(report.panic).toBeCalledWith(
      `Types implementing queryable interfaces must also implement the \`Node\` interface. ` +
        `Check the type definition of \`Wrong\`, \`WrongAgain\`.`
    )
  })

  it(`adds root query fields for interface extending Node interface (type builder)`, async () => {
    dispatch(
      createTypes([
        buildInterfaceType({
          name: `TypeBuilderInterface`,
          interfaces: [`Node`],
          fields: {
            id: `ID!`,
            foo: `String`,
            date: {
              type: `Date`,
              extensions: {
                dateformat: {},
              },
            },
          },
        }),
        buildObjectType({
          name: `TBTest`,
          interfaces: [`Node`, `TypeBuilderInterface`],
          fields: {
            foo: `String`,
            date: {
              type: `Date`,
              extensions: {
                dateformat: {},
              },
            },
          },
        }),
        buildObjectType({
          name: `AnotherTBTest`,
          interfaces: [`Node`, `TypeBuilderInterface`],
          fields: {
            foo: `String`,
            date: {
              type: `Date`,
              extensions: {
                dateformat: {},
              },
            },
          },
        }),
      ])
    )
    const query = `
      {
        allTypeBuilderInterface(
          filter: { foo: { eq: "foooo" } }
        ) {
          nodes {
            foo
            date(formatString: "YYYY")
          }
        }
        typeBuilderInterface(foo: { eq: "foooo" }) {
          foo
          date(formatString: "MM/DD/YYYY")
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allTypeBuilderInterface: {
        nodes: [
          {
            foo: `foooo`,
            date: `2018`,
          },
        ],
      },
      typeBuilderInterface: {
        foo: `foooo`,
        date: `01/01/2018`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`returns correct results for query`, async () => {
    const query = `
      {
        allTestInterface {
          nodes {
            foo
            ...on AnotherTest {
              baz
            }
            ...on Node {
              id
            }
          }
        }
        testInterface {
          foo
          ...on Test {
            bar
          }
          ...on Node {
            id
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allTestInterface: {
        nodes: [
          {
            foo: `foo`,
            id: `test1`,
          },
          {
            foo: `foooo`,
            baz: `baz`,
            id: `anothertest1`,
          },
        ],
      },
      testInterface: {
        foo: `foo`,
        bar: `bar`,
        id: `test1`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`returns correct results for query with args`, async () => {
    const query = `
      {
        allTestInterface(
          filter: { foo: { eq: "foooo" } }
        ) {
          nodes {
            foo
          }
        }
        testInterface(foo: { eq: "foooo" }) {
          foo
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allTestInterface: {
        nodes: [
          {
            foo: `foooo`,
          },
        ],
      },
      testInterface: {
        foo: `foooo`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`adds input args from extensions to fields`, async () => {
    const query = `
      {
        allTestInterface {
          nodes {
            date(formatString: "YYYY")
          }
        }
        testInterface {
          date(formatString: "MM/DD/YYYY")
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allTestInterface: {
        nodes: [
          {
            date: `2019`,
          },
          {
            date: `2018`,
          },
        ],
      },
      testInterface: {
        date: `01/01/2019`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`shows error when interface implementing Node interface does not have id field`, async () => {
    dispatch(
      createTypes(`
        interface NotWrongInterface implements Node {
          id: ID!
          foo: String
        }
        interface WrongInterface implements Node {
          foo: String
        }
      `)
    )
    await build({})
    expect(report.panic).toBeCalledTimes(1)
    expect(report.panic).toBeCalledWith(
      `Interfaces with the \`nodeInterface\` extension must have a field ` +
        `\`id\` of type \`ID!\`. Check the type definition of \`WrongInterface\`.`
    )
  })

  it(`works with special case id: { eq: $id } queries`, async () => {
    const query = `
      {
        testInterface(id: { eq: "test1" }) {
          id
        }
        test(id: { eq: "test1" }) {
          id
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      testInterface: {
        id: `test1`,
      },
      test: {
        id: `test1`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`uses concrete type resolvers when filtering on interface fields`, async () => {
    const nodes = [
      {
        id: `author1`,
        internal: { type: `AuthorYaml`, counter: 0 },
        name: `Author 1`,
        birthday: new Date(Date.UTC(1978, 8, 26)),
      },
      {
        id: `author2`,
        internal: { type: `AuthorJson`, counter: 1 },
        name: `Author 2`,
        birthday: new Date(Date.UTC(1978, 8, 26)),
      },
      {
        id: `post1`,
        internal: { type: `ThisPost`, counter: 2 },
        author: `author1`,
      },
      {
        id: `post2`,
        internal: { type: `ThatPost`, counter: 3 },
        author: `author2`,
      },
    ]
    nodes.forEach(node =>
      dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    )
    dispatch(
      createFieldExtension({
        name: `echo`,
        args: {
          value: `String!`,
        },
        extend(options) {
          return {
            resolve() {
              return options.value
            },
          }
        },
      })
    )
    dispatch(
      createTypes(`
        interface Post implements Node {
          id: ID!
          author: Author @link
        }
        type ThisPost implements Node & Post {
          author: Author @link
        }
        type ThatPost implements Node & Post {
          author: Author @link
        }
        interface Author implements Node {
          id: ID!
          name: String
          echo: String @echo(value: "Interface")
        }
        type AuthorJson implements Node & Author {
          name: String
          echo: String @echo(value: "Concrete Type")
        }
        type AuthorYaml implements Node & Author {
          name: String
          echo: String @echo(value: "Another Concrete Type")
        }
      `)
    )
    const query = `
      {
        allPost(
          filter: {
            author: {
              echo: {
                in: ["Concrete Type", "Another Concrete Type"]
              }
            }
          }
        ) {
          nodes {
            author {
              name
              echo
            }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allPost: {
        nodes: [
          {
            author: {
              name: `Author 1`,
              echo: `Another Concrete Type`,
            },
          },
          {
            author: {
              name: `Author 2`,
              echo: `Concrete Type`,
            },
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`materializes and searches by concrete type`, async () => {
    dispatch({ type: `DELETE_CACHE` })

    const nodes = [
      {
        id: `0`,
        title: `Foo Bar`,
        slugInternal: `foo-bar`,
        internal: {
          type: `FooConcrete`,
          contentDigest: `0`,
          counter: 0,
        },
      },
    ]

    nodes.forEach(node =>
      dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    )

    dispatch(
      createTypes(`
        interface FooInterface implements Node {
          id: ID!
          title: String
          slug: String
        }

        type FooConcrete implements Node & FooInterface {
          id: ID!
          title: String
          slug: String @proxy(from: "slugInternal")
        }
      `)
    )

    expect(
      await runQuery(`
        {
          allFooConcrete(filter: {slug: { eq: "foo-bar"}}) {
            nodes {
            id
          }
          }
        }
        `)
    ).toMatchInlineSnapshot(`
      Object {
        "allFooConcrete": Object {
          "nodes": Array [
            Object {
              "id": "0",
            },
          ],
        },
      }
    `)

    expect(
      await runQuery(`
        {
          allFooInterface(filter: {slug: { eq: "foo-bar"}}) {
            nodes {
              id
            }
          }
        }
        `)
    ).toMatchInlineSnapshot(`
      Object {
        "allFooInterface": Object {
          "nodes": Array [
            Object {
              "id": "0",
            },
          ],
        },
      }
    `)
  })
})

const buildSchema = async () => {
  await build({})
  const {
    schemaCustomization: { composer: schemaComposer },
    schema,
  } = store.getState()
  return { schema, schemaComposer }
}

const runQuery = async query => {
  const { schema, schemaComposer } = await buildSchema()
  const results = await graphql({
    schema,
    source: query,
    rootValue: undefined,
    contextValue: withResolverContext({
      schema,
      schemaComposer,
    }),
  })
  expect(results.errors).toBeUndefined()
  return results.data
}
