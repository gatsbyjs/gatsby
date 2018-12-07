const createSortKey = require(`../create-sort-key`)

describe(`createSortKey util`, () => {
  it(`creates a valid sort key from a selector`, () => {
    const selector = `foo.bar.baz`
    const sortKey = createSortKey(selector, `.`)
    const expected = `FOO_BAR_BAZ`
    expect(sortKey).toBe(expected)
  })

  it(`accepts a delimiter argument`, () => {
    const selector = `foo.bar.baz`
    const sortKey = createSortKey(selector, `___`)
    const expected = `FOO___BAR___BAZ`
    expect(sortKey).toBe(expected)
  })

  it(`handles empty selector`, () => {
    const selector = ``
    const sortKey = createSortKey(selector)
    const expected = ``
    expect(sortKey).toBe(expected)
  })

  it(`correctly snakecases everything but the first character`, () => {
    const selector = `FooBar.bazQuz`
    const sortKey = createSortKey(selector, `___`)
    const expected = `FOO_BAR___BAZ_QUZ`
    expect(sortKey).toBe(expected)
  })

  it(`handles null`, () => {
    const selector = null
    const sortKey = createSortKey(selector)
    expect(sortKey).toBeNull()
  })
})
