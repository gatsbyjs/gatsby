const createTypeName = require(`../create-type-name`)

describe(`createTypeName util`, () => {
  it(`creates a valid type name from a selector`, () => {
    const selector = `foobar`
    const typeName = createTypeName(selector)
    const expected = `Foobar`
    expect(typeName).toBe(expected)
  })

  it(`creates a valid type name from a nested selector`, () => {
    const selector = `foo.bar.baz`
    const typeName = createTypeName(selector)
    const expected = `FooBarBaz`
    expect(typeName).toBe(expected)
  })

  it(`creates a valid type name from a selector with spaces`, () => {
    const selector = `foo bar baz`
    const typeName = createTypeName(selector)
    const expected = `Foo_bar_baz`
    expect(typeName).toBe(expected)
  })

  it(`creates a valid type name from a selector starting with a digit`, () => {
    const selector = `0foo bar..baz`
    const typeName = createTypeName(selector)
    const expected = `_foo_barBaz`
    expect(typeName).toBe(expected)
  })

  it(`creates a valid type name from a selector with unsafe chars`, () => {
    const selector = `00^°"§$%&/()=?{}[]\`´\\+*~#'-_:;,<>|`
    const typeName = createTypeName(selector)
    const expected = `_0________________________________`
    expect(typeName).toBe(expected)
  })

  it(`creates a valid type name from a selector with emoji`, () => {
    const selector = `foo.🐱.bar`
    const typeName = createTypeName(selector)
    const expected = `Foo__Bar`
    expect(typeName).toBe(expected)
  })

  it(`throws on selector with leading double underscore`, () => {
    const selector = `__foobar`
    expect(() => createTypeName(selector)).toThrow()
  })

  it(`throws on selector with two leading unsafe chars`, () => {
    const selector = `0$foobar`
    expect(() => createTypeName(selector)).toThrow()
  })

  it(`throws on null`, () => {
    const selector = null
    expect(() => createTypeName(selector)).toThrow()
  })
})
