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

    const routesManifest = getRoutesManifest()

    expect(routesManifest).toMatchSnapshot()
  })

  it(`should respect "never" trailingSlash config option`, () => {
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config, trailingSlash: `never` },
    })
    process.chdir(fixturesDir)
    setWebpackAssets(new Set([`app-123.js`]))

    const routesManifest = getRoutesManifest()

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

    const routesManifest = getRoutesManifest()

    expect(routesManifest).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: `/` }),
        expect.objectContaining({ path: `/ssr/` }),
        expect.objectContaining({ path: `/dsg/` }),
        expect.objectContaining({ path: `/api/static/` }),
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
