const parseOptions = require(`../parse-options`)

describe(`parses numeric ranges from the languages markdown code directive`, () => {
  it(`parses numeric ranges from the languages variable`, () => {
    expect(parseOptions(`jsx{1,5,7-8}`).highlightLines).toEqual([1, 5, 7, 8])
    expect(parseOptions(`javascript{7-8}`).highlightLines).toEqual([7, 8])
    expect(parseOptions(`javascript{7..8}`).highlightLines).toEqual([7, 8])
    expect(parseOptions(`javascript{2}`).highlightLines).toEqual([2])
    expect(parseOptions(`javascript{2,4-5}`).highlightLines).toEqual([2, 4, 5])
  })

  it(`ignores negative numbers`, () => {
    expect(parseOptions(`jsx{-1,1,5,7-8}`).highlightLines).toEqual([1, 5, 7, 8])
    expect(parseOptions(`jsx{-1..4}`).highlightLines).toEqual([1, 2, 3, 4])
  })

  describe(`parses line numbering options from the languages markdown code directive`, () => {
    it(`parses the right line number start index from the languages variable`, () => {
      expect(
        parseOptions(`jsx{numberLines: true}`).showLineNumbersLocal
      ).toEqual(true)
      expect(parseOptions(`jsx{numberLines: true}`).numberLinesStartAt).toEqual(
        1
      )
      expect(parseOptions(`jsx{numberLines: 3}`).showLineNumbersLocal).toEqual(
        true
      )
      expect(parseOptions(`jsx{numberLines: 3}`).numberLinesStartAt).toEqual(3)
    })

    it(`parses the right line number start index without a specified language`, () => {
      expect(parseOptions(`{numberLines: true}`).showLineNumbersLocal).toEqual(
        true
      )
      expect(parseOptions(`{numberLines: true}`).numberLinesStartAt).toEqual(1)
      expect(parseOptions(`{numberLines: 3}`).showLineNumbersLocal).toEqual(
        true
      )
      expect(parseOptions(`{numberLines: 3}`).numberLinesStartAt).toEqual(3)
    })

    it(`ignores non-true or non-number values`, () => {
      expect(
        parseOptions(`jsx{numberLines: false}`).showLineNumbersLocal
      ).toEqual(false)
      expect(
        parseOptions(`jsx{numberLines: NaN}`).showLineNumbersLocal
      ).toEqual(false)
    })

    it(`casts decimals line number start into the nearest lower integer`, () => {
      expect(parseOptions(`jsx{numberLines: 1.2}`).numberLinesStartAt).toEqual(
        1
      )
      expect(parseOptions(`jsx{numberLines: 1.8}`).numberLinesStartAt).toEqual(
        1
      )
    })
  })

  describe(`parses both prompt user and host options`, () => {
    it(`parses only promptUser option supplied`, () => {
      expect(parseOptions(`bash{promptUser: pi}`).promptUserLocal).toEqual(`pi`)
    })

    it(`parses only promptHost option supplied`, () => {
      expect(
        parseOptions(`bash{promptHost: dev.localhost}`).promptHostLocal
      ).toEqual(`dev.localhost`)
    })

    it(`parses promptHost and promptUser options supplied together`, () => {
      expect(
        parseOptions(`bash{promptUser: pi}{promptHost: dev.localhost}`)
      ).toMatchObject({
        promptHostLocal: `dev.localhost`,
        promptUserLocal: `pi`,
      })
    })
  })

  describe(`parses both line numbering and line highlighting options`, () => {
    it(`one line highlighted`, () => {
      expect(parseOptions(`jsx{1}{numberLines: 3}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [1],
        showLineNumbersLocal: true,
        numberLinesStartAt: 3,
        outputLines: [],
      })
    })
    it(`multiple lines highlighted`, () => {
      expect(parseOptions(`jsx{1,5,7-8}{numberLines: 3}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [1, 5, 7, 8],
        showLineNumbersLocal: true,
        numberLinesStartAt: 3,
        outputLines: [],
      })
    })
    it(`numberLines: true`, () => {
      expect(parseOptions(`jsx{1,5,7-8}{numberLines: true}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [1, 5, 7, 8],
        showLineNumbersLocal: true,
        numberLinesStartAt: 1,
        outputLines: [],
      })
    })
    it(`reverse ordering`, () => {
      expect(parseOptions(`jsx{numberLines: 4}{2}`)).toEqual({
        splitLanguage: `jsx`,
        highlightLines: [2],
        showLineNumbersLocal: true,
        numberLinesStartAt: 4,
        outputLines: [],
      })
    })
  })

  it(`handles bad inputs`, () => {
    expect(parseOptions(`jsx{-1`).highlightLines).toEqual([])
    expect(parseOptions(`jsx{-1....`).highlightLines).toEqual([])
  })

  it(`parses languages without ranges`, () => {
    expect(parseOptions(`jsx`).splitLanguage).toEqual(`jsx`)
  })
})
