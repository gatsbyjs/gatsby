const { graphql, GraphQLString, GraphQLObjectType } = require(`graphql`)

const { inferObjectStructureFromNodes } = require(`../infer-graphql-type`)
const nodeConnections = require(`../build-node-connections`)
const { buildNodesSchema } = require(`../index`)
const {
  inferInputObjectStructureFromNodes,
} = require(`../infer-graphql-input-fields`)
const { clearTypeExampleValues } = require(`../data-tree-utils`)
const { store } = require(`../../redux`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

function queryResult(nodes, query, { types = [] } = {}) {
  for (const node of nodes) {
    store.dispatch({ type: `CREATE_NODE`, payload: node })
  }
  const nodeObjectType = new GraphQLObjectType({
    name: `Node`,
    fields: inferObjectStructureFromNodes({
      nodes,
      types: [{ name: `Node` }, ...types],
    }),
  })
  const processedType = {
    nodes,
    name: `Node`,
    nodeObjectType,
    fieldsFromPlugins: [],
  }
  const fields = nodeConnections.buildFieldConfigMap(processedType)
  const schema = buildNodesSchema(fields)
  return graphql(schema, query)
}

beforeEach(() => {
  clearTypeExampleValues()
})

describe(`GraphQL Input args`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
  })
  it(`filters out null example values`, async () => {
    let result = await queryResult(
      [{ id: `1`, internal: { type: `Bar` }, foo: null, bar: `baz` }],
      `
        {
          allNode(foo: { eq: "bar" }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Unknown argument "foo" on field "allNode"`
    )
  })

  it(`filters out empty objects`, async () => {
    let result = await queryResult(
      [{ id: `1`, internal: { type: `Bar` }, foo: {}, bar: `baz` }],
      `
        {
          allNode(foo: { eq: "bar" }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Unknown argument "foo" on field "allNode"`
    )
  })

  it(`filters out empty arrays`, async () => {
    let result = await queryResult(
      [{ id: `1`, internal: { type: `Bar` }, foo: [], bar: `baz` }],
      `
        {
          allNode(foo: { eq: "bar" }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Unknown argument "foo" on field "allNode"`
    )
  })

  it(`filters out sparse arrays`, async () => {
    let result = await queryResult(
      [
        {
          id: `1`,
          internal: { type: `Bar` },
          foo: [undefined, null, null],
          bar: `baz`,
        },
      ],
      `
        {
          allNode(foo: { eq: "bar" }) {
            edges { node { bar } }
          }
        }
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Unknown argument "foo" on field "allNode"`
    )
  })

  it(`uses correct keys for linked fields`, async () => {
    const { store } = require(`../../redux`)
    let types = [{ name: `Bar`, nodeObjectType: GraphQLString }]

    store.dispatch({
      type: `CREATE_NODE`,
      payload: { id: `baz`, internal: { type: `Bar` } },
    })

    let result = await queryResult(
      [
        {
          id: `1`,
          internal: { type: `Bar` },
          linked___NODE: `baz`,
          foo: `bar`,
        },
      ],
      `
        {
          allNode(linked___NODE: { eq: "baz" }) {
            edges { node { linked } }
          }
        }
      `,
      { types }
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Unknown argument "linked___NODE" on field "allNode"`
    )
  })

  it(`Replaces unsupported values in keys`, () => {
    // Add a key with unsupported values to test
    // if they're replaced.
    let fields = inferInputObjectStructureFromNodes({
      nodes: [
        {
          parent: `parent`,
          children: [`bar`],
          foo: {
            parent: `parent`,
            children: [`bar`],
            "foo-moo": `tasty`,
          },
        },
      ],
    }).inferredFields

    expect(Object.keys(fields.foo.type.getFields())[2]).toEqual(`foo_moo`)
  })
  it(`Removes specific root fields`, () => {
    let fields = inferInputObjectStructureFromNodes({
      nodes: [
        {
          parent: `parent`,
          children: [`bar`],
          foo: {
            parent: `parent`,
            children: [`bar`],
          },
        },
      ],
    }).inferredFields

    expect(Object.keys(fields)).toHaveLength(1)
    expect(Object.keys(fields.foo.type.getFields())).toHaveLength(2)
  })

  it(`infers number types`, () => {
    const fields = inferInputObjectStructureFromNodes({
      nodes: [
        {
          int32: 42,
          float: 2.5,
          longint: 3000000000,
        },
      ],
    }).inferredFields
    expect(fields.int32.type.name.endsWith(`Integer`)).toBe(true)
    expect(fields.float.type.name.endsWith(`Float`)).toBe(true)
    expect(fields.longint.type.name.endsWith(`Float`)).toBe(true)
  })
})
