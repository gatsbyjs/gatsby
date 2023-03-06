import { isHttpUrl } from "../is-http-url"

describe(`isHttpUrl`, () => {
  it(`return true when valid`, () => {
    const validUrls = [
      `https://www.gatsbyjs.com/`,
      `https://www.gatsbyjs.com`,
      `https://www.gatsbyjs.com/foo/bar/test.html`,
      `https://www.gatsbyjs.com/?foo=bar`,
      `https://www.gatsbyjs.com:8080/test.html`,
      `http://www.gatsbyjs.com/`,
      `http://www.gatsbyjs.com`,
      `https:www.gatsbyjs.com`,
      `http:www.gatsbyjs.com`,
      `http://www.gatsbyjs.com/foo/bar/test.html`,
      `http://www.gatsbyjs.com/?foo=bar`,
      `http://www.gatsbyjs.com:8080/test.html`,
      `http://example.gatsbyjs.org/path%20with%20spaces.html`,
      `http://192.168.0.1/`,
    ]

    validUrls.map(url => {
      expect(isHttpUrl(url)).toBe(true)
    })
  })

  it.only(`return false when invalid`, () => {
    const invalidUrls = [``, `gatsbyjs`, `ftp://ftp.gatsbyjs.com`]

    invalidUrls.map(url => {
      expect(isHttpUrl(url)).toBe(false)
    })
  })
})
