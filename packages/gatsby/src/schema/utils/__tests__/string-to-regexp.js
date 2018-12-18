const stringToRegExp = require(`../string-to-regexp`)

describe(`Convert string to RegExp`, () => {
  it(`converts regex and flags`, () => {
    const regex = stringToRegExp(`/\\w+/gimuy`)
    expect(regex).toBeInstanceOf(RegExp)
    expect(regex.source).toBe(`\\w+`)
    expect(regex.flags).toBe(`gimuy`)
  })
})
