const fetch = require("node-fetch")

describe(`auth in gatsby-browser`, () => {
  test(`should not be present`, async () => {
    const res = await fetch("http://localhost:8000/commons.js")
    const jsFile = await res.text()

    expect(jsFile.includes("/gatsby-source-wordpress/gatsby-browser.js")).toBe(
      true
    )
    expect(jstFile)
      .test(/auth\\":.*?\\"htaccess\\"/)
      .toBe(false)
    expect(jstFile)
      .test(/\\"username\\": \\"admin\\"/)
      .toBe(false)
    expect(jstFile)
      .test(/\\"password\\": \\"secret\\"/)
      .toBe(false)
  })
})
