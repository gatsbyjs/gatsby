/**
 * @jest-environment node
 */

import nock from "nock"

nock.disableNetConnect()

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

const start = jest.fn()
const end = jest.fn()

const mockActivity = {
  start,
  end,
  done: end,
}

const reporter = {
  info: jest.fn(),
  verbose: jest.fn(),
  panic: jest.fn(),
  activityTimer: jest.fn(() => mockActivity),
  createProgress: jest.fn(() => mockActivity),
}

beforeEach(() => {
  global.process.exit.mockClear()
  reporter.panic.mockClear()
  mockClient.getLocales.mockClear()
  formatPluginOptionsForCLI.mockClear()
  contentful.createClient.mockClear()
  nock.cleanAll()
})

afterAll(() => {
  global.process = realProcess
})

it(`calls contentful.createClient with expected params`, async () => {
  const scope = nock(`https://${options.host}`)
    .get(`/spaces/rocybtov1ozk/environments/env/tags`)
    .reply(200, {
      items: [],
    })
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
  expect(scope.isDone()).toBeTruthy()
})

it(`calls contentful.createClient with expected params and default fallbacks`, async () => {
  const scope = nock(`https://cdn.contentful.com`)
    .get(`/spaces/rocybtov1ozk/environments/master/tags`)
    .reply(200, {
      items: [],
    })
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
  expect(scope.isDone()).toBeTruthy()
})

it(`calls contentful.getContentTypes with default page limit`, async () => {
  const scope = nock(`https://cdn.contentful.com`)
    .get(`/spaces/rocybtov1ozk/environments/master/tags`)
    .reply(200, {
      items: [],
    })
  await fetchData({
    pluginConfig: createPluginConfig({
      accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
      spaceId: `rocybtov1ozk`,
    }),
    reporter,
  })

  expect(reporter.panic).not.toBeCalled()
  expect(mockClient.getContentTypes).toHaveBeenCalledWith({
    limit: 1000,
    order: `sys.createdAt`,
    skip: 0,
  })
  expect(scope.isDone()).toBeTruthy()
})

it(`calls contentful.getContentTypes with custom plugin option page limit`, async () => {
  const scope = nock(`https://cdn.contentful.com`)
    .get(`/spaces/rocybtov1ozk/environments/master/tags`)
    .reply(200, {
      items: [],
    })
  await fetchData({
    pluginConfig: createPluginConfig({
      accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
      spaceId: `rocybtov1ozk`,
      pageLimit: 50,
    }),
    reporter,
  })

  expect(reporter.panic).not.toBeCalled()
  expect(mockClient.getContentTypes).toHaveBeenCalledWith({
    limit: 50,
    order: `sys.createdAt`,
    skip: 0,
  })
  expect(scope.isDone()).toBeTruthy()
})

describe(`Displays troubleshooting tips and detailed plugin options on contentful client error`, () => {
  beforeEach(() => {
    nock(`https://${options.host}`)
      .get(`/spaces/rocybtov1ozk/environments/env/tags`)
      .reply(200, {
        items: [],
      })
      .get(`/spaces/rocybtov1ozk/environments/master/tags`)
      .reply(200, {
        items: [],
      })
  })
  it(`Generic fallback error`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      throw new Error(`error`)
    })

    await fetchData({ pluginConfig, reporter })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `Accessing your Contentful space failed`
          ),
        },
      })
    )

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `formatPluginOptionsForCLIMock`
          ),
        },
      })
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
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(`You seem to be offline`),
        },
      })
    )

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `formatPluginOptionsForCLIMock`
          ),
        },
      })
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
      err.responseData = { status: 404 }
      throw err
    })
    const masterOptions = { ...options, environment: `master` }
    const masterConfig = createPluginConfig(masterOptions)

    await fetchData({
      pluginConfig: masterConfig,
      reporter,
    })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `Check if host and spaceId settings are correct`
          ),
        },
      })
    )

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `formatPluginOptionsForCLIMock`
          ),
        },
      })
    )

    expect(formatPluginOptionsForCLI).toBeCalledWith(
      expect.objectContaining({
        ...masterOptions,
      }),
      {
        host: `Check if setting is correct`,
        spaceId: `Check if setting is correct`,
      }
    )
  })

  it(`API 404 response handling with environment set`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      const err = new Error(`error`)
      err.responseData = { status: 404 }
      throw err
    })

    await fetchData({ pluginConfig, reporter })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `Unable to access your space. Check if environment is correct and your accessToken has access to the env and the master environments.`
          ),
        },
      })
    )

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `formatPluginOptionsForCLIMock`
          ),
        },
      })
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

  it(`API authorization error handling`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      const err = new Error(`error`)
      err.responseData = { status: 401 }
      throw err
    })

    await fetchData({ pluginConfig, reporter })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `Check if accessToken and environment are correct`
          ),
        },
      })
    )

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `formatPluginOptionsForCLIMock`
          ),
        },
      })
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
