const isDefined = require(`../is-defined`)

describe(`isDefined util`, () => {
  it(`handles null`, () => {
    expect(isDefined(null)).toBeFalsy()
  })

  it(`handles undefined`, () => {
    expect(isDefined(undefined)).toBeFalsy()
  })

  it(`handles everything else`, () => {
    expect(isDefined([])).toBeTruthy()
    expect(isDefined({})).toBeTruthy()
    expect(isDefined(new Date())).toBeTruthy()
    expect(isDefined(0)).toBeTruthy()
    expect(isDefined(``)).toBeTruthy()
    expect(isDefined(false)).toBeTruthy()
  })
})
