const isDate = require(`../is-date`)

describe(`isDate util`, () => {
  it(`recognizes dates in yyyy format`, () => {
    const possibleDate = `2018`
    expect(isDate(possibleDate)).toBeTruthy()
  })

  it(`recognizes dates in yyyy-MM format`, () => {
    const possibleDate = `2018-01`
    expect(isDate(possibleDate)).toBeTruthy()
  })

  it(`recognizes dates in yyyy-MM-dd format`, () => {
    const possibleDate = `2018-01-01`
    expect(isDate(possibleDate)).toBeTruthy()
  })

  it(`does not recognize yyy as valid date format`, () => {
    // V8 by default recognizes this as a valid Date
    const possibleDate = `404`
    expect(isDate(possibleDate)).toBeFalsy()
  })

  it(`does not recognize random strings with numbers as valid date`, () => {
    // V8 by default recognizes this as a valid Date
    const possibleDate = `Invalid 1`
    expect(isDate(possibleDate)).toBeFalsy()
  })
})
