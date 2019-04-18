jest.mock(`is-online`, () => () => true)
jest.mock(`../fetch`, () =>
  jest.fn(() => {
    return {
      currentSyncData: {
        entries: [],
        assets: [],
        deletedEntries: [],
        deletedAssets: [],
      },
      contentTypeItems: [],
      defaultLocale: `en-US`,
      locales: [],
    }
  })
)

const { sourceNodes } = require(`../gatsby-node`)

const helperFns = {
  actions: {
    setPluginStatus: () => {},
  },
  store: {
    getState: () => {
      return {
        status: {},
      }
    },
  },
  getNodes: () => [],
}

// jest so test output is not filled with contentful plugin logs
global.console = { log: jest.fn(), time: jest.fn(), timeEnd: jest.fn() }

describe(`Calls fetch data`, () => {
  const fetchData = require(`../fetch`)

  beforeEach(() => {
    fetchData.mockClear()
  })

  it(`Calls fetch data with passed options`, async () => {
    const options = {
      spaceId: `spaceId`,
      accessToken: `accessToken`,
      environment: `env`,
      host: `host`,
    }

    await sourceNodes(helperFns, options)

    expect(fetchData).toBeCalledWith(expect.objectContaining(options))
  })

  it(`Calls fetch data with passed options and default fallbacks`, async () => {
    const { defaultOptions } = require(`../plugin-options`)
    const options = {
      spaceId: `spaceId`,
      accessToken: `accessToken`,
    }

    await sourceNodes(helperFns, options)

    expect(fetchData).toBeCalledWith(
      expect.objectContaining({
        ...defaultOptions,
        ...options,
      })
    )
  })
})
