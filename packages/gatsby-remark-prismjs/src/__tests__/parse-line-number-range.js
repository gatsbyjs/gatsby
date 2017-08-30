const parseLineNumberRange = require(`../parse-line-number-range`)

describe(`parses numeric ranges from the languages markdown code directive`, () => {
  it(`parses numeric ranges from the languages variable`, () => {
    expect(parseLineNumberRange(`jsx{1,5,7-8}`).highlightLines).toEqual([
      1,
      5,
      7,
      8,
    ])
    expect(parseLineNumberRange(`javascript{7-8}`).highlightLines).toEqual([
      7,
      8,
    ])
    expect(parseLineNumberRange(`javascript{7..8}`).highlightLines).toEqual([
      7,
      8,
    ])
    expect(parseLineNumberRange(`javascript{2}`).highlightLines).toEqual([2])
    expect(parseLineNumberRange(`javascript{2,4-5}`).highlightLines).toEqual([
      2,
      4,
      5,
    ])
  })

  it(`ignores negative numbers`, () => {
    expect(parseLineNumberRange(`jsx{-1,1,5,7-8}`).highlightLines).toEqual([
      1,
      5,
      7,
      8,
    ])
    expect(parseLineNumberRange(`jsx{-1..4}`).highlightLines).toEqual([
      1,
      2,
      3,
      4,
    ])
  })

  it(`handles bad inputs`, () => {
    expect(parseLineNumberRange(`jsx{-1`).highlightLines).toEqual([])
    expect(parseLineNumberRange(`jsx{-1....`).highlightLines).toEqual([])
  })

  it(`parses languages without ranges`, () => {
    expect(parseLineNumberRange(`jsx`).splitLanguage).toEqual(`jsx`)
  })
})
