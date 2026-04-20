// @ts-check
import { createClient } from "contentful"
import { fetchContent, fetchContentTypes } from "../fetch"
import {
  formatPluginOptionsForCLI,
  createPluginConfig,
} from "../plugin-options"

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
  getTags: jest.fn(async () => {
    return {
      items: [],
      total: 0,
    }
  }),
}

jest.mock(`contentful`, () => {
  return {
    createClient: jest.fn(() => {
      return { ...mockClient, withoutLinkResolution: mockClient }
    }),
  }
})

jest.mock(`../plugin-options`, () => {
  return {
    ...jest.requireActual(`../plugin-options`),
    formatPluginOptionsForCLI: jest.fn(() => `formatPluginOptionsForCLIMock`),
  }
})

// jest so test output is not filled with contentful plugin logs
// @ts-ignore
global.console = { log: jest.fn(), time: jest.fn(), timeEnd: jest.fn() }

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
    // @ts-ignore
    exit: jest.fn(),
  }
})

const start = jest.fn()
const tick = jest.fn()
const end = jest.fn()

const mockActivity = {
  start,
  end,
  tick,
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
  // @ts-ignore
  global.process.exit.mockClear()
  reporter.panic.mockClear()
  mockClient.getLocales.mockClear()
  // @ts-ignore
  formatPluginOptionsForCLI.mockClear()
  // @ts-ignore
  createClient.mockClear()
})

afterAll(() => {
  global.process = realProcess
})

it(`calls contentful.createClient with expected params`, async () => {
  await fetchContent({ pluginConfig, reporter, syncToken: null })
  expect(reporter.panic).not.toBeCalled()
  expect(createClient).toBeCalledWith(
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
  await fetchContent({
    pluginConfig: createPluginConfig({
      accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
      spaceId: `rocybtov1ozk`,
    }),
    reporter,
    syncToken: null,
  })

  expect(reporter.panic).not.toBeCalled()
  expect(createClient).toBeCalledWith(
    expect.objectContaining({
      accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
      environment: `master`,
      host: `cdn.contentful.com`,
      space: `rocybtov1ozk`,
    })
  )
})

it(`calls contentful.getContentTypes with default page limit`, async () => {
  await fetchContentTypes({
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
})

it(`calls contentful.getContentTypes with custom plugin option page limit`, async () => {
  await fetchContentTypes({
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
})

describe(`Tags feature`, () => {
  it(`tags are disabled by default`, async () => {
    await fetchContent({
      pluginConfig: createPluginConfig({
        accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
        spaceId: `rocybtov1ozk`,
        pageLimit: 50,
      }),
      reporter,
      syncToken: null,
    })

    expect(reporter.panic).not.toBeCalled()
    expect(mockClient.getTags).not.toBeCalled()
  })
  it(`calls contentful.getTags when enabled`, async () => {
    await fetchContent({
      pluginConfig: createPluginConfig({
        accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
        spaceId: `rocybtov1ozk`,
        pageLimit: 50,
        enableTags: true,
      }),
      reporter,
      syncToken: null,
    })

    expect(reporter.panic).not.toBeCalled()
    expect(mockClient.getTags).toHaveBeenCalledWith({
      limit: 50,
      order: `sys.createdAt`,
      skip: 0,
    })
  })
})

describe(`Displays troubleshooting tips and detailed plugin options on contentful client error`, () => {
  it(`Generic fallback error`, async () => {
    mockClient.getLocales.mockImplementation(() => {
      throw new Error(`error`)
    })

    await fetchContent({ pluginConfig, reporter, syncToken: null })

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
      // @ts-ignore
      err.code = `ENOTFOUND`
      throw err
    })

    await fetchContent({ pluginConfig, reporter, syncToken: null })

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
      // @ts-ignore
      err.responseData = { status: 404 }
      throw err
    })
    const masterOptions = { ...options, environment: `master` }
    const masterConfig = createPluginConfig(masterOptions)

    await fetchContent({
      pluginConfig: masterConfig,
      reporter,
      syncToken: null,
    })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(`Endpoint not found`),
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
      // @ts-ignore
      err.responseData = { status: 404 }
      throw err
    })

    await fetchContent({ pluginConfig, reporter, syncToken: null })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(
            `Unable to access your space.`
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
      // @ts-ignore
      err.responseData = { status: 401 }
      throw err
    })

    await fetchContent({ pluginConfig, reporter, syncToken: null })

    expect(reporter.panic).toBeCalledWith(
      expect.objectContaining({
        context: {
          sourceMessage: expect.stringContaining(`Authorization error.`),
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

  it(`Properly queries CTF sync API for initial and subsequent data syncs`, async () => {
    await fetchContent({ pluginConfig, reporter, syncToken: null })

    expect(mockClient.sync).toHaveBeenCalledWith({
      initial: true,
      limit: 1000,
    })
    mockClient.sync.mockClear()

    await fetchContent({ pluginConfig, reporter, syncToken: `mocked` })

    expect(mockClient.sync).toHaveBeenCalledWith({
      nextSyncToken: `mocked`,
    })
  })
})
