const {
  getExampleValues,
  buildFieldEnumValues,
  clearTypeExampleValues,
  INVALID_VALUE,
} = require(`../data-tree-utils`)
const {
  typeConflictReporter,
  TypeConflictEntry,
} = require(`../type-conflict-reporter`)

describe(`Gatsby data tree utils`, () => {
  beforeEach(() => {
    clearTypeExampleValues()
  })

  const nodes = [
    {
      name: `The Mad Max`,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
      "key-with..unsupported-values": true,
      emptyArray: [],
      anArray: [1, 2, 3, 4],
      nestedArrays: [[1, 2, 3], [4, 5, 6]],
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
          someOtherProperty: 3,
        },
      },
    },
  ]

  it(`builds field examples from an array of nodes`, () => {
    expect(getExampleValues(nodes)).toMatchSnapshot()
  })

  it(`skips null fields`, () => {
    expect(getExampleValues(nodes).iAmNull).not.toBeDefined()
  })

  it(`should not mutate the nodes`, () => {
    getExampleValues(nodes)
    expect(nodes[0].context.nestedObject).toBeNull()
    expect(nodes[1].context.nestedObject.someOtherProperty).toEqual(1)
    expect(nodes[2].context.nestedObject.someOtherProperty).toEqual(2)
    expect(nodes[3].context.nestedObject.someOtherProperty).toEqual(3)
  })

  it(`skips empty or sparse arrays`, () => {
    expect(getExampleValues(nodes).emptyArray).not.toBeDefined()
    expect(getExampleValues(nodes).hair).toBeDefined()
  })

  it(`build enum values for fields from array on nodes`, () => {
    expect(buildFieldEnumValues(nodes)).toMatchSnapshot()
  })

  it(`turns polymorphic fields null`, () => {
    let example = getExampleValues([
      { foo: null },
      { foo: [1] },
      { foo: { field: 1 } },
    ])
    expect(example.foo).toBe(INVALID_VALUE)
  })

  it(`handles polymorphic arrays`, () => {
    let example = getExampleValues([
      { foo: [[`foo`, `bar`]] },
      { foo: [{ field: 1 }] },
    ])
    expect(example.foo).toBe(INVALID_VALUE)
  })

  it(`doesn't confuse empty fields for polymorhpic ones`, () => {
    let example = getExampleValues([
      { foo: { bar: 1 } },
      { foo: null },
      { foo: { field: 1 } },
    ])
    expect(example.foo).toEqual({ field: 1, bar: 1 })

    example = getExampleValues([
      { foo: [{ bar: 1 }] },
      { foo: null },
      { foo: [{ field: 1 }, { baz: 1 }] },
    ])
    expect(example.foo).toEqual([{ field: 1, bar: 1, baz: 1 }])
  })

  it(`skips unsupported types`, () => {
    // Skips functions
    let example = getExampleValues([{ foo: () => {} }])
    expect(example.foo).not.toBeDefined()

    // Skips array of functions
    example = getExampleValues([{ foo: [() => {}] }])
    expect(example.foo).not.toBeDefined()
  })
})

describe(`Type conflicts`, () => {
  let addConflictSpy = jest.spyOn(typeConflictReporter, `addConflict`)
  let addConflictExampleSpy = jest.spyOn(
    TypeConflictEntry.prototype,
    `addExample`
  )

  beforeEach(() => {
    clearTypeExampleValues()
    addConflictExampleSpy.mockReset()
  })

  afterAll(() => {
    addConflictSpy.mockRestore()
    addConflictExampleSpy.mockRestore()
  })

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

    getExampleValues({ nodes, type: `NoConflict` })

    expect(addConflictExampleSpy).not.toBeCalled()
  })

  it(`Report type conflicts and its origin`, () => {
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

    getExampleValues({ nodes, type: `Conflict_1` })

    expect(addConflictSpy).toBeCalled()
    expect(addConflictSpy).toBeCalledWith(
      `Conflict_1.stringOrNumber`,
      expect.any(Array)
    )

    // expect(addConflictExampleSpy).toBeCalled()
    expect(addConflictExampleSpy).toHaveBeenCalledTimes(2)
    expect(addConflictExampleSpy).toBeCalledWith(
      expect.objectContaining({
        value: nodes[0].stringOrNumber,
        type: `string`,
        parent: nodes[0],
      })
    )
    expect(addConflictExampleSpy).toBeCalledWith(
      expect.objectContaining({
        value: nodes[1].stringOrNumber,
        type: `number`,
        parent: nodes[1],
      })
    )
  })

  it(`Report conflict when array has mixed types and its origin`, () => {
    const nodes = [
      {
        id: `id1`,
        arrayOfMixedType: [`string1`, 5, `string2`, true],
      },
    ]

    getExampleValues({ nodes, type: `Conflict_2` })
    expect(addConflictSpy).toBeCalled()
    expect(addConflictSpy).toBeCalledWith(
      `Conflict_2.arrayOfMixedType`,
      expect.any(Array)
    )

    expect(addConflictExampleSpy).toBeCalled()
    expect(addConflictExampleSpy).toHaveBeenCalledTimes(1)
    expect(addConflictExampleSpy).toBeCalledWith(
      expect.objectContaining({
        value: nodes[0].arrayOfMixedType,
        type: `array<boolean|number|string>`,
        parent: nodes[0],
      })
    )
  })
})
