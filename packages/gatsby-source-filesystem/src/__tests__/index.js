const path = require(`path`)
const { loadNodeContent } = require(`../`)

describe(`gatsby-source-filesystem`, () => {
  it(`can load the content of a file`, async () => {
    const content = await loadNodeContent({
      absolutePath: path.join(__dirname, `../index.js`),
    })

    expect(content.length).toBeGreaterThan(0)
  })

  it(`rejects if file not found`, async () => {
    let error
    try {
      await loadNodeContent({
        absolutePath: path.join(__dirname, `haha-not-a-real-file.js`),
      })
    } catch (err) {
      error = err
    }
    expect(error).toBeDefined()
  })
})
