const getUniqueValues = require(`../get-unique-values`)

const values = [`Foo`, `Bar`, `Bar`, `Foo`]

describe(`getUniqueValues util`, () => {
  it(`returns unique values from array`, () => {
    const unique = getUniqueValues(values)
    const expected = [`Foo`, `Bar`]
    expect(unique).toEqual(expected)
  })
})
