const isObject = require(`../is-object`)

describe(`isObject util`, () => {
  it(`correctly identifies object`, () => {
    const possibleObject = {}
    expect(isObject(possibleObject)).toBeTruthy()
  })

  it(`does not identify arrays as objects`, () => {
    const possibleObject = []
    expect(isObject(possibleObject)).toBeFalsy()
  })

  it(`does not identify dates as objects`, () => {
    const possibleObject = new Date()
    expect(isObject(possibleObject)).toBeFalsy()
  })

  it(`does not identify strings as objects`, () => {
    const possibleObject = new String()
    expect(isObject(possibleObject)).toBeFalsy()
  })

  it(`does not identify null as object`, () => {
    const possibleObject = null
    expect(isObject(possibleObject)).toBeFalsy()
  })
})
