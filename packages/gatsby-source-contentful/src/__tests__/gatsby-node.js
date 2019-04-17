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
// jest.mock(`../utils`, () => {
//   return {
//     ...jest.requireActual(`../utils`),
//     exitProcess: jest.fn(),
//   }
// })
const { OPTIONS_VALIDATION_FAILED } = require(`../constants`)
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

describe(`Options validation`, () => {
  let realProcess
  beforeAll(() => {
    realProcess = global.process

    global.process = {
      ...realProcess,
      exit: jest.fn(),
    }
  })

  beforeEach(() => {
    global.process.exit.mockClear()
  })

  afterAll(() => {
    global.process = realProcess
  })

  const reporter = {
    error: jest.fn(),
    optionsSummary: jest.fn(),
  }

  beforeEach(() => {
    reporter.error.mockClear()
    reporter.optionsSummary.mockClear()
    // exitProcess.mockClear()
  })

  it(`Passes with valid options`, async () => {
    await sourceNodes(
      {
        ...helperFns,
        reporter,
      },
      {
        spaceId: `spaceId`,
        accessToken: `accessToken`,
      }
    )

    expect(reporter.error).not.toBeCalled()
    expect(process.exit).not.toBeCalled()
  })

  it(`Fails with missing options`, async () => {
    try {
      await sourceNodes(
        {
          ...helperFns,
          reporter,
        },
        {}
      )
    } finally {
      expect(reporter.error).toBeCalled()
      expect(reporter.optionsSummary).toMatchSnapshot()
      expect(process.exit).toBeCalledWith(OPTIONS_VALIDATION_FAILED)
    }
  })

  it(`Fails with empty options`, async () => {
    try {
      await sourceNodes(
        {
          ...helperFns,
          reporter,
        },
        {
          environment: ``,
          host: ``,
          accessToken: ``,
          spaceId: ``,
        }
      )
    } finally {
      expect(reporter.error).toBeCalled()
      expect(reporter.optionsSummary).toMatchSnapshot()
      expect(process.exit).toBeCalledWith(OPTIONS_VALIDATION_FAILED)
    }
  })

  it(`Fails with options of wrong types`, async () => {
    try {
      await sourceNodes(
        {
          ...helperFns,
          reporter,
        },
        {
          environment: 1,
          host: [],
          accessToken: true,
          spaceId: {},
        }
      )
    } finally {
      expect(reporter.error).toBeCalled()
      expect(reporter.optionsSummary).toMatchSnapshot()
      expect(process.exit).toBeCalledWith(OPTIONS_VALIDATION_FAILED)
    }
  })
})
