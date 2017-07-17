const {
  graphql,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
} = require(`graphql`)
const { inferObjectStructureFromNodes } = require(`../infer-graphql-type`)

function queryResult(nodes, fragment, { types = [] } = {}) {
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => {
        return {
          listNode: {
            name: `LISTNODE`,
            type: new GraphQLList(
              new GraphQLObjectType({
                name: `Test`,
                fields: inferObjectStructureFromNodes({
                  nodes,
                  types: [{ name: `Test` }, ...types],
                }),
              })
            ),
            resolve() {
              return nodes
            },
          },
        }
      },
    }),
  })

  return graphql(
    schema,
    `query {
      listNode {
        ${fragment}
      }
    }
    `
  )
}

describe(`GraphQL type inferance`, () => {
  const nodes = [
    {
      id: `foo`,
      name: `The Mad Max`,
      type: `Test`,
      "key-with..unsupported-values": true,
      hair: 1,
      date: `1012-11-01`,
      anArray: [1, 2, 3, 4],
      anObjectArray: [
        { aString: `some string`, aNumber: 2, aBoolean: true },
        { aString: `some string`, aNumber: 2, anArray: [1, 2] },
        { anotherObjectArray: [{ bar: 10 }] },
      ],
      deepObject: {
        level: 1,
        deepObject: {
          level: 2,
          deepObject: {
            level: 3,
          },
        },
      },
      aBoolean: true,
      externalUrl: `https://example.com/awesome.jpg`,
      domain: `pizza.com`,
      frontmatter: {
        date: `1012-11-01`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
    },
    {
      id: `boo`,
      name: `The Mad Wax`,
      type: `Test`,
      hair: 2,
      date: `1984-10-12`,
      anArray: [1, 2, 5, 4],
      anObjectArray: [{ anotherObjectArray: [{ baz: `quz` }] }],
      frontmatter: {
        date: `1984-10-12`,
        title: `The world of slash and adventure`,
        blue: 10010,
      },
    },
  ]

  it(`filters out null example values`, async () => {
    let result = await queryResult(
      [{ foo: null, bar: `baz` }],
      `
        foo
        bar
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Cannot query field "foo" on type "Test".`
    )
  })

  it(`prefers float when multiple number types`, async () => {
    let result = await queryResult(
      [{ number: 1.1 }, { number: 1 }],
      `
        number
      `
    )
    expect(result.data.listNode[0].number).toEqual(1.1)
  })

  it(`filters out empty objects`, async () => {
    let result = await queryResult(
      [{ foo: {}, bar: `baz` }],
      `
        foo
        bar
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Cannot query field "foo" on type "Test".`
    )
  })

  it(`filters out empty arrays`, async () => {
    let result = await queryResult(
      [{ foo: [], bar: `baz` }],
      `
        foo
        bar
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Cannot query field "foo" on type "Test".`
    )
  })

  it(`filters out sparse arrays`, async () => {
    let result = await queryResult(
      [{ foo: [undefined, null, null], bar: `baz` }],
      `
        foo
        bar
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Cannot query field "foo" on type "Test".`
    )
  })

  it(`Removes specific root fields`, () => {
    let fields = inferObjectStructureFromNodes({
      nodes: [
        {
          type: `Test`,
          id: `foo`,
          parent: `parent`,
          children: [`bar`],
          foo: {
            type: `Test`,
            id: `foo`,
            parent: `parent`,
            children: [`bar`],
          },
        },
      ],
      types: [{ name: `Test` }],
    })

    expect(Object.keys(fields)).toHaveLength(2)
    expect(Object.keys(fields.foo.type.getFields())).toHaveLength(4)
  })

  xdescribe(`Linked inference from config mappings`)
  xdescribe(`Linked inference from file URIs`)

  describe(`Linked inference by __NODE convention`, () => {
    let store, types

    beforeEach(() => {
      ;({ store } = require(`../../redux`))
      types = [
        {
          name: `Child`,
          nodeObjectType: new GraphQLObjectType({
            name: `Child`,
            fields: inferObjectStructureFromNodes({
              nodes: [{ id: `child_1`, hair: `brown` }],
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
        payload: { id: `child_2`, internal: { type: `Child` }, hair: `blonde` },
      })
      store.dispatch({
        type: `CREATE_NODE`,
        payload: { id: `pet_1`, internal: { type: `Pet` }, species: `dog` },
      })
    })

    it(`Links nodes`, async () => {
      let result = await queryResult(
        [{ linked___NODE: `child_1` }],
        `
          linked {
            hair
          }
        `,
        { types }
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].linked.hair).toEqual(`brown`)
    })

    it(`Links an array of nodes`, async () => {
      let result = await queryResult(
        [{ linked___NODE: [`child_1`, `child_2`] }],
        `
          linked {
            hair
          }
        `,
        { types }
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].linked[0].hair).toEqual(`brown`)
      expect(result.data.listNode[0].linked[1].hair).toEqual(`blonde`)
    })

    it(`Errors clearly when missing nodes`, async () => {
      expect(() => {
        inferObjectStructureFromNodes({
          nodes: [{ linked___NODE: `baz` }],
          types: [{ name: `Test` }],
        })
      }).toThrow(
        `Encountered an error trying to infer a GraphQL type ` +
          `for: "linked___NODE". There is no corresponding node with the id ` +
          `field matching: "baz"`
      )
    })

    it(`Errors clearly when missing types`, async () => {
      store.dispatch({
        type: `CREATE_NODE`,
        payload: { id: `baz`, internal: { type: `Bar` } },
      })

      expect(() => {
        inferObjectStructureFromNodes({
          nodes: [{ linked___NODE: `baz` }],
          types: [{ name: `Test` }],
        })
      }).toThrow(
        `Encountered an error trying to infer a GraphQL type ` +
          `for: "linked___NODE". There is no corresponding GraphQL type ` +
          `"Bar" available to link to this node.`
      )
    })

    it(`Creates union types when an array field is linking to multiple node types`, async () => {
      let result = await queryResult(
        [{ linked___NODE: [`child_1`, `pet_1`] }],
        `
          linked {
            __typename
            ... on Child {
              hair
            }
            ... on Pet {
              species
            }
          }
        `,
        { types }
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].linked[0].hair).toEqual(`brown`)
      expect(result.data.listNode[0].linked[0].__typename).toEqual(`Child`)
      expect(result.data.listNode[0].linked[1].species).toEqual(`dog`)
      expect(result.data.listNode[0].linked[1].__typename).toEqual(`Pet`)
      store.dispatch({
        type: `CREATE_NODE`,
        payload: { id: `baz`, internal: { type: `Bar` } },
      })
    })
  })

  it(`Infers graphql type from array of nodes`, () =>
    queryResult(
      nodes,
      `
        hair,
        anArray,
        anObjectArray {
          aNumber,
          aBoolean,
          anArray
          anotherObjectArray {
            bar
            baz
          }
        },
        deepObject {
          level
          deepObject {
            level
            deepObject {
              level
            }
          }
        }
        aBoolean,
        externalUrl,
        domain,
        date(formatString: "YYYY"),
        frontmatter {
          title,
          date(formatString: "YYYY")
        }
    `
    ).then(result => expect(result).toMatchSnapshot()))
})
