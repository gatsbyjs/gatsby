import { store } from "../../../redux"
import {
  getRoutesManifest,
  getFunctionsManifest,
  setWebpackAssets,
  initAdapterManager,
} from "../manager"
import { state as stateDefault } from "./fixtures/state"
import { IGatsbyState } from "../../../internal"
import { IAdapterManager, IAdapter } from "../types"
import { getAdapterInit } from "../init"

jest.mock(`../../../redux`, () => {
  return {
    emitter: {
      on: jest.fn(),
    },
    store: {
      getState: jest.fn(),
      dispatch: jest.fn(),
    },
  }
})

jest.mock(`../../engines-helpers`, () => {
  return {
    shouldGenerateEngines: jest.fn().mockReturnValue(true),
    shouldBundleDatastore: jest.fn().mockReturnValue(true),
  }
})

jest.mock(`../init`)

const createAdapterMock = (): IAdapter => {
  return {
    name: `gatsby-adapter-mock`,
    adapt: jest.fn(),
    config: jest.fn().mockReturnValue({}),
  }
}

const mockNoOpAdapterManager: IAdapterManager = {
  adapt: jest.fn(),
  restoreCache: jest.fn(),
  storeCache: jest.fn(),
  config: jest.fn().mockResolvedValue({
    excludeDatastoreFromEngineFunction: false,
    pluginsToDisable: [],
  }),
}

jest.mock(`../no-op-manager`, () => {
  return {
    noOpAdapterManager: jest
      .fn()
      .mockImplementation(() => mockNoOpAdapterManager),
  }
})

function mockStoreState(
  state: IGatsbyState,
  additionalState: Partial<IGatsbyState> = {}
): void {
  const mergedState = { ...state, ...additionalState }
  ;(store.getState as jest.Mock).mockReturnValue(mergedState)
}

function mockGetAdapterInit(adapter: IAdapter | undefined): void {
  const mocked = getAdapterInit as jest.MockedFunction<typeof getAdapterInit>
  mocked.mockClear()
  mocked.mockResolvedValue(adapter ? (): IAdapter => adapter : undefined)
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

describe(`initAdapterManager`, () => {
  beforeEach(() => {
    ;(mockNoOpAdapterManager.config as jest.Mock).mockClear()
  })

  it(`should use noop manager when adapter config is false`, async () => {
    const initAdapter = createAdapterMock()
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config, adapter: false },
    })
    mockGetAdapterInit(initAdapter)
    const mgr = await initAdapterManager()

    expect(mgr).not.toBeNull()
    expect(mockNoOpAdapterManager.config).toHaveBeenCalledTimes(1)
    expect(initAdapter.config).not.toHaveBeenCalled()
  })

  it(`should use noop manager when adapter config is undefined and no adapter resolved`, async () => {
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config, adapter: undefined },
    })
    mockGetAdapterInit(undefined)
    const mgr = await initAdapterManager()

    expect(mgr).not.toBeNull()
    expect(mockNoOpAdapterManager.config).toHaveBeenCalledTimes(1)
  })

  it(`should use configured adapter`, async () => {
    const configuredAdapter = createAdapterMock()
    const initAdapter = createAdapterMock()
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config, adapter: configuredAdapter },
    })
    mockGetAdapterInit(initAdapter)
    const mgr = await initAdapterManager()

    expect(mgr).not.toBeNull()
    expect(mockNoOpAdapterManager.config).not.toHaveBeenCalled()
    expect(initAdapter.config).not.toHaveBeenCalled()
    expect(configuredAdapter.config).toHaveBeenCalledTimes(1)
  })

  it(`should use resolved adapter when adapter config is undefined`, async () => {
    const initAdapter = createAdapterMock()
    mockStoreState(stateDefault, {
      config: { ...stateDefault.config, adapter: undefined },
    })
    mockGetAdapterInit(initAdapter)
    const mgr = await initAdapterManager()

    expect(mgr).not.toBeNull()
    expect(mockNoOpAdapterManager.config).not.toHaveBeenCalled()
    expect(initAdapter.config).toBeCalled()
  })
})
