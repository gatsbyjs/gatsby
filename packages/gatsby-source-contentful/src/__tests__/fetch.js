// disable output coloring for tests
process.env.FORCE_COLOR = 0

const mockClient = {
  getLocales: jest.fn(() =>
    Promise.resolve({
      items: [
        {
          code: `en-us`,
          default: true,
        },
      ],
    })
  ),
  getSpace: jest.fn(() =>
    Promise.resolve({
      space: {
        sys: { type: `Space`, id: `x2t9il8x6p` },
        name: `space-name`,
      },
    })
  ),
  sync: jest.fn(() => {
    return {
      entries: [],
      assets: [],
      deletedEntries: [],
      deletedAssets: [],
    }
  }),
  getContentTypes: jest.fn(async () => {
    return {
      items: [],
      total: 0,
    }
  }),
}

jest.mock(`contentful`, () => {
  return {
    createClient: jest.fn(() => mockClient),
  }
})

jest.mock(`../plugin-options`, () => {
  return {
    ...jest.requireActual(`../plugin-options`),
    formatPluginOptionsForCLI: jest.fn(() => `formatPluginOptionsForCLIMock`),
  }
})

// jest so test output is not filled with contentful plugin logs
global.console = { log: jest.fn(), time: jest.fn(), timeEnd: jest.fn() }

const contentful = require(`contentful`)
const fetchData = require(`../fetch`)
const {
  formatPluginOptionsForCLI,
  createPluginConfig,
} = require(`../plugin-options`)

const proxyOption = {
  host: `localhost`,
  port: 9001,
}
const options = {
  spaceId: `rocybtov1ozk`,
  accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
  host: `host`,
  environment: `env`,
  proxy: proxyOption,
}

const pluginConfig = createPluginConfig(options)

let realProcess
beforeAll(() => {
  realProcess = global.process

  global.process = {
    ...realProcess,
    exit: jest.fn(),
  }
})

const reporter = {
  panic: jest.fn(),
}

beforeEach(() => {
  global.process.exit.mockClear()
  reporter.panic.mockClear()
  mockClient.getLocales.mockClear()
  formatPluginOptionsForCLI.mockClear()
  contentful.createClient.mockClear()
})

afterAll(() => {
  global.process = realProcess
})

it(`calls contentful.createClient with expected params`, async () => {
  await fetchData({ pluginConfig, reporter })
  expect(reporter.panic).not.toBeCalled()
  expect(contentful.createClient).toBeCalledWith(
    expect.objectContaining({
      accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
      environment: `env`,
      host: `host`,
      space: `rocybtov1ozk`,
      proxy: proxyOption,
    })
  )
})

it(`calls contentful.createClient with expected params and default fallbacks`, async () => {
  await fetchData({
    pluginConfig: createPluginConfig({
      accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
      spaceId: `rocybtov1ozk`,
    }),
    reporter,
  })
  expect(reporter.panic).not.toBeCalled()
  expect(contentful.createClient).toBeCalledWith(
    expect.objectContaining({
      accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
      environment: `master`,
      host: `cdn.contentful.com`,
      space: `rocybtov1ozk`,
    })
  )
})

describe(`Displays troubleshooting tips and detailed plugin options on contentful client error`, () => {
  it(`Generic fallback error`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      throw new Error(`error`)
    })

    await fetchData({ pluginConfig, reporter })

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`Accessing your Contentful space failed`)
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`formatPluginOptionsForCLIMock`)
    )

    expect(formatPluginOptionsForCLI).toBeCalledWith(
      expect.objectContaining({
        ...options,
      }),
      undefined
    )
  })

  it(`Connection error`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      const err = new Error(`error`)
      err.code = `ENOTFOUND`
      throw err
    })

    await fetchData({ pluginConfig, reporter })

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`You seem to be offline`)
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`formatPluginOptionsForCLIMock`)
    )

    expect(formatPluginOptionsForCLI).toBeCalledWith(
      expect.objectContaining({
        ...options,
      }),
      undefined
    )
  })

  it(`API 404 response handling`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      const err = new Error(`error`)
      err.response = { status: 404 }
      throw err
    })

    await fetchData({ pluginConfig, reporter })

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`Check if host and spaceId settings are correct`)
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`formatPluginOptionsForCLIMock`)
    )

    expect(formatPluginOptionsForCLI).toBeCalledWith(
      expect.objectContaining({
        ...options,
      }),
      {
        host: `Check if setting is correct`,
        spaceId: `Check if setting is correct`,
      }
    )
  })

  it(`API authorization error handling`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      const err = new Error(`error`)
      err.response = { status: 401 }
      throw err
    })

    await fetchData({ pluginConfig, reporter })

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(
        `Check if accessToken and environment are correct`
      )
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`formatPluginOptionsForCLIMock`)
    )

    expect(formatPluginOptionsForCLI).toBeCalledWith(
      expect.objectContaining({
        ...options,
      }),
      {
        accessToken: `Check if setting is correct`,
        environment: `Check if setting is correct`,
      }
    )
  })
})
