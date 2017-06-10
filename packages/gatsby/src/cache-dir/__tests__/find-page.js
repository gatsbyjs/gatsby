const pageFinderFactory = require(`../find-page`)

let findPage

describe(`find-page`, () => {
  beforeEach(() => {
    const newPages = [
      {
        path: `/about/`,
        componentChunkName: `page-component---src-pages-test-js`,
        jsonName: `about.json`,
      },
      {
        path: `/about/me/`,
        componentChunkName: `page-component---src-pages-test-js`,
        jsonName: `about-me.json`,
      },
      {
        path: `/app/`,
        matchPath: `/app/*`,
        componentChunkName: `page-component---src-pages-app-js`,
        jsonName: `app.json`,
      },
    ]
    findPage = pageFinderFactory(newPages)
  })

  it(`can find a page`, () => {
    expect(findPage(`/about/`).path).toBe(`/about/`)
    expect(findPage(`/about/me/`).path).toBe(`/about/me/`)
  })

  it(`can find a client only path`, () => {
    expect(findPage(`/about/super-duper/`)).toBeUndefined()
    expect(findPage(`/app/client/only/path`).path).toBe(`/app/`)
  })

  it(`handles finding prefixed links`, () => {
    const newPages = [
      {
        path: `/about/`,
        componentChunkName: `page-component---src-pages-test-js`,
        jsonName: `about.json`,
      },
    ]
    const findPage2 = pageFinderFactory(newPages, `/my-test-prefix`)
    expect(findPage2(`/my-test-prefix/about/`).path).toBe(`/about/`)
  })
})
