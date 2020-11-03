const addLineNumbers = require(`../add-line-numbers`)
const cheerio = require(`cheerio`)

describe(`returns the line numbers container`, () => {
  it(`should return the <span> container with the right classes`, () => {
    expect(addLineNumbers(``)).toEqual(
      `<span aria-hidden="true" class="line-numbers-rows" style="white-space: normal; width: auto; left: 0;">` +
        `</span>`
    )
  })
  it(`should return return as many <span></span> children as there are code lines`, () => {
    const basicCodeLines = `line1\nline2\nline3`

    const basicCodeLinesWithLineNumbers = addLineNumbers(basicCodeLines)

    const $ = cheerio.load(basicCodeLinesWithLineNumbers)
    const numberOfLineNumbers = $(`.line-numbers-rows > span`).length

    expect(numberOfLineNumbers).toEqual(3)
  })
  it(`should return as many <span></span> children as there are code lines and highlight classes`, () => {
    // Expect 6 internal spans
    const highlightedCode =
      `line1\n` +
      `<span class=\\"gatsby-highlight-code-line\\"></span>` +
      `line2\n` +
      ` <span class=\\"gatsby-highlight-code-line\\"></span>` +
      ` line3\n` +
      `line4`

    const highlightedCodeWithLineNumbers = addLineNumbers(highlightedCode)

    const $ = cheerio.load(highlightedCodeWithLineNumbers)
    const numberOfLineNumbers = $(`.line-numbers-rows > span`).length

    expect(numberOfLineNumbers).toEqual(4 + 2)
  })
})
