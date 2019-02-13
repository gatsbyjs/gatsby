// NOTE: Previously `infer-graphql-type-test.js`

const { graphql } = require(`graphql`)
const { addInferredTypes } = require(`..`)
const nodeStore = require(`../../../db/nodes`)
const nodeModel = require(`../../node-model`)
const path = require(`path`)
const slash = require(`slash`)
const { store } = require(`../../../redux`)
const { createSchemaComposer } = require(`../../schema-composer`)
const { addNodeInterface } = require(`../../types/NodeInterface`)
const { TypeConflictReporter } = require(`../type-conflict-reporter`)
require(`../../../db/__tests__/fixtures/ensure-loki`)()

const makeNodes = () => [
  {
    id: `foo`,
    internal: { type: `Test` },
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
    456: {
      testingTypeNameCreation: true,
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
    internal: { type: `Test` },
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

describe(`GraphQL type inference`, () => {
  const typeConflictReporter = new TypeConflictReporter()

  const buildTestSchema = nodes => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )

    const schemaComposer = createSchemaComposer()
    nodeStore.getTypes().forEach(typeName => {
      schemaComposer.getOrCreateTC(typeName, tc => {
        addNodeInterface({ schemaComposer, typeComposer: tc })
      })
    })
    addInferredTypes({
      schemaComposer,
      typeConflictReporter,
      nodeStore,
    })
    schemaComposer.Query.addFields({
      listNode: {
        type: [schemaComposer.getTC(`Test`)],
        resolve: () => nodes.filter(node => node.internal.type === `Test`),
      },
    })
    const schema = schemaComposer.buildSchema()
    return schema
  }

  const getQueryResult = (nodes, fragment, params) => {
    const schema = buildTestSchema(nodes, params)
    store.dispatch({ type: `SET_SCHEMA`, payload: schema })
    return graphql(
      schema,
      `query {
        listNode {
          ${fragment}
        }
      }
      `,
      undefined,
      { path: `/`, nodeModel }
    )
  }

  const getInferredFields = nodes => {
    const schema = buildTestSchema(nodes)
    return schema.getType(`Test`).getFields()
  }

  afterEach(() => {
    typeConflictReporter.clearConflicts()
  })

  it(`filters out null example values`, async () => {
    const nodes = [
      { foo: null, bar: `baz`, internal: { type: `Test` }, id: `1` },
    ]
    const result = await getQueryResult(
      nodes,
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
    const nodes = [{ longint: 3000000000, internal: { type: `Test` }, id: `1` }]
    const result = await getQueryResult(
      nodes,
      `
        longint
      `
    )
    expect(result.errors).toBeUndefined()
  })

  it(`prefers float when multiple number types`, async () => {
    const nodes = [
      { number: 1.1, internal: { type: `Test` }, id: `1` },
      { number: 1, internal: { type: `Test` }, id: `2` },
    ]
    const result = await getQueryResult(
      nodes,
      `
        number
      `
    )
    expect(result.data.listNode[0].number).toEqual(1.1)
  })

  it(`filters out empty objects`, async () => {
    const nodes = [{ foo: {}, bar: `baz`, internal: { type: `Test` }, id: `1` }]
    const result = await getQueryResult(
      nodes,
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
    const nodes = [{ foo: [], bar: `baz`, internal: { type: `Test` }, id: `1` }]
    const result = await getQueryResult(
      nodes,
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
    const nodes = [
      {
        foo: [undefined, null, null],
        bar: `baz`,
        internal: { type: `Test` },
        id: `1`,
      },
    ]
    const result = await getQueryResult(
      nodes,
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

  // NOTE: Honestly this test does not makes much sense now
  it.skip(`Removes specific root fields`, () => {
    const { addInferredFields } = require(`../infer`)
    const { getExampleValue } = require(`../example-value`)
    const { getNodeInterface } = require(`../../types/NodeInterface`)
    const nodes = [
      {
        type: `Test`,
        id: `foo`,
        parent: `parent`,
        children: [`bar`],
        internal: { type: `Test` },
        foo: {
          type: `Test`,
          id: `foo`,
          parent: `parent`,
          children: [`bar`],
        },
      },
    ]
    const schemaComposer = createSchemaComposer()
    const typeComposer = schemaComposer.createTC(`Test`)
    addInferredFields({
      schemaComposer,
      typeComposer,
      exampleValue: getExampleValue({
        nodes,
        ignoreFields: getNodeInterface({ schemaComposer }).getFieldNames(),
      }),
    })
    const fields = typeComposer.getType().getFields()

    expect(Object.keys(fields)).toHaveLength(2)
    expect(Object.keys(fields.foo.type.getFields())).toHaveLength(4)
  })

  it(`infers number types`, () => {
    const nodes = [
      {
        int32: 42,
        float: 2.5,
        longint: 3000000000,
        internal: { type: `Test` },
        id: `1`,
      },
    ]
    const fields = getInferredFields(nodes)

    expect(fields.int32.type.name).toEqual(`Int`)
    expect(fields.float.type.name).toEqual(`Float`)
    expect(fields.longint.type.name).toEqual(`Float`)
  })

  it(`Handle invalid graphql field names`, async () => {
    const nodes = makeNodes()
    const result = await getQueryResult(
      nodes,
      `
        with_space
        with_hyphen
        with_resolver(formatString:"DD.MM.YYYY")
        _123
        _456 {
          testingTypeNameCreation
        }
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
    expect(result.data.listNode[0]._456).toEqual(nodes[0][`456`])
  })

  describe(`Handles dates`, () => {
    it(`Handles integer with valid date format`, async () => {
      const nodes = [
        { number: 2018, internal: { type: `Test` }, id: `1` },
        { number: 1987, internal: { type: `Test` }, id: `2` },
      ]
      const result = await getQueryResult(
        nodes,
        `
          number
        `
      )
      expect(result.data.listNode[0].number).toEqual(2018)
    })

    it(`Infers from Date objects`, async () => {
      const nodes = [
        {
          dateObject: new Date(Date.UTC(2012, 10, 5)),
          internal: { type: `Test` },
          id: `1`,
        },
        {
          dateObject: new Date(Date.UTC(2012, 10, 5)),
          internal: { type: `Test` },
          id: `2`,
        },
      ]
      const result = await getQueryResult(
        nodes,
        `
          dateObject
        `
      )
      expect(result).toMatchSnapshot()
    })

    it(`Infers from array of Date objects`, async () => {
      const nodes = [
        {
          dateObject: [
            new Date(Date.UTC(2012, 10, 5)),
            new Date(Date.UTC(2012, 10, 6)),
          ],
          internal: { type: `Test` },
          id: `1`,
        },
        {
          dateObject: [new Date(Date.UTC(2012, 10, 5))],
          internal: { type: `Test` },
          id: `2`,
        },
      ]
      const result = await getQueryResult(
        nodes,
        `
          dateObject
        `
      )
      expect(result).toMatchSnapshot()
    })

    it(`Infers from date strings`, async () => {
      const nodes = [
        { date: `1012-11-01`, internal: { type: `Test` }, id: `1` },
      ]
      const result = await getQueryResult(
        nodes,
        `
          date(formatString:"DD.MM.YYYY")
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].date).toEqual(`01.11.1012`)
    })

    it(`Infers from arrays of date strings`, async () => {
      const nodes = [
        {
          date: [`1012-11-01`, `10390203`],
          internal: { type: `Test` },
          id: `1`,
        },
      ]
      const result = await getQueryResult(
        nodes,
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
    const mappingNodes = [
      {
        id: `node1`,
        label: `First node`,
        internal: { type: `MappingTest` },
        nestedField: {
          mapTarget: `test1`,
        },
      },
      {
        id: `node2`,
        label: `Second node`,
        internal: { type: `MappingTest` },
        nestedField: {
          mapTarget: `test2`,
        },
      },
      {
        id: `node3`,
        label: `Third node`,
        internal: { type: `MappingTest` },
        nestedField: {
          mapTarget: `test3`,
        },
      },
    ]

    beforeEach(() => {
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

    afterEach(() => {
      store.dispatch({
        type: `SET_SITE_CONFIG`,
        payload: {
          mapping: {},
        },
      })
    })

    it(`Links to single node by id`, async () => {
      const nodes = [
        {
          linkedOnID: `node1`,
          internal: { type: `Test` },
        },
        {
          linkedOnID: `not_existing`,
          internal: { type: `Test` },
        },
      ].concat(mappingNodes)
      const result = await getQueryResult(
        nodes,
        `
          linkedOnID {
            label
          }
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode.length).toEqual(2)
      expect(result.data.listNode[0].linkedOnID).toBeDefined()
      expect(result.data.listNode[1].linkedOnID).toEqual(null)
      expect(result.data.listNode[0].linkedOnID.label).toEqual(`First node`)
    })

    it(`Links to array of nodes by id`, async () => {
      const nodes = [
        {
          linkedOnID: [`node1`, `node2`],
          internal: { type: `Test` },
        },
      ].concat(mappingNodes)
      const result = await getQueryResult(
        nodes,
        `
          linkedOnID {
            label
          }
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode.length).toEqual(1)
      expect(result.data.listNode[0].linkedOnID).toBeDefined()
      expect(result.data.listNode[0].linkedOnID.length).toEqual(2)
      expect(result.data.listNode[0].linkedOnID[0].label).toEqual(`First node`)
      expect(result.data.listNode[0].linkedOnID[1].label).toEqual(`Second node`)
    })

    it(`Links to single node by custom field`, async () => {
      const nodes = [
        {
          linkedOnCustomField: `test2`,
          internal: { type: `Test` },
        },
        {
          linkedOnCustomField: `not_existing`,
          internal: { type: `Test` },
        },
      ].concat(mappingNodes)
      const result = await getQueryResult(
        nodes,
        `
          linkedOnCustomField {
            label
          }
        `
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
      const nodes = [
        {
          linkedOnCustomField: [`test1`, `test3`],
          internal: { type: `Test` },
        },
      ].concat(mappingNodes)
      const result = await getQueryResult(
        nodes,
        `
          linkedOnCustomField {
            label
          }
        `
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
    const dir = slash(path.resolve(`/path/`))
    const fileNodes = [
      {
        id: `parent`,
        internal: { type: `File` },
        absolutePath: slash(path.resolve(dir, `index.md`)),
        dir,
      },
      {
        id: `file_1`,
        internal: { type: `File` },
        absolutePath: slash(path.resolve(dir, `file_1.jpg`)),
        dir,
      },
      {
        id: `file_2`,
        internal: { type: `File` },
        absolutePath: slash(path.resolve(dir, `file_2.txt`)),
        dir,
      },
    ]

    it(`Links to file node`, async () => {
      const nodes = [
        {
          file: `./file_1.jpg`,
          parent: `parent`,
          internal: { type: `Test` },
        },
      ].concat(fileNodes)

      let result = await getQueryResult(
        nodes,
        `
          file {
            absolutePath
          }
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].file.absolutePath).toEqual(
        slash(path.resolve(dir, `file_1.jpg`))
      )
    })

    it(`Links to array of file nodes`, async () => {
      const nodes = [
        {
          files: [`./file_1.jpg`, `./file_2.txt`],
          parent: `parent`,
          internal: { type: `Test` },
        },
      ].concat(fileNodes)

      let result = await getQueryResult(
        nodes,
        `
          files {
            absolutePath
          }
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].files.length).toEqual(2)
      expect(result.data.listNode[0].files[0].absolutePath).toEqual(
        slash(path.resolve(dir, `file_1.jpg`))
      )
      expect(result.data.listNode[0].files[1].absolutePath).toEqual(
        slash(path.resolve(dir, `file_2.txt`))
      )
    })
  })

  describe(`Linked inference by __NODE convention`, () => {
    const linkedNodes = [
      { id: `child_1`, internal: { type: `Child` }, hair: `brown` },
      { id: `child_2`, internal: { type: `Child` }, hair: `blonde` },
      { id: `pet_1`, internal: { type: `Pet` }, species: `dog` },
    ]

    it(`Links nodes`, async () => {
      const nodes = [
        { linked___NODE: `child_1`, internal: { type: `Test` }, id: `1` },
      ].concat(linkedNodes)
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].linked.hair).toEqual(`brown`)
    })

    it(`Links an array of nodes`, async () => {
      const nodes = [
        {
          linked___NODE: [`child_1`, `child_2`],
          internal: { type: `Test` },
          id: `1`,
        },
      ].concat(linkedNodes)
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].linked[0].hair).toEqual(`brown`)
      expect(result.data.listNode[0].linked[1].hair).toEqual(`blonde`)
    })

    it(`Links nodes by field`, async () => {
      const nodes = [
        { linked___NODE___hair: `brown`, internal: { type: `Test` }, id: `1` },
      ].concat(linkedNodes)
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].linked.hair).toEqual(`brown`)
    })

    it(`Links an array of nodes by field`, async () => {
      const nodes = [
        {
          linked___NODE___hair: [`brown`, `blonde`],
          internal: { type: `Test` },
          id: `1`,
        },
      ].concat(linkedNodes)
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.listNode[0].linked[0].hair).toEqual(`brown`)
      expect(result.data.listNode[0].linked[1].hair).toEqual(`blonde`)
    })

    it(`Errors clearly when missing nodes`, async () => {
      expect(() => {
        getInferredFields([
          { linked___NODE: `baz`, internal: { type: `Test` }, id: `1` },
        ])
      }).toThrow(
        `Encountered an error trying to infer a GraphQL type ` +
          `for: "linked___NODE". There is no corresponding node with the id ` +
          `field matching: "baz"`
      )
    })

    // We can't miss types anymore
    it.skip(`Errors clearly when missing types`, async () => {
      expect(() => {
        getInferredFields([
          { id: `baz`, internal: { type: `Bar` } },
          { linked___NODE: `baz`, internal: { type: `Test` }, id: `1` },
        ])
      }).toThrow(
        `Encountered an error trying to infer a GraphQL type ` +
          `for: "linked___NODE". There is no corresponding GraphQL type ` +
          `"Bar" available to link to this node.`
      )
    })

    describe(`Creation of union types when array field is linking to multiple types`, () => {
      it(`Creates union types`, async () => {
        const nodes = [
          {
            linked___NODE: [`child_1`, `pet_1`],
            internal: { type: `Test` },
            id: `1`,
          },
        ].concat(linkedNodes)
        const result = await getQueryResult(
          nodes,
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
          `
        )
        expect(result.errors).not.toBeDefined()
        expect(result.data.listNode[0].linked[0].hair).toEqual(`brown`)
        expect(result.data.listNode[0].linked[0].__typename).toEqual(`Child`)
        expect(result.data.listNode[0].linked[1].species).toEqual(`dog`)
        expect(result.data.listNode[0].linked[1].__typename).toEqual(`Pet`)
      })

      it(`Uses same union type for same child node types and key`, () => {
        const nodes = [
          {
            test___NODE: [`pet_1`, `child_1`],
            internal: { type: `Test` },
            id: `1`,
          },
          {
            test___NODE: [`pet_1`, `child_2`],
            internal: { type: `OtherType` },
            id: `2`,
          },
        ].concat(linkedNodes)
        const schema = buildTestSchema(nodes)
        const fields = schema.getType(`Test`).getFields()
        const otherFields = schema.getType(`OtherType`).getFields()

        expect(fields.test.type.ofType.name).toBe(
          otherFields.test.type.ofType.name
        )
        expect(fields.test.type.ofType.getTypes()).toEqual(
          otherFields.test.type.ofType.getTypes()
        )
        expect(fields.test.type.ofType).toBe(otherFields.test.type.ofType)
      })

      it.skip(`Uses a different type for the same child node types with a different key`, () => {
        // NOTE: We don't do that anymore
      })

      it(`Uses a different type for different child node types with the same key`, () => {
        const nodes = [
          { id: `toy_1`, internal: { type: `Toy` } },
          {
            test___NODE: [`pet_1`, `child_1`],
            internal: { type: `Test` },
            id: `1`,
          },
          {
            test___NODE: [`pet_1`, `child_2`, `toy_1`],
            internal: { type: `OtherType` },
            id: `2`,
          },
        ].concat(linkedNodes)
        const schema = buildTestSchema(nodes)
        const fields = schema.getType(`Test`).getFields()
        const otherFields = schema.getType(`OtherType`).getFields()

        expect(fields.test.type.ofType.name).toBe(`ChildPetUnion`)
        expect(otherFields.test.type.ofType.name).toBe(`ChildPetToyUnion`)
        expect(fields.test.type.ofType).not.toEqual(
          otherFields.test.type.ofType
        )
      })

      it.skip(`Creates a new type after schema updates clear union types`, () => {
        // NOTE: We don't clear union types anymore
      })

      it.skip(`Uses a reliable naming convention`, () => {
        // NOTE: We don't postfix union type names anymore
      })
    })
  })

  it(`Infers graphql type from array of nodes`, async () => {
    const nodes = makeNodes()
    const result = await getQueryResult(
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
    )
    expect(result).toMatchSnapshot()
  })

  describe(`type conflicts`, () => {
    it(`catches conflicts and removes field`, async () => {
      const nodes = [
        { foo: `foo`, number: 1.1, internal: { type: `Test` }, id: `1` },
        { foo: `bar`, number: `1`, internal: { type: `Test` }, id: `2` },
      ]
      const result = await getQueryResult(
        nodes,
        `
          foo
          number
        `
      )
      expect(typeConflictReporter.getConflicts()).toMatchSnapshot()

      expect(result.errors.length).toEqual(1)
      expect(result.errors[0].message).toMatch(
        `Cannot query field "number" on type "Test".`
      )
    })

    // FIXME, ignoreFields isn't passable, Do we create type with typedefs and test it?
    it.skip(`does not warn about provided types`, async () => {
      const nodes = [
        { foo: `foo`, number: 1.1, internal: { type: `Test` }, id: `1` },
        { foo: `bar`, number: `1`, internal: { type: `Test` }, id: `2` },
      ]
      const result = await getQueryResult(
        nodes,
        `
          foo
          number
        `,
        { ignoreFields: [`number`] }
      )
      expect(typeConflictReporter.getConflicts()).toEqual([])

      expect(result.errors.length).toEqual(1)
      expect(result.errors[0].message).toMatch(
        `Cannot query field "number" on type "Test".`
      )
    })
  })
})
