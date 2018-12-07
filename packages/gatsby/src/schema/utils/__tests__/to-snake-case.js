const toSnakeCase = require(`../to-snake-case`)

describe(`toSnakeCase util`, () => {
  it(`snakecases everything except the first character`, () => {
    const str = `FooBarBazQuz`
    const snakeCased = toSnakeCase(str)
    const expected = `Foo_bar_baz_quz`
    expect(snakeCased).toBe(expected)
  })

  it(`handles null`, () => {
    const str = null
    const snakeCased = toSnakeCase(str)
    expect(snakeCased).toBeNull()
  })
})
