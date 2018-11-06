const {
  graphql,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
} = require(`graphql`)
const path = require(`path`)
const normalizePath = require(`normalize-path`)
const { clearTypeExampleValues } = require(`../data-tree-utils`)
const { typeConflictReporter } = require(`../type-conflict-reporter`)
const {
  inferObjectStructureFromNodes,
  clearUnionTypes,
} = require(`../infer-graphql-type`)
const { clearTypeNames } = require(`../create-type-name`)

function queryResult(nodes, fragment, { types = [], ignoreFields } = {}) {
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
                  ignoreFields,
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

beforeEach(() => {
  clearTypeExampleValues()
})

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
      "with space": 1,
      "with-hyphen": 2,
      "with resolver": `1012-11-01`,
      123: 42,
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
      "with space": 3,
      "with-hyphen": 4,
      123: 24,
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

  it(`doesn't throw errors at ints longer than 32-bit`, async () => {
    const result = await queryResult(
      [
        {
          longint: 3000000000,
        },
      ],
      `
        longint
      `
    )
    expect(result.errors).toBeUndefined()
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

  it(`infers number types`, () => {
    const fields = inferObjectStructureFromNodes({
      nodes: [
        {
          int32: 42,
          float: 2.5,
          longint: 3000000000,
        },
      ],
    })
    expect(fields.int32.type.name).toEqual(`Int`)
    expect(fields.float.type.name).toEqual(`Float`)
    expect(fields.longint.type.name).toEqual(`Float`)
  })

  it(`Handle invalid graphql field names`, async () => {
    let result = await queryResult(
      nodes,
      `
        with_space
        with_hyphen
        with_resolver(formatString:"DD.MM.YYYY")
        _123
      `
    )

    expect(result.errors).not.toBeDefined()
    expect(result.data.listNode.length).toEqual(2)
    expect(result.data.listNode[0].with_space).toEqual(1)
    expect(result.data.listNode[0].with_hyphen).toEqual(2)
    expect(result.data.listNode[1].with_space).toEqual(3)
    expect(result.data.listNode[1].with_hyphen).toEqual(4)
    expect(result.data.listNode[0].with_resolver).toEqual(`01.11.1012`)
    expect(result.data.listNode[0]._123).toEqual(42)
    expect(result.data.listNode[1]._123).toEqual(24)
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

  describe(`Linked inference from config mappings`, () => {
    let store, types

    beforeAll(() => {
      ;({ store } = require(`../../redux`))

      store.dispatch({ type: `DELETE_CACHE` })

      store.dispatch({
        type: `CREATE_NODE`,
        payload: {
          id: `node1`,
          label: `First node`,
          internal: { type: `MappingTest` },
          nestedField: {
            mapTarget: `test1`,
          },
        },
      })

      store.dispatch({
        type: `CREATE_NODE`,
        payload: {
          id: `node2`,
          label: `Second node`,
          internal: { type: `MappingTest` },
          nestedField: {
            mapTarget: `test2`,
          },
        },
      })

      store.dispatch({
        type: `CREATE_NODE`,
        payload: {
          id: `node3`,
          label: `Third node`,
          internal: { type: `MappingTest` },
          nestedField: {
            mapTarget: `test3`,
          },
        },
      })

      const mappingTestType = {
        name: `MappingTest`,
        nodeObjectType: new GraphQLObjectType({
          name: `MappingTest`,
          fields: inferObjectStructureFromNodes({
            nodes: [
              {
                label: `string`,
                nestedField: { mapTarget: `string` },
                linkedOnID: `string`,
                linkedOnCustomField: `string`,
              },
            ],
            types: [{ name: `MappingTest` }],
          }),
        }),
      }

      types = [mappingTestType]

      store.dispatch({
        type: `SET_SITE_CONFIG`,
        payload: {
          mapping: {
            "Test.linkedOnID": `MappingTest`,
            "Test.linkedOnCustomField": `MappingTest.nestedField.mapTarget`,
          },
        },
      })
    })

    it(`Links to single node by id`, async () => {
      let result = await queryResult(
        [
          {
            linkedOnID: `node1`,
            internal: { type: `Test` },
          },
          {
            linkedOnID: `not_existing`,
            internal: { type: `Test` },
          },
        ],
        `
          linkedOnID {
            label
          }
        `,
        { types }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode.length).toEqual(2)
      expect(result.data.listNode[0].linkedOnID).toBeDefined()
      expect(result.data.listNode[1].linkedOnID).toEqual(null)
      expect(result.data.listNode[0].linkedOnID.label).toEqual(`First node`)
    })

    it(`Links to array of nodes by id`, async () => {
      let result = await queryResult(
        [
          {
            linkedOnID: [`node1`, `node2`],
            internal: { type: `Test` },
          },
        ],
        `
          linkedOnID {
            label
          }
        `,
        { types }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode.length).toEqual(1)
      expect(result.data.listNode[0].linkedOnID).toBeDefined()
      expect(result.data.listNode[0].linkedOnID.length).toEqual(2)
      expect(result.data.listNode[0].linkedOnID[0].label).toEqual(`First node`)
      expect(result.data.listNode[0].linkedOnID[1].label).toEqual(`Second node`)
    })

    it(`Links to single node by custom field`, async () => {
      let result = await queryResult(
        [
          {
            linkedOnCustomField: `test2`,
            internal: { type: `Test` },
          },
          {
            linkedOnCustomField: `not_existing`,
            internal: { type: `Test` },
          },
        ],
        `
          linkedOnCustomField {
            label
          }
        `,
        { types }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode.length).toEqual(2)
      expect(result.data.listNode[0].linkedOnCustomField).toBeDefined()
      expect(result.data.listNode[1].linkedOnCustomField).toEqual(null)
      expect(result.data.listNode[0].linkedOnCustomField.label).toEqual(
        `Second node`
      )
    })

    it(`Links to array of nodes by custom field`, async () => {
      let result = await queryResult(
        [
          {
            linkedOnCustomField: [`test1`, `test3`],
            internal: { type: `Test` },
          },
        ],
        `
          linkedOnCustomField {
            label
          }
        `,
        { types }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode.length).toEqual(1)
      expect(result.data.listNode[0].linkedOnCustomField).toBeDefined()
      expect(result.data.listNode[0].linkedOnCustomField.length).toEqual(2)
      expect(result.data.listNode[0].linkedOnCustomField[0].label).toEqual(
        `First node`
      )
      expect(result.data.listNode[0].linkedOnCustomField[1].label).toEqual(
        `Third node`
      )
    })
  })

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

    describe(`Creation of union types when array field is linking to multiple types`, () => {
      beforeEach(() => {
        clearTypeNames()
        clearUnionTypes()
      })

      it(`Creates union types`, async () => {
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

      it(`Uses same union type for same child node types and key`, () => {
        const fields = inferObjectStructureFromNodes({
          nodes: [{ test___NODE: [`pet_1`, `child_1`] }],
          types,
        })
        const fields2 = inferObjectStructureFromNodes({
          nodes: [{ test___NODE: [`pet_1`, `child_2`] }],
          types,
        })
        expect(fields.test.type).toEqual(fields2.test.type)
      })

      it(`Uses a different type for the same child node types with a different key`, () => {
        const fields = inferObjectStructureFromNodes({
          nodes: [{ test___NODE: [`pet_1`, `child_1`] }],
          types,
        })
        const fields2 = inferObjectStructureFromNodes({
          nodes: [{ differentKey___NODE: [`pet_1`, `child_2`] }],
          types,
        })
        expect(fields.test.type).not.toEqual(fields2.differentKey.type)
      })

      it(`Uses a different type for different child node types with the same key`, () => {
        store.dispatch({
          type: `CREATE_NODE`,
          payload: { id: `toy_1`, internal: { type: `Toy` } },
        })
        const fields = inferObjectStructureFromNodes({
          nodes: [{ test___NODE: [`pet_1`, `child_1`] }],
          types,
        })
        const fields2 = inferObjectStructureFromNodes({
          nodes: [{ test___NODE: [`pet_1`, `child_1`, `toy_1`] }],
          types: types.concat([{ name: `Toy` }]),
        })
        expect(fields.test.type).not.toEqual(fields2.test.type)
      })

      it(`Creates a new type after schema updates clear union types`, () => {
        const nodes = [{ test___NODE: [`pet_1`, `child_1`] }]
        const fields = inferObjectStructureFromNodes({ nodes, types })
        clearUnionTypes()
        const updatedFields = inferObjectStructureFromNodes({ nodes, types })
        expect(fields.test.type).not.toEqual(updatedFields.test.type)
      })

      it(`Uses a reliable naming convention`, () => {
        const nodes = [{ test___NODE: [`pet_1`, `child_1`] }]
        inferObjectStructureFromNodes({ nodes, types })
        clearUnionTypes()
        const updatedFields = inferObjectStructureFromNodes({ nodes, types })
        expect(updatedFields.test.type.ofType.name).toEqual(`unionTestNode_2`)
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

  describe(`type conflicts`, () => {
    let addConflictSpy = jest.spyOn(typeConflictReporter, `addConflict`)

    beforeEach(() => {
      addConflictSpy.mockReset()
    })

    it(`catches conflicts and removes field`, async () => {
      let result = await queryResult(
        [{ foo: `foo`, number: 1.1 }, { foo: `bar`, number: `1` }],
        `
          foo
          number
        `
      )
      expect(addConflictSpy).toHaveBeenCalledTimes(1)

      expect(result.errors.length).toEqual(1)
      expect(result.errors[0].message).toMatch(
        `Cannot query field "number" on type "Test".`
      )
    })

    it(`does not warn about provided types`, async () => {
      let result = await queryResult(
        [{ foo: `foo`, number: 1.1 }, { foo: `bar`, number: `1` }],
        `
          foo
          number
        `,
        { ignoreFields: [`number`] }
      )
      expect(addConflictSpy).not.toHaveBeenCalled()

      expect(result.errors.length).toEqual(1)
      expect(result.errors[0].message).toMatch(
        `Cannot query field "number" on type "Test".`
      )
    })
  })
})
