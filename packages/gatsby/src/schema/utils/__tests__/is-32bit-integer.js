const is32bitInteger = require(`../is-32bit-integer`)

describe(`is32bitInteger util`, () => {
  it(`works`, () => {
    expect(is32bitInteger(-1)).toBeTruthy()
  })

  it(`works`, () => {
    expect(is32bitInteger(0.01)).toBeFalsy()
  })

  it(`works`, () => {
    expect(is32bitInteger(1 / 1e6)).toBeFalsy()
  })

  it(`works`, () => {
    expect(is32bitInteger(2147483647)).toBeTruthy()
  })

  it(`works`, () => {
    expect(is32bitInteger(2147483648)).toBeFalsy()
  })

  it(`works`, () => {
    expect(is32bitInteger(-2147483648)).toBeTruthy()
  })

  it(`works`, () => {
    expect(is32bitInteger(-2147483649)).toBeFalsy()
  })
})
