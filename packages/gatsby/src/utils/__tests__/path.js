const os = require(`os`)
const path = require(`path`)

const {
  joinPath,
  normalizePath,
  withBasePath,
  withPathPrefix,
  withAssetPrefix,
} = require(`../path`)
const { clear, getAssets } = require(`../asset-path-registry`)

const join = (...parts) => parts.join(`/`)

describe(`paths`, () => {
  describe(`joinPath`, () => {
    if (os.platform() !== `win32`) {
      it(`joins paths like path.join on Unix-type platforms.`, () => {
        const paths = [`/foo`, `bar`, `baz`]
        const expected = paths.join(`/`)
        const actual = joinPath(...paths)
        expect(actual).toBe(expected)
      })
    }

    if (os.platform() === `win32`) {
      it(`replaces '\\' with '\\\\' on Windows.`, () => {
        const paths = [`foo`, `bar`, `baz`]
        const expected = paths.join(`\\\\`)
        const actual = joinPath(...paths)
        expect(actual).toBe(expected)
      })
    }
  })

  describe(`withBasePath`, () => {
    it(`returns a function.`, () => {
      const withEmptyBasePath = withBasePath(``)
      const expected = `function`
      const actual = typeof withEmptyBasePath
      expect(actual).toBe(expected)
    })

    if (os.platform() !== `win32`) {
      it(`behaves like joinPath() on Unix-type platforms, but prepends a basePath`, () => {
        const basePath = `/foo`
        const subPath = `bar`
        const withFooPath = withBasePath(basePath)
        const expected = `${basePath}/${subPath}`
        const actual = withFooPath(subPath)
        expect(actual).toBe(expected)
      })
    }

    if (os.platform() === `win32`) {
      it(`behaves like joinPath() on Windows, but prepends a basePath`, () => {
        const basePath = `foo`
        const subPath = `bar`
        const withFooPath = withBasePath(basePath)
        const expected = `${basePath}\\\\${subPath}`
        const actual = withFooPath(subPath)
        expect(actual).toBe(expected)
      })
    }
  })
})

describe(`normalizePath`, () => {
  it(`returns single slash if empty array`, () => {
    expect(normalizePath()).toBe(`/`)
  })

  it(`returns single slash if parts are empty`, () => {
    ;[[null], [undefined], [false], []].forEach(args => {
      expect(normalizePath(...args)).toBe(`/`)
    })
  })

  it(`normalizes malformed path part`, () => {
    expect(normalizePath(`///blog/////`)).toBe(`/blog/`)
  })

  it(`normalizes all malformed path parts`, () => {
    expect(normalizePath(`/something/`, `/blog/`)).toBe(`/something/blog/`)
  })

  it(`handle URLs`, () => {
    expect(normalizePath(`https://cdn.gatsbyjs.org////`, `/blog/`)).toBe(
      `https://cdn.gatsbyjs.org/blog/`
    )
  })
})

describe(`withPathPrefix`, () => {
  const prefix = `/blog`
  const boundWithPathPrefix = withPathPrefix(prefix)
  it(`returns a function that binds to pathPrefix`, () => {
    const route = [`page-one`]
    const filePath = boundWithPathPrefix(...route)

    expect(filePath).toBe(path.join(prefix, ...route))
  })

  it(`works with multiple part pieces`, () => {
    const routes = [`page-one`, `sample`, `index.html`]
    const filePath = boundWithPathPrefix(...routes)

    expect(filePath).toBe(path.join(prefix, ...routes))
  })
})

describe(`withAssetPrefix`, () => {
  const prefix = `https://cdn.gatsbyjs.org`
  const boundWithAssetPrefix = withAssetPrefix(prefix)

  beforeEach(clear)

  it(`returns path without prefix if empty string`, () => {
    const route = [`page-one`]

    const filePath = withAssetPrefix(``)(...route)

    expect(filePath).toEqual(join(`/`, ...route))
  })

  it(`returns a function that binds to asset prefix`, () => {
    const route = [`page-one`]
    const filePath = boundWithAssetPrefix(...route)

    expect(filePath).toEqual(join(prefix, ...route))
  })

  it(`works with multiple part pieces`, () => {
    const routes = [`page-one`, `sample`, `index.html`]
    const filePath = boundWithAssetPrefix(...routes)

    expect(filePath).toEqual(join(prefix, ...routes))
  })

  it(`registers with asset prefix API`, async () => {
    const routes = [
      `page-one`,
      `page-two`,
      `page-three`,
      `sample.js`,
      [`some`, `nested`, `route`],
    ]

    const assetPaths = routes.map(route =>
      boundWithAssetPrefix(...[].concat(route))
    )

    const assets = await getAssets(__dirname)
    expect(Array.from(assets)).toEqual(assetPaths)
  })
})
