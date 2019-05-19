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

  describe(`parses line numbering options from the languages markdown code directive`, () => {
    it(`parses the right line number start index from the languages variable`, () => {
      expect(
        parseLineNumberRange(`jsx{numberLines: true}`).showLineNumbersLocal
      ).toEqual(true)
      expect(
        parseLineNumberRange(`jsx{numberLines: true}`).numberLinesStartAt
      ).toEqual(1)
      expect(
        parseLineNumberRange(`jsx{numberLines: 3}`).showLineNumbersLocal
      ).toEqual(true)
      expect(
        parseLineNumberRange(`jsx{numberLines: 3}`).numberLinesStartAt
      ).toEqual(3)
    })

    it(`parses the right line number start index without a specified language`, () => {
      expect(
        parseLineNumberRange(`{numberLines: true}`).showLineNumbersLocal
      ).toEqual(true)
      expect(
        parseLineNumberRange(`{numberLines: true}`).numberLinesStartAt
      ).toEqual(1)
      expect(
        parseLineNumberRange(`{numberLines: 3}`).showLineNumbersLocal
      ).toEqual(true)
      expect(
        parseLineNumberRange(`{numberLines: 3}`).numberLinesStartAt
      ).toEqual(3)
    })

    it(`ignores non-true or non-number values`, () => {
      expect(
        parseLineNumberRange(`jsx{numberLines: false}`).showLineNumbersLocal
      ).toEqual(false)
      expect(
        parseLineNumberRange(`jsx{numberLines: NaN}`).showLineNumbersLocal
      ).toEqual(false)
    })

    it(`casts decimals line number start into the nearest lower integer`, () => {
      expect(
        parseLineNumberRange(`jsx{numberLines: 1.2}`).numberLinesStartAt
      ).toEqual(1)
      expect(
        parseLineNumberRange(`jsx{numberLines: 1.8}`).numberLinesStartAt
      ).toEqual(1)
    })
  })

  describe(`parses both line numbering and line highlighting options`, () => {
    it(`one line highlighted`, () => {
      expect(parseLineNumberRange(`jsx{1}{numberLines: 3}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [1],
        showLineNumbersLocal: true,
        numberLinesStartAt: 3,
      })
    })
    it(`multiple lines highlighted`, () => {
      expect(parseLineNumberRange(`jsx{1,5,7-8}{numberLines: 3}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [1, 5, 7, 8],
        showLineNumbersLocal: true,
        numberLinesStartAt: 3,
      })
    })
    it(`numberLines: true`, () => {
      expect(parseLineNumberRange(`jsx{1,5,7-8}{numberLines: true}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [1, 5, 7, 8],
        showLineNumbersLocal: true,
        numberLinesStartAt: 1,
      })
    })
    it(`reverse ordering`, () => {
      expect(parseLineNumberRange(`jsx{numberLines: 4}{2}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [2],
        showLineNumbersLocal: true,
        numberLinesStartAt: 4,
      })
    })
  })

  it(`handles bad inputs`, () => {
    expect(parseLineNumberRange(`jsx{-1`).highlightLines).toEqual([])
    expect(parseLineNumberRange(`jsx{-1....`).highlightLines).toEqual([])
  })

  it(`parses languages without ranges`, () => {
    expect(parseLineNumberRange(`jsx`).splitLanguage).toEqual(`jsx`)
  })
})
