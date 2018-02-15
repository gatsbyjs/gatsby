const _ = require(`lodash`)
const {
  graphql,
  GraphQLString,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInputObjectType,
} = require(`graphql`)
const { connectionArgs, connectionDefinitions } = require(`graphql-skip-limit`)

const runSift = require(`../run-sift`)
const { inferObjectStructureFromNodes } = require(`../infer-graphql-type`)
const buildConnectionFields = require(`../build-connection-fields`)
const {
  inferInputObjectStructureFromNodes,
} = require(`../infer-graphql-input-fields`)
const createSortField = require(`../create-sort-field`)

function queryResult(nodes, query, { types = [] } = {}) {
  const nodeType = new GraphQLObjectType({
    name: `Test`,
    fields: inferObjectStructureFromNodes({
      nodes,
      types: [{ name: `Test` }, ...types],
    }),
  })

  const { connectionType: nodeConnection } = connectionDefinitions({
    nodeType,
    connectionFields: () =>
      buildConnectionFields({
        name: `Test`,
        nodes,
        nodeObjectType: nodeType,
      }),
  })

  const { sort, inferredFields } = inferInputObjectStructureFromNodes({
    nodes,
    typeName: `test`,
  })
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => {
        return {
          allNode: {
            name: `nodeConnection`,
            type: nodeConnection,
            args: {
              ...connectionArgs,
              sort: createSortField(`RootQueryType`, sort),
              filter: {
                type: new GraphQLInputObjectType({
                  name: _.camelCase(`filter test`),
                  description: `Filter connection on its fields`,
                  fields: () => inferredFields,
                }),
              },
            },
            resolve(nvi, args) {
              return runSift({
                args,
                nodes,
                connection: true,
                type: nodeType,
              })
            },
          },
        }
      },
    }),
  })

  return graphql(schema, query)
}

describe(`GraphQL Input args`, () => {
  const nodes = [
    {
      index: 0,
      name: `The Mad Max`,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [1, 2, 3, 4],
      key: {
        withEmptyArray: [],
      },
      anotherKey: {
        withANested: {
          emptyArray: [],
          anotherEmptyArray: [],
        },
      },
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
      anObjectArray: [
        { aString: `some string`, aNumber: 2, aBoolean: true },
        { aString: `some string`, aNumber: 2, anArray: [1, 2] },
      ],
      boolean: true,
    },
    {
      index: 1,
      name: `The Mad Wax`,
      hair: 2,
      anArray: [1, 2, 5, 4],
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
      },
      boolean: false,
    },
    {
      index: 2,
      name: `The Mad Wax`,
      hair: 0,
      date: `2006-07-29T22:39:53.000Z`,
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of shave and adventure`,
        blue: 10010,
        circle: `happy`,
      },
    },
  ]

  it(`filters out null example values`, async () => {
    let result = await queryResult(
      [{ foo: null, bar: `baz` }],
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
      [{ foo: {}, bar: `baz` }],
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
      [{ foo: [], bar: `baz` }],
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
      [{ foo: [undefined, null, null], bar: `baz` }],
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
      [{ linked___NODE: `baz`, foo: `bar` }],
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

  it(`handles eq operator`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(filter: {hair: { eq: 2 }}) {
            edges { node { hair }}
          }
        }
      `
    )

    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(1)
    expect(result.data.allNode.edges[0].node.hair).toEqual(2)
  })

  it(`handles eq operator with false value`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(filter: {boolean: { eq: false }}) {
            edges { node { name }}
          }
        }
      `
    )

    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(1)
    expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
  })

  it(`handles eq operator with 0`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(filter: {hair: { eq: 0 }}) {
            edges { node { hair }}
          }
        }
      `
    )

    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(1)
    expect(result.data.allNode.edges[0].node.hair).toEqual(0)
  })

  it(`handles ne operator`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(filter: {hair: { ne: 2 }}) {
            edges { node { hair }}
          }
        }
      `
    )

    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(2)
    expect(result.data.allNode.edges[0].node.hair).toEqual(1)
  })

  it(`handles the regex operator`, async () => {
    let result = await queryResult(
      nodes,
      `
      {
            allNode(filter: {name: { regex: "/^the.*wax/i" }}) {
              edges { node { name }}
            }
          }
    `
    )
    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(2)
    expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
  })

  it(`handles the in operator`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(filter: {anArray: { in: [5] }}) {
            edges { node { name }}
          }
        }
      `
    )
    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(1)
    expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
  })

  it(`handles the glob operator`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(limit: 10, filter: {name: { glob: "*Wax" }}) {
            edges { node { name }}
          }
        }
      `
    )
    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(2)
    expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
  })

  it(`filters date fields`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(filter: {date: { ne: null }}) {
            edges { node { index }}
          }
        }
      `
    )
    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(2)
    expect(result.data.allNode.edges[0].node.index).toEqual(0)
    expect(result.data.allNode.edges[1].node.index).toEqual(2)
  })

  it(`sorts results`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode(
            limit: 10,
            sort: {
              fields: [frontmatter___blue],
              order: DESC
            }
          ) {
            edges { node { name }}
          }
        }
      `
    )
    expect(result.errors).not.toBeDefined()
    expect(result.data.allNode.edges.length).toEqual(3)
    expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
  })

  it(`returns list of distinct values in a field`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode {
            totalCount
            names: distinct(field: name)
            array: distinct(field: anArray)
            blue: distinct(field: frontmatter___blue)
            # Only one node has this field
            circle: distinct(field: frontmatter___circle)
          }
        }
      `
    )
    expect(result.errors).not.toBeDefined()

    expect(result.data.allNode.names.length).toEqual(2)
    expect(result.data.allNode.names[0]).toEqual(`The Mad Max`)

    expect(result.data.allNode.array.length).toEqual(5)
    expect(result.data.allNode.array[0]).toEqual(`1`)

    expect(result.data.allNode.blue.length).toEqual(2)
    expect(result.data.allNode.blue[0]).toEqual(`100`)

    expect(result.data.allNode.circle.length).toEqual(1)
    expect(result.data.allNode.circle[0]).toEqual(`happy`)
  })

  it(`handles the group connection field`, async () => {
    let result = await queryResult(
      nodes,
      ` {
        allNode {
          blue: group(field: frontmatter___blue) {
            field
            fieldValue
            totalCount
          }
          anArray: group(field: anArray) {
            field
            fieldValue
            totalCount
          }
        }
      }`
    )
    expect(result.errors).not.toBeDefined()

    expect(result.data.allNode.blue).toHaveLength(2)
    expect(result.data.allNode.blue[0].fieldValue).toEqual(`100`)
    expect(result.data.allNode.blue[0].field).toEqual(`frontmatter.blue`)
    expect(result.data.allNode.blue[0].totalCount).toEqual(1)

    expect(result.data.allNode.anArray).toHaveLength(5)
    expect(result.data.allNode.anArray[0].fieldValue).toEqual(`1`)
    expect(result.data.allNode.anArray[0].field).toEqual(`anArray`)
    expect(result.data.allNode.anArray[0].totalCount).toEqual(2)
  })

  it(`can query object arrays`, async () => {
    let result = await queryResult(
      nodes,
      `
        {
          allNode {
            edges {
              node {
                anObjectArray {
                  aString
                  aNumber
                  aBoolean
                }
              }
            }
          }
        }
      `
    )
    expect(result.errors).not.toBeDefined()

    expect(result).toMatchSnapshot()
  })
})

describe(`filtering on linked nodes`, () => {
  let types
  beforeEach(() => {
    const { store } = require(`../../redux`)
    types = [
      {
        name: `Child`,
        nodeObjectType: new GraphQLObjectType({
          name: `Child`,
          fields: inferObjectStructureFromNodes({
            nodes: [{ id: `child_1`, hair: `brown`, height: 101 }],
            types: [{ name: `Child` }],
          }),
        }),
      },
      {
        name: `Pet`,
        nodeObjectType: new GraphQLObjectType({
          name: `Pet`,
          fields: inferObjectStructureFromNodes({
            nodes: [{ id: `pet_1`, species: `dog` }],
            types: [{ name: `Pet` }],
          }),
        }),
      },
    ]

    store.dispatch({
      type: `CREATE_NODE`,
      payload: { id: `child_1`, internal: { type: `Child` }, hair: `brown` },
    })
    store.dispatch({
      type: `CREATE_NODE`,
      payload: {
        id: `child_2`,
        internal: { type: `Child` },
        hair: `blonde`,
        height: 101,
      },
    })
    store.dispatch({
      type: `CREATE_NODE`,
      payload: { id: `pet_1`, internal: { type: `Pet` }, species: `dog` },
    })
  })

  it(`filters on linked nodes via id`, async () => {
    let result = await queryResult(
      [
        { linked___NODE: `child_2`, foo: `bar` },
        { linked___NODE: `child_1`, foo: `baz` },
      ],
      `
        {
          allNode(filter: { linked: { hair: { eq: "blonde" } } }) {
            edges { node { linked { hair, height }, foo } }
          }
        }
      `,
      { types }
    )
    expect(result.data.allNode.edges.length).toEqual(1)
    expect(result.data.allNode.edges[0].node.linked.hair).toEqual(`blonde`)
    expect(result.data.allNode.edges[0].node.linked.height).toEqual(101)
    expect(result.data.allNode.edges[0].node.foo).toEqual(`bar`)
  })

  it(`returns all matching linked nodes`, async () => {
    let result = await queryResult(
      [
        { linked___NODE: `child_2`, foo: `bar` },
        { linked___NODE: `child_2`, foo: `baz` },
      ],
      `
        {
          allNode(filter: { linked: { hair: { eq: "blonde" } } }) {
            edges { node { linked { hair, height }, foo } }
          }
        }
      `,
      { types }
    )
    expect(result.data.allNode.edges[0].node.linked.hair).toEqual(`blonde`)
    expect(result.data.allNode.edges[0].node.linked.height).toEqual(101)
    expect(result.data.allNode.edges[0].node.foo).toEqual(`bar`)
    expect(result.data.allNode.edges[1].node.foo).toEqual(`baz`)
  })
})
