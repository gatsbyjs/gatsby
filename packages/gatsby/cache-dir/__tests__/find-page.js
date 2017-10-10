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
        path: `/about/the best/`,
        componentChunkName: `page-component---src-pages-test-js`,
        jsonName: `the-best.json`,
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

  it(`can find a page with space in its path`, () => {
    expect(findPage(`/about/the best/`).path).toBe(`/about/the best/`)
    expect(findPage(`/about/the%20best/`).path).toBe(`/about/the best/`)
  })

  it(`can find a client only path`, () => {
    expect(findPage(`/about/super-duper/`)).toBeUndefined()
    expect(findPage(`/app/client/only/path`).path).toBe(`/app/`)
  })

  it(`can find links with hashes`, () => {
    expect(findPage(`/about/me/#hashtagawesome`).path).toBe(`/about/me/`)
  })

  it(`can find links with search query`, () => {
    expect(findPage(`/about/me/?query=awesome`).path).toBe(`/about/me/`)
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
