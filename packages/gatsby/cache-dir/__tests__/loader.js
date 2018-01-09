import loader from "../loader.js"

describe(`Loader`, () => {
  beforeEach(() => {
    delete global.__PATH_PREFIX__
    delete global.__PREFIX_PATHS__

    // Workaround for Node 6 issue: https://github.com/facebook/jest/issues/5159
    if (global.hasOwnProperty(`__PATH_PREFIX__`)) global.__PATH_PREFIX__ = undefined
    if (global.hasOwnProperty(`__PREFIX_PATHS__`)) global.__PREFIX_PATHS__ = undefined

    loader.empty()
    loader.addPagesArray([
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
    ])
  })

  test(`You can enqueue paths`, () => {
    loader.enqueue(`/about/`)
    expect(loader.has(`/about/`)).toEqual(true)
    expect(loader.has(`/about/me/`)).toEqual(false)
  })

  test(`FIFO by default`, () => {
    loader.enqueue(`/about/me/`)
    loader.enqueue(`/about/`)
    expect(loader.peek()).toEqual(`/about/me/`)
  })

  test(`Paths enqueued more times are prioritized`, () => {
    loader.enqueue(`/about/me/`)
    loader.enqueue(`/about/`)
    loader.enqueue(`/about/`)
    expect(loader.peek()).toEqual(`/about/`)
  })

  test(`Paths are only added once to the queue`, () => {
    loader.enqueue(`/about/me/`)
    loader.enqueue(`/about/`)
    loader.enqueue(`/about/`)
    loader.enqueue(`/about/me/`)
    loader.enqueue(`/about/`)
    loader.enqueue(`/about/me/`)
    expect(loader.length()).toEqual(2)
  })

  test(`You can't enqueue paths that don't exist`, () => {
    expect(loader.enqueue(`/about/me/2`)).toEqual(false)
  })

  test(`You can dequeue a path`, () => {
    loader.enqueue(`/about/me/`)
    expect(loader.dequeue()).toEqual(`/about/me/`)
  })

  test(`You can get the order of a path`, () => {
    loader.enqueue(`/about/me/`)
    loader.enqueue(`/about/`)
    expect(loader.indexOf(`/about/`)).toEqual(1)
  })

  test(`Resources are ordered correctly by count`, () => {
    loader.enqueue(`/about/me/`)
    loader.enqueue(`/about/`)
    loader.enqueue(`/about/me/`)
    expect(loader.getResources()).toMatchSnapshot()
  })
})

describe(`Loader path prefixing`, () => {
  let pagesArray

  beforeEach(() => {
    delete global.__PATH_PREFIX__
    delete global.__PREFIX_PATHS__

    // Workaround for Node 6 issue: https://github.com/facebook/jest/issues/5159
    if (global.hasOwnProperty(`__PATH_PREFIX__`)) global.__PATH_PREFIX__ = undefined
    if (global.hasOwnProperty(`__PREFIX_PATHS__`)) global.__PREFIX_PATHS__ = undefined

    pagesArray = [
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
    ]

    loader.empty()
  })

  test(`Path prefix present and enabled`, () => {
    global.__PATH_PREFIX__ = `/foo`
    global.__PREFIX_PATHS__ = true
    loader.addPagesArray(pagesArray)
    loader.enqueue(`/foo/about/`)
    expect(loader.has(`/about/`)).toEqual(true)
    expect(loader.has(`/foo/about/`)).toEqual(false)
  })

  test(`Path prefix present but not enabled`, () => {
    global.__PATH_PREFIX__ = `/foo`
    delete global.__PREFIX_PATHS__
    loader.addPagesArray(pagesArray)

    // don't enqueue prefixed paths
    loader.enqueue(`/foo/about/`)
    expect(loader.has(`/about/`)).toEqual(false)
    expect(loader.has(`/foo/about/`)).toEqual(false)

    // do enqueue unprefixed paths
    loader.enqueue(`/about/`)
    expect(loader.has(`/about/`)).toEqual(true)
    expect(loader.has(`/foo/about/`)).toEqual(false)
  })

  test(`Path prefix missing but enabled`, () => {
    delete global.__PATH_PREFIX__
    global.__PREFIX_PATHS__ = true
    loader.addPagesArray(pagesArray)

    // don't enqueue prefixed paths
    loader.enqueue(`/foo/about/`)
    expect(loader.has(`/about/`)).toEqual(false)
    expect(loader.has(`/foo/about/`)).toEqual(false)

    // do enqueue unprefixed paths
    loader.enqueue(`/about/`)
    expect(loader.has(`/about/`)).toEqual(true)
    expect(loader.has(`/foo/about/`)).toEqual(false)
  })
})
