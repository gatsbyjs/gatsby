const mockGetLocaleReturn = {
  items: [
    {
      code: `en-us`,
      default: true,
    },
  ],
}

let mockGetLocale
const defaultMockGetLocale = async () => mockGetLocaleReturn
const resetGetLocaleMock = () => {
  mockGetLocale = defaultMockGetLocale
}
const setGetLocaleMock = mockFn => {
  mockGetLocale = mockFn
}

resetGetLocaleMock()

const mockClient = {
  getLocales: jest.fn(() => mockGetLocale()),
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

jest.mock(`../utils`, () => {
  return {
    ...jest.requireActual(`../utils`),
    exitProcess: jest.fn(),
  }
})
const { exitProcess, CONTENTFUL_CONNECTION_FAILED } = require(`../utils`)

// jest so test output is not filled with contentful plugin logs
global.console = { log: jest.fn(), time: jest.fn(), timeEnd: jest.fn() }

const contentful = require(`contentful`)
const fetchData = require(`../fetch`)

const options = {
  spaceId: `space`,
  accessToken: `accessToken`,
  host: `host`,
  environment: `env`,
}

beforeEach(() => {
  exitProcess.mockClear()
})

it(`calls contentful.createClient with expected params`, async () => {
  await fetchData(options)
  expect(contentful.createClient.mock.calls[0]).toMatchSnapshot()
})

it(`Displays detailed plugin options on contentful client error`, async () => {
  setGetLocaleMock(() => {
    throw new Error(`error`)
  })

  const reporter = {
    error: jest.fn(),
    optionsSummary: jest.fn(),
  }

  await fetchData({ ...options, reporter })

  expect(reporter.error).toBeCalled()
  expect(reporter.optionsSummary).toBeCalledWith(
    expect.objectContaining({
      options,
    })
  )
  expect(exitProcess).toBeCalledWith(CONTENTFUL_CONNECTION_FAILED)
})
