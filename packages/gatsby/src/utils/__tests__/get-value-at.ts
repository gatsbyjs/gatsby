import { getValueAt } from "../get-value-at"

describe(`getValueAt util`, () => {
  it(`handles object properties`, () => {
    const obj = { foo: `bar` }
    const value = getValueAt(obj, `foo`)
    expect(value).toBe(`bar`)
  })

  it(`handles nested object properties`, () => {
    const obj = { foo: { foo: `bar` } }
    const value = getValueAt(obj, `foo.foo`)
    expect(value).toBe(`bar`)
  })

  it(`handles array values`, () => {
    const obj = { foo: [`bar`, `baz`] }
    const value = getValueAt(obj, `foo`)
    expect(value).toEqual([`bar`, `baz`])
  })

  it(`handles arrays of objects`, () => {
    const obj = { foo: [{ foo: `bar` }, { foo: `baz` }] }
    const value = getValueAt(obj, `foo.foo`)
    expect(value).toEqual([`bar`, `baz`])
  })

  it(`handles arrays of objects with array values`, () => {
    const obj = { foo: [{ foo: [`bar`, `baz`] }, { foo: [`qux`] }] }
    const value = getValueAt(obj, `foo.foo`)
    expect(value).toEqual([[`bar`, `baz`], [`qux`]])
  })

  it(`handles arrays of arrays`, () => {
    const obj = { foo: [[`bar`], [`baz`, `qux`]] }
    const value = getValueAt(obj, `foo`)
    expect(value).toEqual([[`bar`], [`baz`, `qux`]])
  })

  it(`handles arrays of arrays of objects`, () => {
    const obj = {
      foo: [
        [{ foo: [`bar`] }, { foo: [`baz`, `qux`] }],
        [{ foo: [`foo`, `bar`] }, { foo: [`qux`] }],
      ],
    }
    const value = getValueAt(obj, `foo.foo`)
    expect(value).toEqual([
      [[`bar`], [`baz`, `qux`]],
      [[`foo`, `bar`], [`qux`]],
    ])
  })

  it(`handles nested arrays of objects`, () => {
    const obj = {
      foo: [
        [
          { foo: [{ foo: { bar: `bar` } }] },
          { foo: [{ foo: { bar: `baz` } }, { foo: { bar: `qux` } }] },
        ],
        [
          { foo: [{ foo: { bar: `foo` } }, { foo: { bar: `bar` } }] },
          { foo: [{ foo: { bar: `qux` } }] },
        ],
      ],
    }
    const value = getValueAt(obj, `foo.foo.foo.bar`)
    expect(value).toEqual([
      [[`bar`], [`baz`, `qux`]],
      [[`foo`, `bar`], [`qux`]],
    ])
  })

  it(`accepts selector as array`, () => {
    const obj = { foo: [{ foo: `bar` }] }
    const value = getValueAt(obj, [`foo`, `foo`])
    expect(value).toEqual([`bar`])
  })

  it(`handles non-existing selector`, () => {
    const obj = { foo: `bar` }
    const value = getValueAt(obj, `foo.foo`)
    expect(value).toBeUndefined()
  })

  it(`handles non-existing selector in array`, () => {
    const obj = { foo: [[{ foo: `bar` }]] }
    const value = getValueAt(obj, `foo.foo.foo`)
    expect(value).toEqual([[]])
  })

  it(`handles sparse array`, () => {
    const obj = { foo: [{ foo: `bar` }, { baz: `baz` }] }
    const value = getValueAt(obj, `foo.foo`)
    expect(value).toEqual([`bar`])
  })
})
