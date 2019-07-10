const { graphql } = require(`graphql`)
const { build } = require(`../..`)
const withResolverContext = require(`../../context`)
const { buildObjectType } = require(`../../types/type-builders`)
const { store } = require(`../../../redux`)
const { dispatch } = store
const { actions } = require(`../../../redux/actions/restricted`)
const { createTypes } = actions
require(`../../../db/__tests__/fixtures/ensure-loki`)()

const report = require(`gatsby-cli/lib/reporter`)
report.error = jest.fn()
report.panic = jest.fn()
afterEach(() => {
  report.error.mockClear()
  report.panic.mockClear()
})

describe(`Define parent-child relationships with field extensions`, () => {
  beforeEach(() => {
    dispatch({ type: `DELETE_CACHE` })
    const nodes = [
      {
        id: `parent1`,
        internal: {
          type: `Parent`,
          contentDigest: `Parent1`,
          mediaType: `application/listenup`,
        },
        parent: null,
        children: [`child1`, `anotherchild1`, `anotherchild2`],
      },
      {
        id: `parent2`,
        internal: {
          type: `Parent`,
          contentDigest: `Parent2`,
          mediaType: `application/listenup`,
        },
        parent: null,
        children: [`child2`],
      },
      {
        id: `relative`,
        internal: {
          type: `Relative`,
          contentDigest: `Relative1`,
          mediaType: `multipart/related`,
        },
        parent: null,
        children: [`child1`],
      },
      {
        id: `child1`,
        internal: {
          type: `Child`,
          contentDigest: `Child1`,
        },
        parent: [`parent1`],
        children: [],
        name: `Child 1`,
      },
      {
        id: `child2`,
        internal: {
          type: `Child`,
          contentDigest: `Child2`,
        },
        parent: [`parent2`],
        children: [],
        name: `Child 2`,
      },
      {
        id: `anotherchild1`,
        internal: {
          type: `AnotherChild`,
          contentDigest: `AnotherChild1`,
        },
        parent: [`parent1`],
        children: [],
        name: `Another Child 1`,
      },
      {
        id: `anotherchild2`,
        internal: {
          type: `AnotherChild`,
          contentDigest: `AnotherChild2`,
        },
        parent: [`parent1`],
        children: [],
        name: `Another Child 2`,
      },
    ]
    nodes.forEach(node => {
      dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    })
  })

  it(`adds child fields to parent type with childOf extension`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node {
          id: ID!
        }
        type Child implements Node @childOf(types: ["Parent"]) {
          id: ID!
        }
        type AnotherChild implements Node @childOf(types: ["Parent"]) {
          id: ID!
        }
        type ChildWithoutNodes implements Node @childOf(types: ["Parent"]) {
          id: ID!
        }
      `)
    )
    const schema = await buildSchema()
    const parentFields = schema.getType(`Parent`).getFields()
    expect(parentFields.childChild).toBeDefined()
    expect(parentFields.childChild.resolve).toBeDefined()
    expect(parentFields.childAnotherChild).toBeDefined()
    expect(parentFields.childAnotherChild.resolve).toBeDefined()
    expect(parentFields.childChildWithoutNodes).toBeDefined()
    expect(parentFields.childChildWithoutNodes.resolve).toBeDefined()
  })

  it(`does not implicitly add child fields to parent type when parent type is @dontInfer`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node @dontInfer {
          id: ID!
        }
        type Child implements Node {
          id: ID!
        }
        type AnotherChild implements Node {
          id: ID!
        }
        type ChildWithoutNodes implements Node {
          id: ID!
        }
      `)
    )
    const schema = await buildSchema()
    const parentFields = schema.getType(`Parent`).getFields()
    expect(parentFields.childChild).toBeUndefined()
    expect(parentFields.childAnotherChild).toBeUndefined()
    expect(parentFields.childChildWithoutNodes).toBeUndefined()
  })

  it(`adds child fields to parent type with childOf(many: true) extension`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node @dontInfer {
          id: ID!
        }
        type Child implements Node @childOf(types: ["Parent"], many: true) {
          id: ID!
        }
        type AnotherChild implements Node @childOf(types: ["Parent"], many: true) {
          id: ID!
        }
        type ChildWithoutNodes implements Node @childOf(types: ["Parent"], many: true) {
          id: ID!
        }
      `)
    )
    const schema = await buildSchema()
    const parentFields = schema.getType(`Parent`).getFields()
    expect(parentFields.childrenChild).toBeDefined()
    expect(parentFields.childrenChild.resolve).toBeDefined()
    expect(parentFields.childChild).toBeUndefined()
    expect(parentFields.childrenAnotherChild).toBeDefined()
    expect(parentFields.childrenAnotherChild.resolve).toBeDefined()
    expect(parentFields.childAnotherChild).toBeUndefined()
    expect(parentFields.childrenChildWithoutNodes).toBeDefined()
    expect(parentFields.childrenChildWithoutNodes.resolve).toBeDefined()
    expect(parentFields.childChildWithoutNodes).toBeUndefined()
  })

  it(`shows error when childOf extension is used on type that does not implement the Node interface`, async () => {
    dispatch(
      createTypes(`
        type Wrong @childOf(types: ["Parent"]) {
          foo: String
        }
      `)
    )
    await buildSchema()
    expect(report.error).toBeCalledWith(
      `The \`childOf\` extension can only be used on types that implement the \`Node\` interface.\n` +
        `Check the type definition of \`Wrong\`.`
    )
  })

  it(`returns correct query results`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node @dontInfer {
          id: ID!
        }
        type Child implements Node @childOf(types: ["Parent"]) {
          name: String
        }
        type AnotherChild implements Node @childOf(types: ["Parent"], many: true) {
          name: String
        }
        type ChildWithoutNodes implements Node @childOf(types: ["Parent"]) {
          name: String
        }
      `)
    )
    const query = `
      {
        allParent {
          nodes {
            id
            childChild {
              name
            }
            childrenAnotherChild {
              name
            }
            childChildWithoutNodes {
              name
            }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allParent: {
        nodes: [
          {
            id: `parent1`,
            childChild: {
              name: `Child 1`,
            },
            childrenAnotherChild: [
              {
                name: `Another Child 1`,
              },
              {
                name: `Another Child 2`,
              },
            ],
            childChildWithoutNodes: null,
          },
          {
            id: `parent2`,
            childChild: {
              name: `Child 2`,
            },
            childrenAnotherChild: [],
            childChildWithoutNodes: null,
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`returns correct query results (type builder)`, async () => {
    dispatch(
      createTypes([
        buildObjectType({
          name: `Parent`,
          interfaces: [`Node`],
          fields: {},
          extensions: {
            infer: false,
          },
        }),
        buildObjectType({
          name: `Child`,
          interfaces: [`Node`],
          fields: {
            name: `String`,
          },
          extensions: {
            childOf: {
              types: [`Parent`],
            },
          },
        }),
        buildObjectType({
          name: `AnotherChild`,
          interfaces: [`Node`],
          fields: {
            name: `String`,
          },
          extensions: {
            childOf: {
              types: [`Parent`],
              many: true,
            },
          },
        }),
        buildObjectType({
          name: `ChildWithoutNodes`,
          interfaces: [`Node`],
          fields: {
            name: `String`,
          },
          extensions: {
            childOf: {
              types: [`Parent`],
            },
          },
        }),
      ])
    )
    const query = `
      {
        allParent {
          nodes {
            id
            childChild {
              name
            }
            childrenAnotherChild {
              name
            }
            childChildWithoutNodes {
              name
            }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allParent: {
        nodes: [
          {
            id: `parent1`,
            childChild: {
              name: `Child 1`,
            },
            childrenAnotherChild: [
              {
                name: `Another Child 1`,
              },
              {
                name: `Another Child 2`,
              },
            ],
            childChildWithoutNodes: null,
          },
          {
            id: `parent2`,
            childChild: {
              name: `Child 2`,
            },
            childrenAnotherChild: [],
            childChildWithoutNodes: null,
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`adds child fields to mime-type handling types with childOf extension`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node @dontInfer @mimeTypes(types: ["application/listenup"]) {
          id: ID!
        }
        type Relative implements Node @dontInfer @mimeTypes(types: ["multipart/related"]) {
          id: ID!
        }
        type Child implements Node @childOf(mimeTypes: ["application/listenup", "multipart/related"]) {
          id: ID!
        }
        type AnotherChild implements Node @childOf(mimeTypes: ["application/listenup", "multipart/related"], many: true) {
          id: ID!
        }
        type ChildWithoutNodes implements Node @childOf(mimeTypes: ["application/listenup", "multipart/related"]) {
          id: ID!
        }
      `)
    )
    const schema = await buildSchema()
    const parentFields = schema.getType(`Parent`).getFields()
    expect(parentFields.childChild).toBeDefined()
    expect(parentFields.childChild.resolve).toBeDefined()
    expect(parentFields.childrenChild).toBeUndefined()
    expect(parentFields.childrenAnotherChild).toBeDefined()
    expect(parentFields.childrenAnotherChild.resolve).toBeDefined()
    expect(parentFields.childAnotherChild).toBeUndefined()
    expect(parentFields.childChildWithoutNodes).toBeDefined()
    expect(parentFields.childChildWithoutNodes.resolve).toBeDefined()
    expect(parentFields.childChildrenWithoutNodes).toBeUndefined()
    const relativeFields = schema.getType(`Relative`).getFields()
    expect(relativeFields.childChild).toBeDefined()
    expect(relativeFields.childChild.resolve).toBeDefined()
    expect(relativeFields.childrenChild).toBeUndefined()
    expect(relativeFields.childrenAnotherChild).toBeDefined()
    expect(relativeFields.childrenAnotherChild.resolve).toBeDefined()
    expect(relativeFields.childAnotherChild).toBeUndefined()
    expect(relativeFields.childChildWithoutNodes).toBeDefined()
    expect(relativeFields.childChildWithoutNodes.resolve).toBeDefined()
    expect(relativeFields.childChildrenWithoutNodes).toBeUndefined()
  })

  it(`returns correct query results for mime-types`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node @dontInfer @mimeTypes(types: ["application/listenup"]) {
          id: ID!
        }
        type Relative implements Node @dontInfer @mimeTypes(types: ["multipart/related"]) {
          id: ID!
        }
        type Child implements Node @childOf(mimeTypes: ["application/listenup", "multipart/related"]) {
          name: String
        }
        type AnotherChild implements Node @childOf(mimeTypes: ["application/listenup", "multipart/related"], many: true) {
          name: String
        }
        type ChildWithoutNodes implements Node @childOf(mimeTypes: ["application/listenup", "multipart/related"]) {
          name: String
        }
      `)
    )
    const query = `
      {
        allParent {
          nodes {
            childChild {
              name
            }
            childrenAnotherChild {
              name
            }
          }
        }
        allRelative {
          nodes {
            childChild {
              name
            }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allParent: {
        nodes: [
          {
            childChild: {
              name: `Child 1`,
            },
            childrenAnotherChild: [
              {
                name: `Another Child 1`,
              },
              {
                name: `Another Child 2`,
              },
            ],
          },
          {
            childChild: {
              name: `Child 2`,
            },
            childrenAnotherChild: [],
          },
        ],
      },
      allRelative: {
        nodes: [
          {
            childChild: {
              name: `Child 1`,
            },
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`setting both @childOf(types: [], mimeTypes: [])`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node @dontInfer @mimeTypes(types: ["application/listenup"]) {
          id: ID!
        }
        type Relative implements Node @dontInfer @mimeTypes(types: ["multipart/related"]) {
          id: ID!
        }
        type Child implements Node @childOf(types: ["Relative"], mimeTypes: ["application/listenup"]) {
          name: String
        }
        type AnotherChild implements Node @childOf(types: ["Relative"], mimeTypes: ["multipart/related"], many: true) {
          name: String
        }
      `)
    )
    const query = `
      {
        allParent {
          nodes {
            childChild {
              name
            }
          }
        }
        allRelative {
          nodes {
            childChild {
              name
            }
            childrenAnotherChild {
              name
            }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allParent: {
        nodes: [
          {
            childChild: {
              name: `Child 1`,
            },
          },
          {
            childChild: {
              name: `Child 2`,
            },
          },
        ],
      },
      allRelative: {
        nodes: [
          {
            childChild: {
              name: `Child 1`,
            },
            childrenAnotherChild: [],
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`handles @childOf on interfaces`, async () => {
    dispatch(
      createTypes(`
        type Parent implements Node @dontInfer @mimeTypes(types: ["application/listenup"]) {
          id: ID!
        }
        type Relative implements Node @dontInfer @mimeTypes(types: ["multipart/related"]) {
          id: ID!
        }
        interface NextGeneration @nodeInterface @childOf(mimeTypes: ["application/listenup", "multipart/related"], many: true) {
          id: ID!
          name: String
        }
        type Child implements Node & NextGeneration @childOf(mimeTypes: ["application/listenup", "multipart/related"]) {
          name: String
        }
        type AnotherChild implements Node & NextGeneration @childOf(mimeTypes: ["application/listenup", "multipart/related"]) {
          name: String
        }
        type ChildWithoutNodes implements Node & NextGeneration @childOf(mimeTypes: ["application/listenup", "multipart/related"]) {
          name: String
        }
      `)
    )
    const query = `
      {
        allParent {
          nodes {
            childrenNextGeneration {
              __typename
              id
            }
          }
        }
        allRelative {
          nodes {
            childrenNextGeneration {
              __typename
              id
            }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allParent: {
        nodes: [
          {
            childrenNextGeneration: [
              {
                __typename: `Child`,
                id: `child1`,
              },
              {
                __typename: `AnotherChild`,
                id: `anotherchild1`,
              },
              {
                __typename: `AnotherChild`,
                id: `anotherchild2`,
              },
            ],
          },
          {
            childrenNextGeneration: [
              {
                __typename: `Child`,
                id: `child2`,
              },
            ],
          },
        ],
      },
      allRelative: {
        nodes: [
          {
            childrenNextGeneration: [
              {
                __typename: `Child`,
                id: `child1`,
              },
            ],
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it.todo(`adds children fields to interfaces with @nodeInterface`)
  it.todo(
    `adds children fields to interfaces with @nodeInterface (mime-type relation)`
  )
  it.todo(`does not add children fields to interfaces without @nodeInterface`)
})

const buildSchema = async () => {
  await build({})
  return store.getState().schema
}

const runQuery = async query => {
  const schema = await buildSchema()
  const results = await graphql(
    schema,
    query,
    undefined,
    withResolverContext({}, schema)
  )
  expect(results.errors).toBeUndefined()
  return results.data
}
