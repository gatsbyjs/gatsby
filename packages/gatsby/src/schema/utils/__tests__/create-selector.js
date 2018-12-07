const createSelector = require(`../create-selector`)

describe(`createSelector util`, () => {
  it(`creates a valid selector`, () => {
    const prefix = `Foo`
    const key = `bar`
    const selector = createSelector(prefix, key)
    const expected = `Foo.bar`
    expect(selector).toBe(expected)
  })

  it(`handles empty prefix`, () => {
    const prefix = ``
    const key = `bar`
    const selector = createSelector(prefix, key)
    const expected = `bar`
    expect(selector).toBe(expected)
  })

  it(`handles empty key`, () => {
    const prefix = `foo`
    const key = ``
    const selector = createSelector(prefix, key)
    const expected = ``
    expect(selector).toBe(expected)
  })
})
