// NOTE: Previously `infer-graphql-input-type-test.js`

const { graphql } = require(`graphql`)
const { createSchemaComposer } = require(`../../schema-composer`)
const { buildSchema } = require(`../../schema`)
const { LocalNodeModel } = require(`../../node-model`)
const nodeStore = require(`../../../db/nodes`)
const { store } = require(`../../../redux`)
const { actions } = require(`../../../redux/actions`)
const createPageDependency = require(`../../../redux/actions/add-page-dependency`)
require(`../../../db/__tests__/fixtures/ensure-loki`)()

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

const buildTestSchema = async nodes => {
  store.dispatch({ type: `DELETE_CACHE` })
  nodes.forEach(node =>
    actions.createNode(node, { name: `test` })(store.dispatch)
  )
  const schemaComposer = createSchemaComposer()
  const schema = await buildSchema({
    schemaComposer,
    nodeStore,
    types: [],
    thirdPartySchemas: [],
    inferenceMetadata: store.getState().inferenceMetadata,
  })
  return { schema, schemaComposer }
}
const queryResult = async (nodes, query) => {
  const { schema, schemaComposer } = await buildTestSchema(nodes)
  return graphql(schema, query, undefined, {
    nodeModel: new LocalNodeModel({
      schema,
      nodeStore,
      createPageDependency,
      schemaComposer,
    }),
  })
}

describe(`GraphQL Input args`, () => {
  it(`filters out null example values`, async () => {
    const nodes = [
      {
        id: `1`,
        internal: { type: `Bar`, contentDigest: `0` },
        children: [],
        foo: null,
        bar: `baz`,
      },
    ]
    const result = await queryResult(
      nodes,
      `
        {
          allBar(filter: { foo: { eq: "bar" } }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Field "foo" is not defined by type BarFilterInput.`
    )
  })

  it(`filters out empty objects`, async () => {
    const nodes = [
      {
        id: `1`,
        internal: { type: `Bar`, contentDigest: `0` },
        children: [],
        foo: {},
        bar: `baz`,
      },
    ]
    const result = await queryResult(
      nodes,
      `
        {
          allBar(filter: { foo: { eq: "bar" } }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Field "foo" is not defined by type BarFilterInput.`
    )
  })

  it(`filters out empty arrays`, async () => {
    const nodes = [
      {
        id: `1`,
        internal: { type: `Bar`, contentDigest: `0` },
        children: [],
        foo: [],
        bar: `baz`,
      },
    ]
    const result = await queryResult(
      nodes,
      `
        {
          allBar(filter: { foo: { eq: "bar" } }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Field "foo" is not defined by type BarFilterInput.`
    )
  })

  it(`filters out sparse arrays`, async () => {
    const nodes = [
      {
        id: `1`,
        internal: { type: `Bar`, contentDigest: `0` },
        children: [],
        foo: [undefined, null, null],
        bar: `baz`,
      },
    ]
    const result = await queryResult(
      nodes,
      `
        {
          allBar(filter: { foo: { eq: "bar" } }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Field "foo" is not defined by type BarFilterInput.`
    )
  })

  it(`uses correct keys for linked fields`, async () => {
    const nodes = [
      {
        id: `1`,
        internal: { type: `Bar`, contentDigest: `0` },
        children: [],
        linked___NODE: `baz`,
        foo: `bar`,
      },
      {
        id: `baz`,
        internal: { type: `Foo`, contentDigest: `0` },
        children: [],
      },
    ]
    const result = await queryResult(
      nodes,
      `
        {
          allBar(filter: { linked___NODE: { eq: "baz" } }) {
            edges { node { linked { id } } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Field "linked___NODE" is not defined by type BarFilterInput.`
    )
  })

  it(`Replaces unsupported values in keys`, async () => {
    // NOTE: This does not make much sense anymore (we sanitize
    // fieldnames for ObjectType, and derive InputType from there)

    // Add a key with unsupported values to test
    // if they're replaced.

    const nodes = [
      {
        id: `1`,
        internal: { type: `Test`, contentDigest: `0` },
        parent: null,
        children: [],
        foo: {
          parent: `parent`,
          children: [`bar`],
          "foo-moo": `tasty`,
        },
      },
    ]
    const { schema } = await buildTestSchema(nodes)
    const fields = schema.getType(`TestFilterInput`).getFields()

    expect(Object.keys(fields.foo.type.getFields())[2]).toEqual(`foo_moo`)
  })

  it.skip(`Removes specific root fields`, async () => {
    // We don't do that anymoe
  })

  it(`infers number types`, async () => {
    const nodes = [
      {
        id: `1`,
        internal: { type: `Test`, contentDigest: `0` },
        children: [],
        int32: 42,
        float: 2.5,
        longint: 3000000000,
      },
    ]
    const { schema } = await buildTestSchema(nodes)
    const fields = schema.getType(`TestFilterInput`).getFields()

    expect(fields.int32.type.name).toBe(`IntQueryOperatorInput`)
    expect(fields.float.type.name).toBe(`FloatQueryOperatorInput`)
    expect(fields.longint.type.name).toBe(`FloatQueryOperatorInput`)
  })
})
