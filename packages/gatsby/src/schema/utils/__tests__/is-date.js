const isDate = require(`../is-date`)

describe(`isDate util`, () => {
  it(`recognizes dates in YYYY format`, () => {
    const possibleDate = `2018`
    expect(isDate(possibleDate)).toBeTruthy()
  })

  it(`recognizes dates in YYYY-MM format`, () => {
    const possibleDate = `2018-01`
    expect(isDate(possibleDate)).toBeTruthy()
  })

  it(`recognizes dates in YYYY-MM-DD format`, () => {
    const possibleDate = `2018-01-01`
    expect(isDate(possibleDate)).toBeTruthy()
  })

  it(`does not recognize YYY as valid date format`, () => {
    const possibleDate = `404`
    expect(isDate(possibleDate)).toBeFalsy()
  })
})
