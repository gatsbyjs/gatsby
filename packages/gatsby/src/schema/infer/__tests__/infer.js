// NOTE: Previously `infer-graphql-type-test.js`

const { graphql } = require(`graphql`)
const nodeStore = require(`../../../db/nodes`)
const path = require(`path`)
const slash = require(`slash`)
const { store } = require(`../../../redux`)
const { actions } = require(`../../../redux/actions`)
const { buildSchema } = require(`../../schema`)
const { createSchemaComposer } = require(`../../schema-composer`)
const { buildObjectType } = require(`../../types/type-builders`)
const { TypeConflictReporter } = require(`../type-conflict-reporter`)
const withResolverContext = require(`../../context`)
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
const report = require(`gatsby-cli/lib/reporter`)
afterEach(() => {
  report.error.mockClear()
})

const makeNodes = () => [
  {
    id: `1`,
    internal: { type: `Test` },
    name: `The Mad Max`,
    type: `Test`,
    "key-with..unsupported-values": true,
    hair: 1,
    date: `1012-11-01`,
    anArray: [1, 2, 3, 4],
    aNestedArray: [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ],
    anObjectArray: [
      { aString: `some string`, aNumber: 2, aBoolean: true },
      { aString: `some string`, aNumber: 2, anArray: [1, 2] },
      { anotherObjectArray: [{ bar: 10 }] },
    ],
    anObjectArrayWithNull: [{ anotherObjectArray: [{ baz: `quz` }] }, null],
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
    id: `2`,
    internal: { type: `Test` },
    name: `The Mad Wax`,
    type: `Test`,
    hair: 2,
    date: `1984-10-12`,
    anArray: [1, 2, 5, 4],
    aNestedArray: [[1, 2, 3, 4]],
    anObjectArray: [{ anotherObjectArray: [{ baz: `quz` }] }],
    anObjectArrayWithNull: [{ anotherObjectArray: [{ baz: `quz` }] }, null],
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

  const buildTestSchema = async (nodes, buildSchemaArgs, typeDefs) => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node => {
      if (!node.internal.contentDigest) {
        node.internal.contentDigest = `0`
      }
      actions.createNode(node, { name: `test` })(store.dispatch)
    })

    const { builtInFieldExtensions } = require(`../../extensions`)
    Object.keys(builtInFieldExtensions).forEach(name => {
      const extension = builtInFieldExtensions[name]
      store.dispatch({
        type: `CREATE_FIELD_EXTENSION`,
        payload: { name, extension },
      })
    })
    const { fieldExtensions } = store.getState().schemaCustomization
    const schemaComposer = createSchemaComposer({ fieldExtensions })
    const schema = await buildSchema({
      schemaComposer,
      nodeStore,
      types: typeDefs || [],
      fieldExtensions,
      thirdPartySchemas: [],
      typeMapping: [],
      typeConflictReporter,
      ...(buildSchemaArgs || {}),
    })
    return { schema, schemaComposer }
  }

  const getQueryResult = async (
    nodes,
    fragment,
    buildSchemaArgs,
    extraquery = ``,
    typeDefs
  ) => {
    const { schema, schemaComposer } = await buildTestSchema(
      nodes,
      buildSchemaArgs,
      typeDefs
    )
    store.dispatch({ type: `SET_SCHEMA`, payload: schema })
    return graphql(
      schema,
      `query {
        allTest {
          edges {
            node {
              ${fragment}
            }
          }
        }
        ${extraquery}
      }
      `,
      undefined,
      withResolverContext({ schema, schemaComposer, context: { path: `/` } })
    )
  }

  const getInferredFields = async (nodes, buildSchemaArgs) => {
    const { schema } = await buildTestSchema(nodes, buildSchemaArgs)
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
    expect(result.data.allTest.edges[0].node.number).toEqual(1.1)
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

  it(`handles sparse arrays`, async () => {
    const nodes = [
      { sparse: [null, true], internal: { type: `Test` }, id: `1` },
      { sparse: [null], internal: { type: `Test` }, id: `2` },
      { sparse: null, internal: { type: `Test` }, id: `3` },
    ]
    const result = await getQueryResult(
      nodes,
      `
      sparse
      `
    )
    const { edges } = result.data.allTest
    expect(edges[0].node.sparse).toEqual([null, true])
  })

  it(`handles sparse arrays of objects`, async () => {
    const nodes = [
      { sparse: [null, { foo: true }], internal: { type: `Test` }, id: `1` },
      { sparse: [null], internal: { type: `Test` }, id: `2` },
      { sparse: null, internal: { type: `Test` }, id: `3` },
    ]
    const result = await getQueryResult(
      nodes,
      `
      sparse { foo }
      `
    )
    const { edges } = result.data.allTest
    expect(edges[0].node.sparse[1].foo).toBe(true)
  })

  // NOTE: Honestly this test does not makes much sense now
  it.skip(`Removes specific root fields`, () => {
    const { addInferredFields } = require(`../infer`)
    const { getExampleValue } = require(`../example-value`)
    const { getNodeInterface } = require(`../../types/node-interface`)
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
    const typeComposer = schemaComposer.createObjectTC(`Test`)
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

  it(`infers number types`, async () => {
    const nodes = [
      {
        int32: 42,
        float: 2.5,
        longint: 3000000000,
        internal: { type: `Test` },
        id: `1`,
      },
    ]
    const fields = await getInferredFields(nodes)

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
        with_resolver(formatString: "DD.MM.YYYY")
        _123
        _456 {
          testingTypeNameCreation
        }
      `
    )

    expect(result.errors).not.toBeDefined()
    expect(result.data.allTest.edges.length).toEqual(2)
    expect(result.data.allTest.edges[0].node.with_space).toEqual(1)
    expect(result.data.allTest.edges[0].node.with_hyphen).toEqual(2)
    expect(result.data.allTest.edges[1].node.with_space).toEqual(3)
    expect(result.data.allTest.edges[1].node.with_hyphen).toEqual(4)
    expect(result.data.allTest.edges[0].node.with_resolver).toEqual(
      `01.11.1012`
    )
    expect(result.data.allTest.edges[0].node._123).toEqual(42)
    expect(result.data.allTest.edges[1].node._123).toEqual(24)
    expect(result.data.allTest.edges[0].node._456).toEqual(nodes[0][`456`])
  })

  it(`handles invalid graphql field names on explicitly defined fields`, async () => {
    const nodes = [
      { id: `test`, internal: { type: `Test` } },
      {
        id: `foo`,
        [`field_that_needs_to_be_sanitized?`]: `foo`,
        [`(another)_field_that_needs_to_be_sanitized`]: `bar`,
        [`!third_field_that_needs_to_be_sanitized`]: `baz`,
        internal: {
          type: `Repro`,
          contentDigest: `foo`,
        },
      },
    ]
    const typeDefs = [
      {
        typeOrTypeDef: buildObjectType({
          name: `Repro`,
          interfaces: [`Node`],
          fields: {
            field_that_needs_to_be_sanitized_: `String`,
            _another__field_that_needs_to_be_sanitized: {
              type: `String`,
              resolve: source =>
                source[`(another)_field_that_needs_to_be_sanitized`],
            },
          },
        }),
      },
    ]

    const result = await getQueryResult(
      nodes,
      `id`,
      undefined,
      `
        repro {
          field_that_needs_to_be_sanitized_
          _another__field_that_needs_to_be_sanitized
          _third_field_that_needs_to_be_sanitized
        }
      `,
      typeDefs
    )
    expect(result.errors).not.toBeDefined()
    expect(result.data.repro[`field_that_needs_to_be_sanitized_`]).toBe(`foo`)
    expect(
      result.data.repro[`_another__field_that_needs_to_be_sanitized`]
    ).toBe(`bar`)
    expect(result.data.repro[`_third_field_that_needs_to_be_sanitized`]).toBe(
      `baz`
    )
  })

  it(`Handles priority for conflicting fields`, async () => {
    const nodes = [
      {
        _2invalid: 1,
        "2invalid": 2,
        sibling: { id: `Test` },
        sibling___NODE: `2`,
        internal: { type: `Test` },
        id: `1`,
      },
      {
        _2invalid: 1,
        "2invalid": 2,
        sibling: { id: `Test` },
        sibling___NODE: `3`,
        internal: { type: `Test` },
        id: `2`,
      },
      {
        _2invalid: 1,
        "2invalid": 2,
        sibling: { id: `Test` },
        sibling___NODE: `1`,
        internal: { type: `Test` },
        id: `3`,
      },
    ]

    const result = await getQueryResult(
      nodes,
      `
      sibling { id }
      _2invalid
      `
    )
    expect(result).toMatchSnapshot()
  })

  it(`Handles priority for conflicting nested fields`, async () => {
    const nodes = [
      {
        "2invalid": { nested: { check: 1 } },
        _2invalid: { nested: { check: true } },
        internal: { type: `Test` },
        id: `1`,
      },
      {
        "2invalid": { nested: { check: 0 } },
        _2invalid: { nested: { check: false } },
        internal: { type: `Test` },
        id: `2`,
      },
    ]

    const result = await getQueryResult(
      nodes,
      `
      _2invalid { nested { check } }
      `
    )
    const { edges } = result.data.allTest
    expect(edges[0].node[`_2invalid`].nested.check).toBe(true)
    expect(edges[1].node[`_2invalid`].nested.check).toBe(false)
    expect(result).toMatchSnapshot()
  })

  it(`handles lowercase type names`, async () => {
    const nodes = [
      {
        id: `1`,
        internal: { type: `wordpress__PAGE` },
        acfFields: {
          fooz: `bar`,
        },
      },
    ]
    const { schema, schemaComposer } = await buildTestSchema(nodes)
    store.dispatch({ type: `SET_SCHEMA`, payload: schema })
    const result = await graphql(
      schema,
      `
        query {
          allWordpressPage {
            edges {
              node {
                __typename
                id
                acfFields {
                  fooz
                  __typename
                }
              }
            }
          }
        }
      `,
      undefined,
      withResolverContext({ schema, schemaComposer, context: { path: `/` } })
    )

    expect(result).toMatchSnapshot()
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
      expect(result.data.allTest.edges[0].node.number).toEqual(2018)
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
      expect(result.data.allTest.edges[0].node.date).toEqual(`01.11.1012`)
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
      expect(result.data.allTest.edges[0].node.date.length).toEqual(2)
      expect(result.data.allTest.edges[0].node.date[0]).toEqual(`01.11.1012`)
      expect(result.data.allTest.edges[0].node.date[1]).toEqual(`03.02.1039`)
    })

    it(`infers mixes of non-dates and dates as string`, async () => {
      const nodes = [
        {
          date: `1012-11-01`,
          internal: { type: `Test` },
          id: `1`,
        },
        {
          date: `totally-not-a-date`,
          internal: { type: `Test` },
          id: `2`,
        },
      ]
      const result = await getQueryResult(
        nodes,
        `
          date
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges.length).toEqual(2)
      expect(result.data.allTest.edges[0].node.date).toEqual(`1012-11-01`)
      expect(result.data.allTest.edges[1].node.date).toEqual(
        `totally-not-a-date`
      )
    })
  })

  describe(`Linked inference from config mappings`, () => {
    const getMappingNodes = () => [
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

    it(`Links to single node by id`, async () => {
      const nodes = [
        {
          id: `1`,
          linkedOnID: `node1`,
          internal: { type: `Test` },
        },
        {
          id: `2`,
          linkedOnID: `not_existing`,
          internal: { type: `Test` },
        },
      ].concat(getMappingNodes())
      const result = await getQueryResult(
        nodes,
        `
          linkedOnID {
            label
          }
        `,
        {
          typeMapping: {
            "Test.linkedOnID": `MappingTest`,
            "Test.linkedOnCustomField": `MappingTest.nestedField.mapTarget`,
          },
        }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges.length).toEqual(2)
      expect(result.data.allTest.edges[0].node.linkedOnID).toBeDefined()
      expect(result.data.allTest.edges[1].node.linkedOnID).toEqual(null)
      expect(result.data.allTest.edges[0].node.linkedOnID.label).toEqual(
        `First node`
      )
    })

    it(`Links to array of nodes by id`, async () => {
      const nodes = [
        {
          id: `3`,
          linkedOnID: [`node1`, `node2`],
          internal: { type: `Test` },
        },
      ].concat(getMappingNodes())
      const result = await getQueryResult(
        nodes,
        `
          linkedOnID {
            label
          }
        `,
        {
          typeMapping: {
            "Test.linkedOnID": `MappingTest`,
            "Test.linkedOnCustomField": `MappingTest.nestedField.mapTarget`,
          },
        }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges.length).toEqual(1)
      expect(result.data.allTest.edges[0].node.linkedOnID).toBeDefined()
      expect(result.data.allTest.edges[0].node.linkedOnID.length).toEqual(2)
      expect(result.data.allTest.edges[0].node.linkedOnID[0].label).toEqual(
        `First node`
      )
      expect(result.data.allTest.edges[0].node.linkedOnID[1].label).toEqual(
        `Second node`
      )
    })

    it(`Links to single node by custom field`, async () => {
      const nodes = [
        {
          id: `1`,
          linkedOnCustomField: `test2`,
          internal: { type: `Test` },
        },
        {
          id: `2`,
          linkedOnCustomField: `not_existing`,
          internal: { type: `Test` },
        },
      ].concat(getMappingNodes())
      const result = await getQueryResult(
        nodes,
        `
          linkedOnCustomField {
            label
          }
        `,
        {
          typeMapping: {
            "Test.linkedOnID": `MappingTest`,
            "Test.linkedOnCustomField": `MappingTest.nestedField.mapTarget`,
          },
        }
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges.length).toEqual(2)
      expect(
        result.data.allTest.edges[0].node.linkedOnCustomField
      ).toBeDefined()
      expect(result.data.allTest.edges[1].node.linkedOnCustomField).toEqual(
        null
      )
      expect(
        result.data.allTest.edges[0].node.linkedOnCustomField.label
      ).toEqual(`Second node`)
    })

    it(`Links to array of nodes by custom field`, async () => {
      const nodes = [
        {
          id: `1`,
          linkedOnCustomField: [`test3`, `test1`],
          internal: { type: `Test` },
        },
      ].concat(getMappingNodes())
      const result = await getQueryResult(
        nodes,
        `
          linkedOnCustomField {
            label
          }
        `,
        {
          typeMapping: {
            "Test.linkedOnID": `MappingTest`,
            "Test.linkedOnCustomField": `MappingTest.nestedField.mapTarget`,
          },
        }
      )

      expect(result).toMatchInlineSnapshot(`
Object {
  "data": Object {
    "allTest": Object {
      "edges": Array [
        Object {
          "node": Object {
            "linkedOnCustomField": Array [
              Object {
                "label": "Third node",
              },
              Object {
                "label": "First node",
              },
            ],
          },
        },
      ],
    },
  },
}
`)
    })
  })

  describe(`Linked inference from file URIs`, () => {
    const dir = slash(path.resolve(`/path/`))
    const getFileNodes = () => [
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
          id: `1`,
          file: `./file_1.jpg`,
          parent: `parent`,
          internal: { type: `Test` },
        },
      ].concat(getFileNodes())

      let result = await getQueryResult(
        nodes,
        `
          file {
            absolutePath
          }
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges[0].node.file.absolutePath).toEqual(
        slash(path.resolve(dir, `file_1.jpg`))
      )
    })

    it(`Links to array of file nodes`, async () => {
      const nodes = [
        {
          id: `1`,
          files: [`./file_1.jpg`, `./file_2.txt`],
          parent: `parent`,
          internal: { type: `Test` },
        },
      ].concat(getFileNodes())

      let result = await getQueryResult(
        nodes,
        `
          files {
            absolutePath
          }
        `
      )

      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges[0].node.files.length).toEqual(2)
      expect(result.data.allTest.edges[0].node.files[0].absolutePath).toEqual(
        slash(path.resolve(dir, `file_1.jpg`))
      )
      expect(result.data.allTest.edges[0].node.files[1].absolutePath).toEqual(
        slash(path.resolve(dir, `file_2.txt`))
      )
    })
  })

  describe(`Linked inference by __NODE convention`, () => {
    const getLinkedNodes = () => [
      { id: `child_1`, internal: { type: `Child` }, hair: `brown` },
      { id: `child_2`, internal: { type: `Child` }, hair: `blonde` },
      { id: `pet_1`, internal: { type: `Pet` }, species: `dog` },
    ]

    it(`Links nodes`, async () => {
      const nodes = [
        { linked___NODE: `child_1`, internal: { type: `Test` }, id: `1` },
      ].concat(getLinkedNodes())
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges[0].node.linked.hair).toEqual(`brown`)
    })

    it(`Links an array of nodes`, async () => {
      const nodes = [
        {
          linked___NODE: [`child_1`, `child_2`],
          internal: { type: `Test` },
          id: `1`,
        },
      ].concat(getLinkedNodes())
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges[0].node.linked[0].hair).toEqual(`brown`)
      expect(result.data.allTest.edges[0].node.linked[1].hair).toEqual(`blonde`)
    })

    it(`Links nodes by field`, async () => {
      const nodes = [
        { linked___NODE___hair: `brown`, internal: { type: `Test` }, id: `1` },
      ].concat(getLinkedNodes())
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges[0].node.linked.hair).toEqual(`brown`)
    })

    it(`Links an array of nodes by field`, async () => {
      const nodes = [
        {
          linked___NODE___hair: [`brown`, `blonde`],
          internal: { type: `Test` },
          id: `1`,
        },
      ].concat(getLinkedNodes())
      const result = await getQueryResult(
        nodes,
        `
          linked {
            hair
          }
        `
      )
      expect(result.errors).not.toBeDefined()
      expect(result.data.allTest.edges[0].node.linked[0].hair).toEqual(`brown`)
      expect(result.data.allTest.edges[0].node.linked[1].hair).toEqual(`blonde`)
    })

    it(`Errors clearly when missing nodes`, async () => {
      expect.assertions(1)
      try {
        await getInferredFields([
          { linked___NODE: `baz`, internal: { type: `Test` }, id: `1` },
        ])
      } catch (e) {
        expect(e.message).toEqual(
          `Encountered an error trying to infer a GraphQL type ` +
            `for: \`linked___NODE\`. There is no corresponding node with the \`id\` ` +
            `field matching: "baz".`
        )
      }
    })

    // We can't miss types anymore
    it.skip(`Errors clearly when missing types`, async () => {
      expect(async () => {
        await getInferredFields([
          { id: `baz`, internal: { type: `Bar` } },
          { linked___NODE: `baz`, internal: { type: `Test` }, id: `1` },
        ])
      }).toThrow(
        `Encountered an error trying to infer a GraphQL type ` +
          `for: \`linked___NODE\`. There is no corresponding GraphQL type ` +
          `\`Bar\` available to link to this node.`
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
        ].concat(getLinkedNodes())
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
        expect(result.data.allTest.edges[0].node.linked[0].hair).toEqual(
          `brown`
        )
        expect(result.data.allTest.edges[0].node.linked[0].__typename).toEqual(
          `Child`
        )
        expect(result.data.allTest.edges[0].node.linked[1].species).toEqual(
          `dog`
        )
        expect(result.data.allTest.edges[0].node.linked[1].__typename).toEqual(
          `Pet`
        )
      })

      it(`Uses same union type for same child node types and key`, async () => {
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
        ].concat(getLinkedNodes())
        const { schema } = await buildTestSchema(nodes)
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

      it(`Uses a different type for different child node types with the same key`, async () => {
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
        ].concat(getLinkedNodes())
        const { schema } = await buildTestSchema(nodes)
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
        anObjectArrayWithNull {
          anotherObjectArray {
            baz
          }
        }
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
