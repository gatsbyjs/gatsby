const initialSync = require(`../__fixtures__/starter-blog-data`).initialSync
const DEFAULT_LOCALES = initialSync.locales
const DEFAULT_SPACE = initialSync.space

const DEFAULT_CONTENTYPES = initialSync.contentTypeItems

const currentSyncData = initialSync.currentSyncData

const mockClient = {
  getLocales: jest.fn(() =>
    Promise.resolve({
      items: DEFAULT_LOCALES,
    })
  ),
  getSpace: jest.fn(() =>
    Promise.resolve({
      space: DEFAULT_SPACE,
    })
  ),
  sync: jest.fn(),
  getContentTypes: jest.fn(async () => {
    return {
      items: DEFAULT_CONTENTYPES,
      total: DEFAULT_CONTENTYPES.length,
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
jest.mock(`chalk`, () => {
  return {
    yellow: str => str,
  }
})

jest.mock(`../normalize`)

const contentful = require(`contentful`)
const normalize = require(`../normalize`)
const {
  checkAccessToContentfulSpace,
  getContentTypes,
  getLocales,
  getSpace,
  getSyncData,
} = require(`../fetch`)
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
describe(`fetch`, () => {
  beforeAll(() => {
    realProcess = global.process

    global.process = {
      ...realProcess,
      exit: jest.fn(),
    }
  })

  const reporter = {
    info: jest.fn(),
    panic: jest.fn(),
  }

  beforeEach(() => {
    global.process.exit.mockClear()
    reporter.panic.mockClear()
    mockClient.getLocales.mockClear()
    formatPluginOptionsForCLI.mockClear()
    contentful.createClient.mockClear()
    mockClient.sync.mockClear()

    currentSyncData.forEach(data => {
      mockClient.sync.mockImplementationOnce(() => data)
    })
  })

  afterAll(() => {
    global.process = realProcess
  })

  describe(`getContentTypes`, () => {
    it(`works with default page limit`, async () => {
      const contentTypes = await getContentTypes(
        createPluginConfig({
          accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
          spaceId: `rocybtov1ozk`,
        })
      )

      expect(mockClient.getContentTypes).toHaveBeenCalledWith({
        limit: 100,
        order: `sys.createdAt`,
        skip: 0,
      })
      expect(normalize.fixIds).toHaveBeenCalledTimes(2)
      expect(contentTypes.length).toBe(2)
      expect(contentTypes).toContainEqual(
        expect.objectContaining({
          sys: expect.objectContaining({
            id: `blogPost`,
          }),
          name: `Blog Post`,
        })
      )
    })

    it(`works with custom plugin option page limit`, async () => {
      await getContentTypes(
        createPluginConfig({
          accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
          spaceId: `rocybtov1ozk`,
          pageLimit: 50,
        })
      )

      expect(mockClient.getContentTypes).toHaveBeenCalledWith({
        limit: 50,
        order: `sys.createdAt`,
        skip: 0,
      })
    })
  })

  describe(`getLocales`, () => {
    it(`should get locales from Contentful `, async () => {
      const locales = await getLocales(
        createPluginConfig({
          accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
          spaceId: `rocybtov1ozk`,
        })
      )

      expect(locales).toEqual({
        defaultLocale: `en-US`,
        locales: DEFAULT_LOCALES,
      })
    })

    it(`should throw an error when localeFilter reduces locale list to 0`, async () => {
      expect.assertions(1)

      try {
        await getLocales(
          createPluginConfig({
            accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
            spaceId: `rocybtov1ozk`,
            pageLimit: 50,
            localeFilter: () => false,
          })
        )
      } catch (err) {
        expect(err.message).toEqual(
          `Please check if your localeFilter is configured properly. Locales 'en-US, nl were found but were filtered down to none.`
        )
      }
    })
  })

  describe(`getSpace`, () => {
    it(`should get space from Contentful `, async () => {
      const space = await getSpace(
        createPluginConfig({
          accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
          spaceId: `rocybtov1ozk`,
        })
      )

      expect(space).toEqual({
        space: DEFAULT_SPACE,
      })
    })
  })

  describe(`getSyncData`, () => {
    it(`should fetch data`, async () => {
      const syncDataGenerator = getSyncData(
        null,
        createPluginConfig({
          accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
          spaceId: `rocybtov1ozk`,
        })
      )

      expect((await syncDataGenerator.next()).value).toEqual(currentSyncData[0])
      expect((await syncDataGenerator.next()).value).toEqual(currentSyncData[1])
      expect((await syncDataGenerator.next()).value).toEqual(currentSyncData[2])
      expect(mockClient.sync).toHaveBeenNthCalledWith(
        1,
        {
          initial: true,
          limit: 100,
          nextPageToken: null,
          nextSyncToken: null,
        },
        { paginate: false }
      )

      expect(mockClient.sync).toHaveBeenNthCalledWith(
        2,
        {
          initial: true,
          limit: 100,
          nextPageToken: expect.anything(),
          nextSyncToken: null,
        },
        { paginate: false }
      )

      expect(mockClient.sync).toHaveBeenNthCalledWith(
        3,
        {
          initial: true,
          limit: 100,
          nextPageToken: expect.anything(),
          nextSyncToken: null,
        },
        { paginate: false }
      )
    })

    it(`should fetch data with sync token`, async () => {
      const syncDataGenerator = getSyncData(
        `1234`,
        createPluginConfig({
          accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
          spaceId: `rocybtov1ozk`,
        })
      )

      expect((await syncDataGenerator.next()).value).toEqual(currentSyncData[0])
      expect((await syncDataGenerator.next()).value).toEqual(currentSyncData[1])
      expect((await syncDataGenerator.next()).value).toEqual(currentSyncData[2])
      expect(mockClient.sync).toHaveBeenNthCalledWith(
        1,
        {
          initial: false,
          limit: 100,
          nextPageToken: null,
          nextSyncToken: `1234`,
        },
        { paginate: false }
      )

      expect(mockClient.sync).toHaveBeenNthCalledWith(
        2,
        {
          initial: false,
          limit: 100,
          nextPageToken: expect.anything(),
          nextSyncToken: null,
        },
        { paginate: false }
      )

      expect(mockClient.sync).toHaveBeenNthCalledWith(
        3,
        {
          initial: false,
          limit: 100,
          nextPageToken: expect.anything(),
          nextSyncToken: null,
        },
        { paginate: false }
      )
    })
  })

  describe(`checkAccessToContentfulSpace`, () => {
    it(`should fail with a generic error`, async () => {
      mockClient.getSpace.mockImplementationOnce(() => {
        throw new Error(`error`)
      })

      await checkAccessToContentfulSpace(reporter, pluginConfig)

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
      mockClient.getSpace.mockImplementationOnce(() => {
        const err = new Error(`error`)
        err.code = `ENOTFOUND`
        throw err
      })

      await checkAccessToContentfulSpace(reporter, pluginConfig)

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
      mockClient.getSpace.mockImplementationOnce(() => {
        const err = new Error(`error`)
        err.response = { status: 404 }
        throw err
      })

      await checkAccessToContentfulSpace(reporter, pluginConfig)

      expect(reporter.panic).toBeCalledWith(
        expect.stringContaining(
          `Check if host and spaceId settings are correct`
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
          host: `Check if setting is correct`,
          spaceId: `Check if setting is correct`,
        }
      )
    })

    it(`API authorization error handling`, async () => {
      mockClient.getSpace.mockImplementationOnce(() => {
        const err = new Error(`error`)
        err.response = { status: 401 }
        throw err
      })

      await checkAccessToContentfulSpace(reporter, pluginConfig)

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
})
