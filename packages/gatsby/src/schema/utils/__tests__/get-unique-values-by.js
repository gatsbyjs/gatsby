const getUniqueValuesBy = require(`../get-unique-values-by`)

const values = [
  { name: `Foo`, foo: `bar` },
  { name: `Bar` },
  { name: `Foo` },
  { name: `Foo`, baz: `qux` },
  { name: `Bar`, bar: 0 },
  { name: `Foo` },
]

describe(`getUniqueValuesBy util`, () => {
  it(`returns objects unique by prop`, () => {
    const unique = getUniqueValuesBy(values, v => v.name)
    const expected = [{ name: `Foo`, foo: `bar` }, { name: `Bar` }]
    expect(unique).toEqual(expected)
  })
})
