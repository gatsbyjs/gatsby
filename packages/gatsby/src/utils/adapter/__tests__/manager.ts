import { store } from "../../../redux"
import {
  getRoutesManifest,
  getFunctionsManifest,
  setWebpackAssets,
} from "../manager"
import { state as stateDefault } from "./fixtures/state"
import { IGatsbyState } from "../../../internal"

jest.mock(`../../../redux`, () => {
  return {
    emitter: {
      on: jest.fn(),
    },
    store: {
      getState: jest.fn(),
    },
  }
})

jest.mock(`../../engines-helpers`, () => {
  return {
    shouldGenerateEngines: jest.fn().mockReturnValue(true),
    shouldBundleDatastore: jest.fn().mockReturnValue(true),
  }
})

function mockStoreState(
  state: IGatsbyState,
  additionalState: Partial<IGatsbyState> = {}
): void {
  const mergedState = { ...state, ...additionalState }
  ;(store.getState as jest.Mock).mockReturnValue(mergedState)
}

const fixturesDir = `${__dirname}/fixtures`

let cwdToRestore
beforeAll(() => {
  cwdToRestore = process.cwd()
})

afterAll(() => {
  process.chdir(cwdToRestore)
})

describe(`getRoutesManifest`, () => {
  it(`should return routes manifest`, () => {
    mockStoreState(stateDefault)
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`]))

    const { routes: routesManifest, headers: headerRoutes } =
      getRoutesManifest()

    expect(routesManifest).toMatchSnapshot()
    expect(headerRoutes).toMatchSnapshot()
  })

  it(`should respect "never" trailingSlash config option`, () => {
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config, trailingSlash: `never` },
    })
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`]))

    const { routes: routesManifest } = getRoutesManifest()

    expect(routesManifest).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: `/` }),
        expect.objectContaining({ path: `/ssr` }),
        expect.objectContaining({ path: `/dsg` }),
        expect.objectContaining({ path: `/api/static` }),
      ])
    )
  })

  it(`should respect "always" trailingSlash config option`, () => {
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config, trailingSlash: `always` },
    })
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`]))

    const { routes: routesManifest } = getRoutesManifest()

    expect(routesManifest).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: `/` }),
        expect.objectContaining({ path: `/ssr/` }),
        expect.objectContaining({ path: `/dsg/` }),
        expect.objectContaining({ path: `/api/static/` }),
      ])
    )
  })

  it(`should not prepend '\\' to external redirects`, () => {
    mockStoreState(stateDefault)
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`]))

    const { routes } = getRoutesManifest()
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: `https://old-url` }),
        expect.objectContaining({ path: `http://old-url` }),
      ])
    )
  })

  it(`should not prepend '\\' to external redirects (path prefix variant)`, () => {
    mockStoreState(stateDefault, {
      program: {
        ...stateDefault.program,
        prefixPaths: true,
      },
      config: {
        ...stateDefault.config,
        pathPrefix: `/prefix`,
      },
    })
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`]))

    const { routes } = getRoutesManifest()
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: `https://old-url` }),
        expect.objectContaining({ path: `http://old-url` }),
      ])
    )
  })

  it(`should return header rules`, () => {
    mockStoreState(stateDefault, {
      config: {
        ...stateDefault.config,
        headers: [
          {
            source: `/ssr/*`,
            headers: [
              {
                key: `x-ssr-header`,
                value: `my custom header value from config`,
              },
            ],
          },
        ],
      },
    })
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`, `static/app-456.js`]))

    const { headers } = getRoutesManifest()

    expect(headers).toContainEqual({
      headers: [
        {
          key: `cache-control`,
          value: `public, max-age=0, must-revalidate`,
        },
        { key: `x-xss-protection`, value: `1; mode=block` },
        { key: `x-content-type-options`, value: `nosniff` },
        { key: `referrer-policy`, value: `same-origin` },
        { key: `x-frame-options`, value: `DENY` },
      ],
      path: `/*`,
    })
    expect(headers).toContainEqual({
      headers: [
        {
          key: `cache-control`,
          value: `public, max-age=31536000, immutable`,
        },
      ],
      path: `/static/*`,
    })
    expect(headers).toContainEqual({
      headers: [
        {
          key: `cache-control`,
          value: `public, max-age=31536000, immutable`,
        },
      ],
      path: `/app-123.js`,
    })
    expect(headers).not.toContainEqual({
      headers: [
        { key: `x-xss-protection`, value: `1; mode=block` },
        { key: `x-content-type-options`, value: `nosniff` },
        { key: `referrer-policy`, value: `same-origin` },
        { key: `x-frame-options`, value: `DENY` },
      ],
      path: `/ssr/*`,
    })

    expect(headers).not.toContain(
      expect.objectContaining({ path: `/static/app-456.js` })
    )
  })

  it(`should return header rules (path prefix variant)`, () => {
    mockStoreState(stateDefault, {
      program: {
        ...stateDefault.program,
        prefixPaths: true,
      },
      config: {
        ...stateDefault.config,
        pathPrefix: `/prefix`,
        headers: [
          {
            source: `/ssr/*`,
            headers: [
              {
                key: `x-ssr-header`,
                value: `my custom header value from config`,
              },
            ],
          },
        ],
      },
    })
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`, `static/app-456.js`]))

    const { headers } = getRoutesManifest()

    expect(headers).toContainEqual({
      headers: [
        {
          key: `cache-control`,
          value: `public, max-age=0, must-revalidate`,
        },
        { key: `x-xss-protection`, value: `1; mode=block` },
        { key: `x-content-type-options`, value: `nosniff` },
        { key: `referrer-policy`, value: `same-origin` },
        { key: `x-frame-options`, value: `DENY` },
      ],
      path: `/prefix/*`,
    })
    expect(headers).toContainEqual({
      headers: [
        {
          key: `cache-control`,
          value: `public, max-age=31536000, immutable`,
        },
      ],
      path: `/prefix/static/*`,
    })
    expect(headers).toContainEqual({
      headers: [
        {
          key: `cache-control`,
          value: `public, max-age=31536000, immutable`,
        },
      ],
      path: `/prefix/app-123.js`,
    })
    expect(headers).not.toContainEqual({
      headers: [
        { key: `x-xss-protection`, value: `1; mode=block` },
        { key: `x-content-type-options`, value: `nosniff` },
        { key: `referrer-policy`, value: `same-origin` },
        { key: `x-frame-options`, value: `DENY` },
      ],
      path: `/prefix/ssr/*`,
    })

    expect(headers).not.toContain(
      expect.objectContaining({ path: `/prefix/static/app-456.js` })
    )
  })

  it(`should respect "force" redirects parameter`, () => {
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config },
    })

    const { routes } = getRoutesManifest()

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: `/old-url2`,
          force: true,
        }),
      ])
    )
  })

  it(`should respect "conditions" redirects parameter`, () => {
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config },
    })
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`]))

    const { routes } = getRoutesManifest()

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: `/old-url2`,
          conditions: { language: [`ca`, `us`] },
        }),
      ])
    )
  })
})

describe(`getFunctionsManifest`, () => {
  it(`should return functions manifest`, () => {
    mockStoreState(stateDefault)
    process.chdir(fixturesDir)

    const functionsManifest = getFunctionsManifest()

    expect(functionsManifest).toMatchInlineSnapshot(`
      Array [
        Object {
          "functionId": "static-index-js",
          "name": "/api/static/index",
          "pathToEntryPoint": ".cache/functions/static/index.js",
          "requiredFiles": Array [
            ".cache/functions/static/index.js",
          ],
        },
        Object {
          "functionId": "ssr-engine",
          "name": "SSR & DSG",
          "pathToEntryPoint": ".cache/page-ssr/lambda.js",
          "requiredFiles": Array [
            "public/404.html",
            "public/500.html",
            ".cache/data/datastore/data.mdb",
            ".cache/page-ssr/lambda.js",
            ".cache/query-engine/index.js",
          ],
        },
      ]
    `)
  })
})
