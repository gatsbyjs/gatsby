const capitalize = require(`../capitalize`)

describe(`capitalize util`, () => {
  it(`capitalizes a string`, () => {
    const string = `foobar`
    const capitalized = capitalize(string)
    const expected = `Foobar`
    expect(capitalized).toBe(expected)
  })

  it(`handles empty string`, () => {
    const string = ``
    const capitalized = capitalize(string)
    const expected = ``
    expect(capitalized).toBe(expected)
  })

  it(`handles null`, () => {
    const string = null
    const capitalized = capitalize(string)
    expect(capitalized).toBeNull()
  })
})
