const getValueAtSelector = require(`../get-value-at-selector`)

const obj = {
  foo: {
    bar: {
      baz: `qux`,
    },
    baz: [`qux`],
    qux: [{ foo: `bar` }, {}, { foo: null }, { foo: `baz` }],
    null: null,
  },
}

describe(`getValueAtSelector util`, () => {
  it(`returns value at nested selector`, () => {
    const value = getValueAtSelector(obj, `foo.bar.baz`)
    expect(value).toBe(`qux`)
  })

  it(`handles selector with key referencing non-existing props`, () => {
    const value = getValueAtSelector(obj, `foo.foo.foo`)
    const arrayValue = getValueAtSelector(obj, `foo.qux.baz`)
    expect(value).toBeUndefined()
    // FIXME: What is the expected behavior here: [] or undefined?
    expect(arrayValue).toEqual([])
  })

  it(`handles arrays`, () => {
    const value = getValueAtSelector(obj, `foo.baz`)
    expect(value).toEqual([`qux`])
  })

  it(`handles arrays of objects`, () => {
    const value = getValueAtSelector(obj, `foo.qux.foo`)
    // FIXME: Filter out null or not?
    expect(value).toEqual([`bar`, null, `baz`])
  })

  it(`handles null values`, () => {
    const value = getValueAtSelector(obj, `foo.null`)
    expect(value).toBeNull()
  })
})
