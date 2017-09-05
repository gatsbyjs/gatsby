const normalize = require(`../normalize`)

describe(`getValidKey`, () => {
  it(`It passes a key through untouched that passes`, () => {
    expect(
      normalize.getValidKey({
        key: `hi`,
      })
    ).toBe(`hi`)
  })
  it(`It prefixes keys that start with numbers`, () => {
    expect(
      normalize.getValidKey({
        key: `0hi`,
      })
    ).toBe(`wordpress_0hi`)
  })
  it(`It prefixes keys that conflict with default Gatsby fields`, () => {
    expect(
      normalize.getValidKey({
        key: `children`,
      })
    ).toBe(`wordpress_children`)
  })
  it(`It replaces invalid characters`, () => {
    expect(
      normalize.getValidKey({
        key: `h:i`,
      })
    ).toBe(`h_i`)
  })
})
