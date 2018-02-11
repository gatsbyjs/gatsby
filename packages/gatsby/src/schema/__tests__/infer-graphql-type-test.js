const {
  graphql,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
} = require(`graphql`)
const path = require(`path`)
const normalizePath = require(`normalize-path`)

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
    `,
    null,
    { path: `/` }
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
      aNestedArray: [[1, 2, 3, 4], [5, 6, 7, 8]],
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
      aNestedArray: [[1, 2, 3, 4]],
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

  describe(`Handles dates`, () => {
    it(`Handles integer with valid date format`, async () => {
      let result = await queryResult(
        [{ number: 2018 }, { number: 1987 }],
        `
          number
        `
      )
      expect(result.data.listNode[0].number).toEqual(2018)
    })

    it(`Infers from Date objects`, async () => {
      let result = await queryResult(
        [
          { dateObject: new Date(Date.UTC(2012, 10, 5)) },
          { dateObject: new Date(Date.UTC(2012, 10, 5)) },
        ],
        `
          dateObject
        `
      )
      expect(result).toMatchSnapshot()
    })

    it(`Infers from array of Date objects`, async () => {
      let result = await queryResult(
        [
          {
            dateObject: [
              new Date(Date.UTC(2012, 10, 5)),
              new Date(Date.UTC(2012, 10, 6)),
            ],
          },
          { dateObject: [new Date(Date.UTC(2012, 10, 5))] },
        ],
        `
          dateObject
        `
      )
      expect(result).toMatchSnapshot()
    })

    it(`Infers from date strings`, async () => {
      let result = await queryResult(
        [{ date: `1012-11-01` }],
        `
          date(formatString:"DD.MM.YYYY")
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].date).toEqual(`01.11.1012`)
    })

    it(`Infers from arrays of date strings`, async () => {
      let result = await queryResult(
        [{ date: [`1012-11-01`, `10390203`] }],
        `
          date(formatString:"DD.MM.YYYY")
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].date.length).toEqual(2)
      expect(result.data.listNode[0].date[0]).toEqual(`01.11.1012`)
      expect(result.data.listNode[0].date[1]).toEqual(`03.02.1039`)
    })
  })

  xdescribe(`Linked inference from config mappings`)

  describe(`Linked inference from file URIs`, () => {
    let store, types, dir

    beforeEach(() => {
      ;({ store } = require(`../../redux`))

      const { setFileNodeRootType } = require(`../types/type-file`)
      const fileType = {
        name: `File`,
        nodeObjectType: new GraphQLObjectType({
          name: `File`,
          fields: inferObjectStructureFromNodes({
            nodes: [{ id: `file_1`, absolutePath: `path`, dir: `path` }],
            types: [{ name: `File` }],
          }),
        }),
      }

      types = [fileType]
      setFileNodeRootType(fileType.nodeObjectType)

      dir = normalizePath(path.resolve(`/path/`))

      store.dispatch({
        type: `CREATE_NODE`,
        payload: {
          id: `parent`,
          internal: { type: `File` },
          absolutePath: normalizePath(path.resolve(dir, `index.md`)),
          dir: dir,
        },
      })
      store.dispatch({
        type: `CREATE_NODE`,
        payload: {
          id: `file_1`,
          internal: { type: `File` },
          absolutePath: normalizePath(path.resolve(dir, `file_1.jpg`)),
          dir,
        },
      })
      store.dispatch({
        type: `CREATE_NODE`,
        payload: {
          id: `file_2`,
          internal: { type: `File` },
          absolutePath: normalizePath(path.resolve(dir, `file_2.txt`)),
          dir,
        },
      })
    })

    it(`Links to file node`, async () => {
      let result = await queryResult(
        [{ file: `./file_1.jpg`, parent: `parent` }],
        `
          file {
            absolutePath
          }
        `,
        { types }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].file.absolutePath).toEqual(
        normalizePath(path.resolve(dir, `file_1.jpg`))
      )
    })

    it(`Links to array of file nodes`, async () => {
      let result = await queryResult(
        [{ files: [`./file_1.jpg`, `./file_2.txt`], parent: `parent` }],
        `
          files {
            absolutePath
          }
        `,
        { types }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].files.length).toEqual(2)
      expect(result.data.listNode[0].files[0].absolutePath).toEqual(
        normalizePath(path.resolve(dir, `file_1.jpg`))
      )
      expect(result.data.listNode[0].files[1].absolutePath).toEqual(
        normalizePath(path.resolve(dir, `file_2.txt`))
      )
    })
  })

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
        aNestedArray,
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
