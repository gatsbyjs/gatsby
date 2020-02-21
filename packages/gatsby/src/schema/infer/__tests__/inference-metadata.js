// NOTE: Previously `data-tree-utils-test.js`
const _ = require(`lodash`)

const {
  addNode,
  deleteNode,
  addNodes,
  haveEqualFields,
} = require(`../inference-metadata`)
const { getExampleObject } = require(`../build-example-data`)

const { TypeConflictReporter } = require(`../type-conflict-reporter`)

const INVALID_VALUE = undefined

const getExampleValue = ({
  nodes,
  typeName,
  typeConflictReporter,
  ignoreFields,
}) => {
  const initialMetadata = {
    typeName,
    typeConflictReporter,
    ignoredFields: new Set(ignoreFields),
  }
  const inferenceMetadata = addNodes(initialMetadata, nodes)
  return getExampleObject(inferenceMetadata)
}

const getExampleValueWithoutConflicts = args => {
  const value = getExampleValue(args)
  expect(args.typeConflictReporter.getConflicts()).toEqual([])
  return value
}

const getExampleValueConflicts = args => {
  const typeConflictReporter = new TypeConflictReporter()
  getExampleValue({ ...args, typeConflictReporter })
  return typeConflictReporter.getConflicts()
}

describe(`Get example value for type inference`, () => {
  const typeConflictReporter = new TypeConflictReporter()

  afterEach(() => {
    typeConflictReporter.clearConflicts()
  })

  const nodes = [
    {
      name: `The Mad Max`,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
      "key-with..unsupported-values": true,
      emptyArray: [],
      anArray: [1, 2, 3, 4],
      nestedArrays: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      objectsInArray: [{ field1: true }, { field2: 1 }],
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
      context: {
        nestedObject: null,
      },
    },
    {
      name: `The Mad Wax`,
      hair: 2,
      date: `2006-07-22T22:39:53.000Z`,
      emptyArray: [undefined, null],
      anArray: [1, 2, 5, 4],
      iAmNull: null,
      nestedArrays: [[1, 2, 3]],
      objectsInArray: [{ field3: `foo` }],
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
        draft: false,
      },
      context: {
        nestedObject: {
          someOtherProperty: 1,
        },
      },
    },
    {
      name: `The Mad Wax`,
      hair: 3,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [],
      iAmNull: null,
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
        draft: false,
      },
      context: {
        nestedObject: {
          someOtherProperty: 2,
        },
      },
    },
    {
      name: `The Mad Wax`,
      hair: 4,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [4, 6, 2],
      iAmNull: null,
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
        draft: false,
      },
      context: {
        nestedObject: {
          name: `Inner name`,
          someOtherProperty: 3,
        },
      },
      "": ``,
    },
  ]

  it(`builds field examples from an array of nodes`, () => {
    expect(
      getExampleValueWithoutConflicts({ nodes, typeConflictReporter })
    ).toMatchSnapshot()
  })

  it(`skips null fields`, () => {
    expect(
      getExampleValueWithoutConflicts({ nodes, typeConflictReporter }).iAmNull
    ).not.toBeDefined()
  })

  it(`skips fields with key set to empty string`, () => {
    expect(
      getExampleValueWithoutConflicts({ nodes, typeConflictReporter })[``]
    ).not.toBeDefined()
  })

  it(`should not mutate the nodes`, () => {
    getExampleValueWithoutConflicts({ nodes, typeConflictReporter })
    expect(nodes[0].context.nestedObject).toBeNull()
    expect(nodes[1].context.nestedObject.someOtherProperty).toEqual(1)
    expect(nodes[2].context.nestedObject.someOtherProperty).toEqual(2)
    expect(nodes[3].context.nestedObject.someOtherProperty).toEqual(3)
  })

  it(`skips empty or sparse arrays`, () => {
    expect(
      getExampleValueWithoutConflicts({ nodes, typeConflictReporter })
        .emptyArray
    ).not.toBeDefined()
    expect(
      getExampleValueWithoutConflicts({ nodes, typeConflictReporter }).hair
    ).toBeDefined()
  })

  it(`skips ignoredFields at the top level`, () => {
    const example = getExampleValueWithoutConflicts({
      nodes,
      typeConflictReporter,
      ignoreFields: [`name`, `anArray`],
    })

    expect(example.name).not.toBeDefined()
    expect(example.anArray).not.toBeDefined()
    expect(example.hair).toBeDefined()
    expect(example.context.nestedObject.name).toBeDefined()
  })

  it(`build enum values for fields from array on nodes`, () => {
    // TODO: Should be moved to `types/__tests__/sort.js`
    const { createSchemaComposer } = require(`../../schema-composer`)
    const { addInferredFields } = require(`../add-inferred-fields`)
    const { getFieldsEnum } = require(`../../types/sort`)

    const sc = createSchemaComposer()
    const tc = sc.createObjectTC(`Fields`)
    addInferredFields({
      schemaComposer: sc,
      typeComposer: tc,
      exampleValue: getExampleValueWithoutConflicts({
        nodes,
        typeConflictReporter,
      }),
    })

    const fields = getFieldsEnum({
      schemaComposer: sc,
      typeComposer: tc,
      inputTypeComposer: tc.getITC(),
    })
      .getType()
      .getValues()
      .reduce((acc, { name, value }) => {
        acc[name] = { field: value }
        return acc
      }, {})

    expect(fields).toMatchSnapshot()
  })

  it(`turns polymorphic fields null`, () => {
    let example = getExampleValue({
      nodes: [{ foo: null }, { foo: [1] }, { foo: { field: 1 } }],
      typeConflictReporter,
    })
    expect(example.foo).toBe(INVALID_VALUE)
  })

  it(`handles polymorphic arrays`, () => {
    let example = getExampleValue({
      nodes: [{ foo: [[`foo`, `bar`]] }, { foo: [{ field: 1 }] }],
      typeConflictReporter,
    })
    expect(example.foo).toBe(INVALID_VALUE)
  })

  it(`doesn't confuse empty fields for polymorphic ones`, () => {
    let example = getExampleValueWithoutConflicts({
      nodes: [{ foo: { bar: 1 } }, { foo: null }, { foo: { field: 1 } }],
      typeConflictReporter,
    })
    expect(example.foo).toEqual({ field: 1, bar: 1 })

    example = getExampleValueWithoutConflicts({
      nodes: [
        { foo: [{ bar: 1 }] },
        { foo: null },
        { foo: [{ field: 1 }, { baz: 1 }] },
      ],
      typeConflictReporter,
    })
    expect(example.foo).toEqual([{ field: 1, bar: 1, baz: 1 }])
  })

  it(`skips unsupported types`, () => {
    // Skips functions
    let example = getExampleValueWithoutConflicts({
      nodes: [{ foo: () => {} }],
      typeConflictReporter,
    })
    expect(example.foo).not.toBeDefined()

    // Skips array of functions
    example = getExampleValueWithoutConflicts({
      nodes: [{ foo: [() => {}] }],
      typeConflictReporter,
    })
    expect(example.foo).not.toBeDefined()
  })

  it(`prefers float when multiple number types`, () => {
    let example

    // nodes starting with 32-bit integer ("big" ints are float)
    example = getExampleValueWithoutConflicts({
      nodes: [{ number: 5 }, { number: 2.5 }],
      typeConflictReporter,
    })
    expect(example.number).toBeDefined()
    expect(example.number).toEqual(2.5)
    example = getExampleValueWithoutConflicts({
      nodes: [{ number: 5 }, { number: 3000000000 }],
      typeConflictReporter,
    })
    expect(example.number).toBeDefined()
    expect(example.number).toEqual(3000000000)

    // with node not containing number field
    example = getExampleValueWithoutConflicts({
      nodes: [{ number: 5 }, {}, { number: 2.5 }],
      typeConflictReporter,
    })
    expect(example.number).toBeDefined()
    expect(example.number).toEqual(2.5)

    // nodes starting with float ("big" ints are float)
    example = getExampleValueWithoutConflicts({
      nodes: [{ number: 2.5 }, { number: 5 }],
      typeConflictReporter,
    })
    expect(example.number).toBeDefined()
    expect(example.number).toEqual(2.5)
    example = getExampleValueWithoutConflicts({
      nodes: [{ number: 3000000000 }, { number: 5 }],
      typeConflictReporter,
    })
    expect(example.number).toBeDefined()
    expect(example.number).toEqual(3000000000)

    // array of numbers - starting with float
    example = getExampleValueWithoutConflicts({
      nodes: [{ numbers: [2.5, 5] }],
      typeConflictReporter,
    })
    expect(example.numbers).toBeDefined()
    expect(Array.isArray(example.numbers)).toBe(true)
    expect(example.numbers.length).toBe(1)
    expect(example.numbers[0]).toBe(2.5)
    example = getExampleValueWithoutConflicts({
      nodes: [{ numbers: [3000000000, 5] }],
      typeConflictReporter,
    })
    expect(example.numbers).toBeDefined()
    expect(Array.isArray(example.numbers)).toBe(true)
    expect(example.numbers.length).toBe(1)
    expect(example.numbers[0]).toBe(3000000000)

    // array of numbers - starting with 32-bit integer
    example = getExampleValueWithoutConflicts({
      nodes: [{ numbers: [5, 2.5] }],
      typeConflictReporter,
    })
    expect(example.numbers).toBeDefined()
    expect(Array.isArray(example.numbers)).toBe(true)
    expect(example.numbers.length).toBe(1)
    expect(example.numbers[0]).toBe(2.5)
    example = getExampleValueWithoutConflicts({
      nodes: [{ numbers: [5, 3000000000] }],
      typeConflictReporter,
    })
    expect(example.numbers).toBeDefined()
    expect(Array.isArray(example.numbers)).toBe(true)
    expect(example.numbers.length).toBe(1)
    expect(example.numbers[0]).toBe(3000000000)
  })

  it(`goes through nested object-like objects`, () => {
    class ObjectLike {
      constructor(key1, key2) {
        this.key1 = key1
        this.key2 = key2
      }
    }

    const example = getExampleValue({
      nodes: [
        {
          foo: new ObjectLike(1, `string`),
          bar: new ObjectLike(2, `string2`),
        },
      ],
      typeConflictReporter,
    })
    expect(example).toMatchInlineSnapshot(`
      Object {
        "bar": Object {
          "key1": 2,
          "key2": "string2",
        },
        "foo": Object {
          "key1": 1,
          "key2": "string",
        },
      }
    `)
  })

  describe(`handles mix of date strings and date objects`, () => {
    it(`infers mixed string and object dates as Date`, () => {
      let example = getExampleValueWithoutConflicts({
        nodes: [
          { date: new Date(`2017-12-01T14:59:45.600Z`) },
          { date: `2017-01-12T18:13:38.326Z` },
          { date: `` },
        ],
        typeConflictReporter,
      })
      expect(example.date).toMatchInlineSnapshot(`"1978-09-26"`)

      example = getExampleValueWithoutConflicts({
        nodes: [
          { date: `2017-01-12T18:13:38.326Z` },
          { date: new Date(`2017-12-01T14:59:45.600Z`) },
          { date: `` },
        ],
        typeConflictReporter,
      })
      expect(example.date).toMatchInlineSnapshot(`"1978-09-26"`)

      example = getExampleValueWithoutConflicts({
        nodes: [
          { date: `` },
          { date: `2017-01-12T18:13:38.326Z` },
          { date: new Date(`2017-12-01T14:59:45.600Z`) },
        ],
        typeConflictReporter,
      })
      expect(example.date).toMatchInlineSnapshot(`"1978-09-26"`)
    })

    it(`infers mixed date objects and non-date strings as string`, () => {
      let example = getExampleValueWithoutConflicts({
        nodes: [
          { date: new Date(`2017-12-01T14:59:45.600Z`) },
          { date: `This is not a date!!!!!!` },
          { date: `` },
        ],
        typeConflictReporter,
      })
      expect(example.date).toEqual(`String`)

      example = getExampleValueWithoutConflicts({
        nodes: [
          { date: `This is not a date!!!!!!` },
          { date: new Date(`2017-12-01T14:59:45.600Z`) },
          { date: `` },
        ],
        typeConflictReporter,
      })
      expect(example.date).toEqual(`String`)

      example = getExampleValueWithoutConflicts({
        nodes: [
          { date: `` },
          { date: `This is not a date!!!!!!` },
          { date: new Date(`2017-12-01T14:59:45.600Z`) },
        ],
        typeConflictReporter,
      })
      expect(example.date).toEqual(`String`)
    })

    it(`infers arrays with mix of date strings and date objects as dates`, () => {
      let example = getExampleValueWithoutConflicts({
        nodes: [
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
          { dates: [`2017-01-12T18:13:38.326Z`] },
          { dates: [``] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toMatchInlineSnapshot(`
        Array [
          "1978-09-26",
        ]
      `)

      example = getExampleValueWithoutConflicts({
        nodes: [
          { dates: [`2017-01-12T18:13:38.326Z`] },
          { dates: [``] },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toMatchInlineSnapshot(`
        Array [
          "1978-09-26",
        ]
      `)

      example = getExampleValueWithoutConflicts({
        nodes: [
          { dates: [``] },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
          { dates: [`2017-01-12T18:13:38.326Z`] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toMatchInlineSnapshot(`
        Array [
          "1978-09-26",
        ]
      `)
    })

    it(`infers arrays of mixed date objects and non-date strings as strings`, () => {
      let example = getExampleValueWithoutConflicts({
        nodes: [
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
          { dates: [`This is not a date!!!!!!`] },
          { dates: [``] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])

      example = getExampleValueWithoutConflicts({
        nodes: [
          { dates: [`This is not a date!!!!!!`] },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
          { dates: [``] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])

      example = getExampleValueWithoutConflicts({
        nodes: [
          { dates: [``] },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
          { dates: [`This is not a date!!!!!!`] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])
    })

    it(`infers single array of mixed date objects and date strings as date`, () => {
      let example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              new Date(`2017-12-01T14:59:45.600Z`),
              `2017-01-12T18:13:38.326Z`,
              ``,
            ],
          },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toMatchInlineSnapshot(`
        Array [
          "1978-09-26",
        ]
      `)

      example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              `2017-01-12T18:13:38.326Z`,
              new Date(`2017-12-01T14:59:45.600Z`),
              ``,
            ],
          },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toMatchInlineSnapshot(`
        Array [
          "1978-09-26",
        ]
      `)

      example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              ``,
              `2017-01-12T18:13:38.326Z`,
              new Date(`2017-12-01T14:59:45.600Z`),
            ],
          },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toMatchInlineSnapshot(`
        Array [
          "1978-09-26",
        ]
      `)
    })

    it(`infers arrays of mixed date objects and non-date strings as strings`, () => {
      let example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              new Date(`2017-12-01T14:59:45.600Z`),
              ``,
              `This is not a date!!!!!!`,
            ],
          },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])

      example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              ``,
              new Date(`2017-12-01T14:59:45.600Z`),
              `This is not a date!!!!!!`,
            ],
          },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])
    })

    it(`infers variadic arrays of mix of dates and date strings as date`, () => {
      const example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              new Date(`2017-12-01T14:59:45.600Z`),
              `2017-01-12T18:13:38.326Z`,
              ``,
            ],
          },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`), ``] },
          { dates: [``, `2017-01-12T18:13:38.326Z`] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toMatchInlineSnapshot(`
        Array [
          "1978-09-26",
        ]
      `)
    })

    it(`infers variadic arrays of mix of dates and non-date strings as string`, () => {
      let example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              ``,
              new Date(`2017-12-01T14:59:45.600Z`),
              `This is not a date!!!!!!`,
            ],
          },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
          { dates: [`2017-01-12T18:13:38.326Z`] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])

      example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              new Date(`2017-12-01T14:59:45.600Z`),
              `2017-01-12T18:13:38.326Z`,
            ],
          },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`), ``] },
          { dates: [`This is not a date!!!!!!`] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])

      // should be valid - separate arrays of both unique types and mixed types (string is not a date) #2
      example = getExampleValueWithoutConflicts({
        nodes: [
          {
            dates: [
              ``,
              new Date(`2017-12-01T14:59:45.600Z`),
              `This is not a date!!!!!!`,
            ],
          },
          { dates: [new Date(`2017-12-01T14:59:45.600Z`)] },
          { dates: [`This is not a date!!!!!!`] },
        ],
        typeConflictReporter,
      })
      expect(example.dates).toEqual([`String`])
    })
  })

  describe(`Handles ___NODE foreign-key convenience relations`, () => {
    it(`infers single related node id as a simple string`, () => {
      const example = getExampleValueWithoutConflicts({
        nodes: [
          { related___NODE: `foo` },
          { related___NODE: `bar` },
          { related___NODE: `baz` },
        ],
        typeConflictReporter,
      })
      expect(example.related___NODE).toEqual({
        multiple: false,
        linkedNodes: [`foo`, `bar`, `baz`],
      })
    })

    it(`aggregates array of related node ids`, () => {
      const example = getExampleValueWithoutConflicts({
        nodes: [
          { related___NODE: [`foo`] },
          { related___NODE: [`bar`] },
          { related___NODE: [`foo`, `baz`] },
        ],
        typeConflictReporter,
      })
      expect(example.related___NODE).toEqual({
        multiple: true,
        linkedNodes: [`foo`, `bar`, `baz`],
      })
    })

    it(`skips nullish values and empty arrays/objects`, () => {
      const example = getExampleValueWithoutConflicts({
        nodes: [
          { related___NODE: [] },
          { related___NODE: {} },
          { related___NODE: null },
          { related___NODE: undefined },
        ],
        typeConflictReporter,
      })
      expect(example.related___NODE).toEqual(INVALID_VALUE)
    })
  })

  describe(`Incremental example value building`, () => {
    const nodes = [
      {
        name: `The Mad Max`,
        hair: 1,
        date: `2006-07-22T22:39:53.000Z`,
        "key-with..unsupported-values": true,
      },
      {
        emptyArray: [undefined, null],
        anArray: [1, 2, 5, 4],
        nestedArrays: [[1, 2, 3]],
        object: { foo: 1 },
        objectsInArray: [{ foo: `foo` }],
        context: {
          nestedObject: null,
        },
      },
      {
        anArray: [1, 3],
        object: { bar: `bar` },
        objectsInArray: [{ foo: `foo` }, { bar: `bar` }],
        frontmatter: {
          date: `2006-07-22T22:39:53.000Z`,
          title: `The world of slash and adventure1`,
          blue: 10010,
        },
        context: {
          nestedObject: {
            bar: `bar`,
            someOtherProperty: 2,
          },
        },
      },
      {
        object: {},
        objectsInArray: [{ baz: `baz` }],
        frontmatter: {
          title: `The world of slash and adventure2`,
          circle: `happy`,
          draft: false,
        },
        context: {
          nestedObject: {
            name: `Inner name`,
            someOtherProperty: 3,
          },
        },
      },
    ]
    it(`updates example value when nodes are added`, () => {
      let inferenceMetadata = {
        typeName: `IncrementalExampleValue`,
        typeConflictReporter,
        ignoredFields: new Set(),
      }

      const revisions = nodes.map(node => {
        inferenceMetadata = addNode(inferenceMetadata, node)
        return getExampleObject(inferenceMetadata)
      })

      expect(revisions).toMatchSnapshot()
      expect(typeConflictReporter.getConflicts()).toEqual([])
    })

    it(`updates example value on node delete`, () => {
      let inferenceMetadata = {
        typeName: `IncrementalExampleValue`,
        typeConflictReporter,
        ignoredFields: new Set(),
      }
      inferenceMetadata = addNodes(inferenceMetadata, nodes)
      const fullExampleValue = getExampleObject(inferenceMetadata)

      inferenceMetadata = deleteNode(inferenceMetadata, nodes[2])
      expect(getExampleObject(inferenceMetadata)).toMatchSnapshot()

      inferenceMetadata = deleteNode(inferenceMetadata, nodes[3])
      expect(getExampleObject(inferenceMetadata)).toMatchSnapshot()

      inferenceMetadata = deleteNode(inferenceMetadata, nodes[1])
      expect(getExampleObject(inferenceMetadata)).toMatchSnapshot()

      // Re-adding deleted nodes should restore original example value:
      inferenceMetadata = addNodes(inferenceMetadata, [
        nodes[2],
        nodes[3],
        nodes[1],
      ])
      expect(getExampleObject(inferenceMetadata)).toEqual(fullExampleValue)
    })
  })
})

describe(`Type conflicts`, () => {
  it(`Doesn't report conflicts if there are none`, () => {
    const nodes = [
      {
        id: `id1`,
        string: `string`,
        number: 5,
        boolean: true,
        arrayOfStrings: [`string1`],
      },
      {
        id: `id2`,
        string: `other string`,
        number: 3.5,
        boolean: false,
        arrayOfStrings: null,
      },
    ]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `NoConflict`,
    })

    expect(conflicts).toEqual([])
  })

  it(`reports type conflicts and its origin`, () => {
    const nodes = [
      {
        id: `id1`,
        stringOrNumber: `string`,
        number: 5,
        boolean: true,
        arrayOfStrings: [`string1`],
      },
      {
        id: `id2`,
        stringOrNumber: 5,
        number: 3.5,
        boolean: false,
        arrayOfStrings: null,
      },
    ]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_1`,
    })

    expect(conflicts).toMatchSnapshot()
  })

  it(`reports conflict when array has mixed types and its origin`, () => {
    const nodes = [
      {
        id: `id1`,
        arrayOfMixedType: [`string1`, 5, `string2`, true],
      },
    ]
    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_2`,
    })
    expect(conflicts).toMatchSnapshot()
  })

  it(`doesn't report ignored fields`, () => {
    const nodes = [
      {
        id: `id1`,
        stringOrNumber: `string`,
        other: 1,
      },
      {
        id: `id2`,
        stringOrNumber: 5,
        other: `foo`,
      },
    ]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_3`,
      ignoreFields: [`stringOrNumber`],
    })

    expect(conflicts).toMatchSnapshot()
  })

  it(`reports on mixed ___NODE fields`, () => {
    const nodes = [{ related___NODE: `foo` }, { related___NODE: [`bar`] }]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_4`,
    })

    expect(conflicts).toMatchSnapshot()
  })

  it(`reports on numbers represented as strings`, () => {
    const nodes = [{ numeric: 1 }, { numeric: `2` }]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_5`,
    })

    expect(conflicts).toMatchSnapshot()
  })

  it(`reports on mixed numbers and numeric strings in arrays`, () => {
    const nodes = [
      { id: `1`, numeric: [1, 2] },
      { id: `2`, numeric: [4, `5`] },
    ]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_6`,
    })

    expect(conflicts).toMatchSnapshot()
  })

  it(`reports mixed scalars and objects`, () => {
    const nodes = [
      { id: `1`, numeric: 1, string: `str`, boolean: true },
      {
        id: `2`,
        numeric: { value: 1 },
        string: { value: `str` },
        boolean: { value: true },
      },
    ]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_7`,
    })

    expect(conflicts).toMatchSnapshot()
  })

  it(`reports mixed scalars and arrays`, () => {
    const nodes = [
      { id: `1`, numeric: 1, string: `str`, mixed: true },
      {
        id: `2`,
        numeric: [1],
        string: [`str`],
        mixed: [1],
      },
    ]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_8`,
    })

    expect(conflicts).toMatchSnapshot()
  })

  it(`doesn't report conflicts with null`, () => {
    const nodes = [
      { id: `1`, scalar: 1, obj: { value: 1 }, arr: [1] },
      { id: `2`, scalar: null, obj: null, arr: null },
    ]
    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_9`,
    })
    expect(conflicts).toEqual([])
  })

  it(`doesn't report conflicts with empty arrays`, () => {
    const nodes = [
      { id: `1`, scalar: 1, obj: { value: 1 }, arr: [1] },
      { id: `2`, scalar: [], obj: [], arr: [] },
    ]
    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_10`,
    })
    expect(conflicts).toEqual([])
  })

  it(`doesn't report conflicts with empty objects`, () => {
    const nodes = [
      { id: `1`, scalar: 1, obj: { value: 1 }, arr: [1] },
      { id: `2`, scalar: {}, obj: {}, arr: {} },
    ]
    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_10`,
    })
    expect(conflicts).toEqual([])
  })

  // We removed this warning to not confuse people
  it.skip(`reports date and string conflicts`, () => {
    const nodes = [
      {
        id: `id1`,
        date: `2019-01-01`,
      },
      {
        id: `id2`,
        date: `Totally not a date`,
      },
    ]

    const conflicts = getExampleValueConflicts({
      nodes,
      typeName: `Conflict_1`,
    })
    expect(conflicts).toMatchSnapshot()
  })
})

describe(`Type change detection`, () => {
  let initialMetadata

  const nodes = () => [
    { foo: `foo` },
    { object: { foo: `foo`, bar: `bar` } },
    { list: [`item`], bar: `bar` },
    { listOfObjects: [{ foo: `foo`, bar: `bar` }] },
    { relatedNode___NODE: `foo` },
    { relatedNodeList___NODE: [`foo`] },
  ]

  const addOne = (node, metadata = initialMetadata) =>
    addNode(_.cloneDeep(metadata), node)
  const deleteOne = (node, metadata = initialMetadata) =>
    deleteNode(_.cloneDeep(metadata), node)

  beforeEach(() => {
    initialMetadata = addNodes({}, nodes())
    initialMetadata.dirty = false
  })

  it(`detects on a field add`, () => {
    const metadata = addOne({ added: `added` })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(false)
  })

  it(`detects on a field delete`, () => {
    const metadata = deleteOne(nodes()[0])
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(false)
  })

  it(`does not detect when structure doesn't change`, () => {
    let metadata = addOne({ foo: `bar` })
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)

    metadata = deleteOne({ foo: `bar` }, metadata)
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`detects on a nested field add`, () => {
    const metadata = addOne({ object: { added: `added` } })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(false)
  })

  it(`detects on a nested field delete`, () => {
    const metadata = deleteOne({ object: { bar: `bar` } })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(false)
  })

  it(`does not detect when a nested object structure doesn't change`, () => {
    let metadata = addOne({ object: { bar: `baz` } })
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)

    metadata = deleteOne({ object: { bar: `baz` } }, metadata)
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`does not detect on a new list item`, () => {
    const metadata = addOne({ list: [`item2`] })
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`detects on list getting empty`, () => {
    const metadata = deleteOne({ list: [`item`] })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(false)
  })

  it(`detects on field add to nested object within the list`, () => {
    const metadata = addOne({ listOfObjects: [{ added: `added` }] })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(false)
  })

  it(`detects on field delete from the nested object within the list`, () => {
    const metadata = deleteOne({ listOfObjects: [{ bar: `bar` }] })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(false)
  })

  it(`does not detect when structure of the nested object doesn't change`, () => {
    let metadata = addOne({ listOfObjects: [{ bar: `bar` }] })
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)

    metadata = deleteOne({ listOfObjects: [{ bar: `bar` }] }, metadata)
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`detects on any change of the relatedNode field`, () => {
    // We do not know a type of the node being added hence consider and
    // add/delete to such fields as mutations
    let metadata = addOne({ relatedNode___NODE: `added` })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
    metadata.dirty = false

    metadata = deleteOne({ relatedNode___NODE: `added` }, metadata)
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`does not detect when the same node added to the relatedNode field`, () => {
    const metadata = addOne({ relatedNode___NODE: `foo` })
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`detects on any change of the relatedNodeList field`, () => {
    let metadata = addOne({ relatedNodeList___NODE: [`added`] })
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
    metadata.dirty = false

    metadata = deleteOne({ relatedNodeList___NODE: [`added`] }, metadata)
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`does not detect when the same node added to the relatedNodeList field`, () => {
    const metadata = addOne({ relatedNodeList___NODE: [`foo`] })
    expect(metadata.dirty).toEqual(false)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })

  it(`does not detect on symmetric add/delete`, () => {
    let metadata
    metadata = addOne({ added: `added` })
    metadata = deleteOne({ added: `added` }, metadata)
    expect(metadata.dirty).toEqual(true)
    expect(haveEqualFields(metadata, initialMetadata)).toEqual(true)
  })
})
