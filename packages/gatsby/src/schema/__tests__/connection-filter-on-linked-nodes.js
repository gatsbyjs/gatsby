const { graphql } = require(`graphql`)
const { build } = require(`..`)
const withResolverContext = require(`../context`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

function makeNodes() {
  return [
    {
      id: `child_1`,
      internal: { type: `Child` },
      hair: `brown`,
      children: [],
    },
    {
      id: `child_2`,
      internal: { type: `Child` },
      children: [],
      hair: `blonde`,
      height: 101,
    },
    {
      id: `linked_A`,
      internal: { type: `Linked_A` },
      children: [],
      array: [{ linked___NODE: `linked_B` }],
      single: { linked___NODE: `linked_B` },
    },
    {
      id: `linked_B`,
      internal: { type: `Linked_B` },
      children: [],
    },
  ]
}

async function queryResult(nodes, query) {
  store.dispatch({ type: `DELETE_CACHE` })
  nodes.forEach(node => {
    if (!node.internal.contentDigest) {
      node.internal.contentDigest = `0`
    }
    actions.createNode(node, { name: `test` })(store.dispatch)
  })

  await build({})
  const { schema, schemaCustomization } = store.getState()

  const context = { path: `foo` }
  return graphql({
    schema,
    source: query,
    rootValue: undefined,
    contextValue: withResolverContext({
      schema,
      schemaComposer: schemaCustomization.composer,
      context,
      customContext: schemaCustomization.context,
    }),
  })
}

describe(`filtering on linked nodes`, () => {
  it(`filters on linked nodes via id`, async () => {
    const result = await queryResult(
      makeNodes().concat([
        {
          id: `child_2_link`,
          internal: { type: `Test` },
          children: [],
          linked___NODE: `child_2`,
          foo: `bar`,
        },
        {
          id: `child_1_linked`,
          internal: { type: `Test` },
          children: [],
          linked___NODE: `child_1`,
          foo: `baz`,
        },
      ]),
      `
        {
          allTest(filter: { linked: { hair: { eq: "blonde" } } }) {
            edges { node { linked { hair, height }, foo } }
          }
        }
      `
    )
    expect(result.data.allTest.edges.length).toEqual(1)
    expect(result.data.allTest.edges[0].node.linked.hair).toEqual(`blonde`)
    expect(result.data.allTest.edges[0].node.linked.height).toEqual(101)
    expect(result.data.allTest.edges[0].node.foo).toEqual(`bar`)
  })

  it(`returns nested linked fields`, async () => {
    const result = await queryResult(
      [
        {
          id: `child_2`,
          internal: { type: `Child` },
          children: [],
          hair: `blonde`,
          height: 101,
        },
        {
          id: `child_1_link`,
          internal: { type: `Test` },
          children: [],
          nested: {
            linked___NODE: `child_2`,
          },
          foo: `bar`,
        },
      ],
      `
        {
          allTest(filter: { nested: { linked: { hair: { eq: "blonde" } } } }) {
            edges { node { nested { linked { hair, height } }, foo } }
          }
        }
      `
    )
    expect(result.data.allTest.edges[0].node.nested.linked.hair).toEqual(
      `blonde`
    )
    expect(result.data.allTest.edges[0].node.nested.linked.height).toEqual(101)
    expect(result.data.allTest.edges[0].node.foo).toEqual(`bar`)
  })

  it(`returns all matching linked nodes`, async () => {
    const result = await queryResult(
      makeNodes().concat([
        {
          id: `child_2_link`,
          internal: { type: `Test` },
          children: [],
          linked___NODE: `child_2`,
          foo: `bar`,
        },
        {
          id: `child_2_link2`,
          internal: { type: `Test` },
          children: [],
          linked___NODE: `child_2`,
          foo: `baz`,
        },
      ]),
      `
        {
          allTest(filter: { linked: { hair: { eq: "blonde" } } }) {
            edges { node { linked { hair, height }, foo } }
          }
        }
      `
    )
    expect(result.data.allTest.edges[0].node.linked.hair).toEqual(`blonde`)
    expect(result.data.allTest.edges[0].node.linked.height).toEqual(101)
    expect(result.data.allTest.edges[0].node.foo).toEqual(`bar`)
    expect(result.data.allTest.edges[1].node.foo).toEqual(`baz`)
  })

  it(`handles elemMatch operator`, async () => {
    const result = await queryResult(
      makeNodes().concat([
        {
          id: `1`,
          internal: { type: `Test`, counter: 0 },
          children: [],
          linked___NODE: [`child_1`, `child_2`],
          foo: `bar`,
        },
        {
          id: `2`,
          internal: { type: `Test`, counter: 1 },
          children: [],
          linked___NODE: [`child_1`],
          foo: `baz`,
        },
        {
          id: `3`,
          internal: { type: `Test`, counter: 2 },
          children: [],
          linked___NODE: [`child_2`],
          foo: `foo`,
        },
        {
          id: `4`,
          internal: { type: `Test`, counter: 3 },
          children: [],
          array: [{ linked___NODE: [`child_1`, `child_2`] }],
          foo: `lorem`,
        },
        {
          id: `5`,
          internal: { type: `Test`, counter: 4 },
          children: [],
          array: [
            { linked___NODE: [`child_1`] },
            { linked___NODE: [`child_2`] },
          ],
          foo: `ipsum`,
        },
        {
          id: `6`,
          internal: { type: `Test`, counter: 5 },
          children: [],
          array: [{ linked___NODE: [`child_1`] }],
          foo: `sit`,
        },
        {
          id: `7`,
          internal: { type: `Test`, counter: 6 },
          children: [],
          array: [{ linked___NODE: [`child_2`] }],
          foo: `dolor`,
        },
        {
          id: `8`,
          internal: { type: `Test`, counter: 7 },
          children: [],
          foo: `ipsum`,
        },
      ]),
      `
        {
          eq: allTest(
            filter: { linked: { elemMatch: { hair: { eq: "brown" } } } }
          ) {
            edges {
              node {
                foo
              }
            }
          }
          in: allTest(
            filter: {
              linked: { elemMatch: { hair: { in: ["brown", "blonde"] } } }
            }
          ) {
            edges {
              node {
                foo
              }
            }
          }
          insideInlineArrayEq: allTest(
            filter: {
              array: {
                elemMatch: { linked: { elemMatch: { hair: { eq: "brown" } } } }
              }
            }
          ) {
            edges {
              node {
                foo
              }
            }
          }
          insideInlineArrayIn: allTest(
            filter: {
              array: {
                elemMatch: {
                  linked: { elemMatch: { hair: { in: ["brown", "blonde"] } } }
                }
              }
            }
          ) {
            edges {
              node {
                foo
              }
            }
          }
        }
      `
    )

    const itemToEdge = item => {
      return {
        node: {
          foo: item,
        },
      }
    }

    expect(result.data.eq.edges).toEqual([`bar`, `baz`].map(itemToEdge))
    // In case of LMDB results are also sorted by the filter field,
    // so first - all parents with children having "hair: blonde", next - all with "hair: brown"
    const expectedIn = process.env.GATSBY_EXPERIMENTAL_LMDB_INDEXES
      ? [`bar`, `foo`, `baz`]
      : [`bar`, `baz`, `foo`]
    expect(result.data.in.edges).toEqual(expectedIn.map(itemToEdge))
    expect(result.data.insideInlineArrayEq.edges).toEqual(
      [`lorem`, `ipsum`, `sit`].map(itemToEdge)
    )
    const expectedArrayIn = process.env.GATSBY_EXPERIMENTAL_LMDB_INDEXES
      ? [`lorem`, `ipsum`, `dolor`, `sit`]
      : [`lorem`, `ipsum`, `sit`, `dolor`]
    expect(result.data.insideInlineArrayIn.edges).toEqual(
      expectedArrayIn.map(itemToEdge)
    )
  })

  it.skip(`doesn't mutate node object`, async () => {
    // We now infer the InputObjectType from the ObjectType, not from exampleValue
  })

  it.skip(`skips fields with missing nodes`, async () => {
    // We now infer the InputObjectType from the ObjectType, not from exampleValue
  })
})
