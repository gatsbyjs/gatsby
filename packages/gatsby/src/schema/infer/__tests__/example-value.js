const { getExampleValue } = require(`../example-value`)
const { nodes } = require(`./__fixtures__`)

const { reportConflict } = require(`../type-conflict-reporter`)
jest.mock(`../type-conflict-reporter`)

describe(`Example value`, () => {
  // beforeEach(() => {
  //   clearExampleValueCache()
  // })

  const exampleValue = getExampleValue({ nodes })

  it(`builds correct example value from array of nodes`, () => {
    expect(exampleValue).toMatchSnapshot()
  })

  it(`does not mutate nodes`, () => {
    expect(nodes[0].null).toBeDefined()
  })

  it.skip(`caches results`, () => {
    const exampleValueFromSameNodes = getExampleValue({
      nodes,
      typeName: `Foo`,
    })
    expect(exampleValueFromSameNodes).toBe(exampleValue)
  })

  it(`skips ignoreFields at the top level`, () => {
    const exampleValueWithIgnoredFields = getExampleValue({
      nodes,
      ignoreFields: [`int`, `date`],
    })
    expect(exampleValueWithIgnoredFields.int).not.toBeDefined()
    expect(exampleValueWithIgnoredFields.date).not.toBeDefined()
    expect(exampleValueWithIgnoredFields.object.int).toBeDefined()
    expect(exampleValueWithIgnoredFields.object.date).toBeDefined()
  })

  // Also tested with snapshot

  it(`skips null fields`, () => {
    expect(exampleValue.null).not.toBeDefined()
  })

  it(`skips empty or sparse arrays`, () => {
    expect(exampleValue.emptyArray).not.toBeDefined()
  })

  it(`skips empty objects`, () => {
    expect(exampleValue.emptyObject).not.toBeDefined()
  })

  it(`skips polymorphic fields`, () => {
    expect(exampleValue.polymorphic).not.toBeDefined()
    expect(exampleValue.polymorphicArray).not.toBeDefined()
  })

  it(`does not confuse empty fields for polymorphic fields`, () => {
    expect(exampleValue.polymorphicWithNull).toEqual({
      foo: { bar: true, baz: true },
    })
    expect(exampleValue.polymorphicArrayWithNull).toEqual({
      foo: [{ bar: true, baz: true, qux: false }],
    })
  })

  it(`skips functions`, () => {
    expect(exampleValue.function).not.toBeDefined()
    expect(exampleValue.arrayOfFunctions).not.toBeDefined()
  })

  it(`prefers float in case of multiple number types`, () => {
    expect(exampleValue.int).toBe(0)
    expect(exampleValue.number).toBe(0.1)
    expect(exampleValue.float).toBe(0.1)
    expect(exampleValue.arrayOfNumbers).toEqual([0.2])
  })

  it(`treats non-32bit-integers as float (as mandated by GraphQL spec)`, () => {
    expect(exampleValue.bigInt).toBe(1e10)
  })

  it(`handles mix of date strings and date objects`, () => {
    expect(exampleValue.date).toBeDefined()
    expect(exampleValue.invalidDate).not.toBeDefined()
    expect(exampleValue.dates).toBeDefined()
    expect(exampleValue.invalidDates).not.toBeDefined()
  })
})

describe(`Type conflicts`, () => {
  beforeEach(() => {
    reportConflict.mockReset()
  })

  it(`does not report conflicts if there are none`, () => {
    const nodes = [
      {
        id: 0,
        string: `foo`,
        number: 1,
        bool: true,
        array: [`foo`],
      },
      {
        id: 1,
        string: `bar`,
        number: 0.1,
        bool: false,
        array: null,
      },
    ]
    getExampleValue({ nodes })
    expect(reportConflict).not.toBeCalled()
  })

  it(`does not report ignored fields`, () => {
    const nodes = [
      { id: 0, stringOrNumber: `foo`, stringOrBoolean: `bar` },
      { id: 1, stringOrNumber: 1, stringOrBoolean: true },
    ]
    getExampleValue({ nodes, ignoreFields: [`stringOrNumber`] })
    expect(reportConflict).toHaveBeenCalledTimes(1)
    expect(reportConflict).not.toBeCalledWith(`stringOrNumber`)
    expect(reportConflict).toBeCalledWith(`stringOrBoolean`, expect.any(Array))
  })

  it(`reports type conflicts and their origin`, () => {
    const nodes = [
      {
        stringOrNumber: `foo`,
        arrayOfStringOrNumber: [`foo`],
        arrayOfStringOrBoolean: [`foo`, true],
      },
      {
        stringOrNumber: 1,
        arrayOfStringOrNumber: [1],
        arrayOfStringOrBoolean: null,
      },
    ]
    getExampleValue({ nodes, typeName: `Conflict` })
    expect(reportConflict).toHaveBeenCalledTimes(3)
    expect(reportConflict).toBeCalledWith(`Conflict.stringOrNumber`, [
      { parent: nodes[0], type: `string`, value: nodes[0].stringOrNumber },
      { parent: nodes[1], type: `number`, value: nodes[1].stringOrNumber },
    ])
    expect(reportConflict).toBeCalledWith(`Conflict.arrayOfStringOrNumber`, [
      {
        parent: nodes[0],
        type: `[string]`,
        value: nodes[0].arrayOfStringOrNumber,
      },
      {
        parent: nodes[1],
        type: `[number]`,
        value: nodes[1].arrayOfStringOrNumber,
      },
    ])
    expect(reportConflict).toBeCalledWith(`Conflict.arrayOfStringOrBoolean`, [
      {
        parent: nodes[0],
        type: `[string,boolean]`,
        value: nodes[0].arrayOfStringOrBoolean,
      },
    ])
  })
})
