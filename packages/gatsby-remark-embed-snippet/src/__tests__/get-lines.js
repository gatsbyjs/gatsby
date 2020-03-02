const getLines = require(`../utils/get-lines`)

describe(`gatsby-remark-embed-snippet`, () => {
  it(`should not support line syntax that isn't one line or a line range`, () => {
    expect(() => getLines(`snippet-path.js`, ``, [10, 11, 12])).toThrow(
      `Invalid snippet line numbers specified in snippet-path.js; Syntax is #Lx or #Lx-Ly`
    )
  })

  it(`should throw an error if any specified lines do not exist in the code snippet`, () => {
    const code = `<html>
  <p>Test</p>
</html>`

    expect(() => getLines(`snippet-path.js`, code, [5])).toThrow(
      `Invalid snippet line numbers specified in snippet-path.js; Lines do not exist`
    )
  })

  it(`should return one line of code if #Lx is requested`, () => {
    const paragraphLine = `  <p>Test</p>`
    const code = `<html>
${paragraphLine}
</html>`

    const snippet = getLines(``, code, [2])

    expect(snippet).toEqual(paragraphLine)
  })

  it(`should return a line range if #Lx-Ly is requested`, () => {
    const range = `<blockquote>
  Gatsby is remarkable!
</blockquote>`
    const code = `<html>
${range}
</html>`

    const snippet = getLines(``, code, [2, 4])

    expect(snippet).toEqual(range)
  })
})
