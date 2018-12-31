const stringToRegExp = require(`../string-to-regexp`)

describe(`Convert string to RegExp`, () => {
  it(`converts regex and flags`, () => {
    const regex = stringToRegExp(`/\\w+/gimuy`)
    expect(regex).toBeInstanceOf(RegExp)
    expect(regex.source).toBe(`\\w+`)
    expect(regex.flags).toBe(`gimuy`)
  })

  it(`handles slashes`, () => {
    const regex = stringToRegExp(`/\\w+/\\w+/`)
    expect(regex).toBeInstanceOf(RegExp)
    expect(regex.source).toBe(`\\w+\\/\\w+`)
    expect(regex.flags).toBe(``)
  })

  it(`throws on invalid regex string`, () => {
    expect(() => stringToRegExp(`/\\w+`)).toThrow()
    expect(() => stringToRegExp(`\\w+/`)).toThrow()
    expect(() => stringToRegExp(`\\w+`)).toThrow()
    expect(() => stringToRegExp(`i/\\w+/`)).toThrow()
    expect(() => stringToRegExp(`/\\w+/z`)).toThrow()
  })
})
