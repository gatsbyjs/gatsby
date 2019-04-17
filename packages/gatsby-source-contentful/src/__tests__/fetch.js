// const mockGetLocaleReturn = {
//   items: [
//     {
//       code: `en-us`,
//       default: true,
//     },
//   ],
// }

// let mockGetLocale
// const defaultMockGetLocale = async () => mockGetLocaleReturn
// const resetGetLocaleMock = () => {
//   mockGetLocale = defaultMockGetLocale
// }
// const setGetLocaleMock = mockFn => {
//   mockGetLocale = mockFn
// }

// resetGetLocaleMock()

const mockClient = {
  getLocales: jest.fn(() => {
    return {
      items: [
        {
          code: `en-us`,
          default: true,
        },
      ],
    }
  }),
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

// jest.mock(`../utils`, () => {
//   return {
//     ...jest.requireActual(`../utils`),
//     exitProcess: jest.fn(),
//   }
// })
const { CONTENTFUL_CONNECTION_FAILED } = require(`../constants`)

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

let realProcess
beforeAll(() => {
  realProcess = global.process

  global.process = {
    ...realProcess,
    exit: jest.fn(),
  }
})

const reporter = {
  error: jest.fn(),
  optionsSummary: jest.fn(),
}

beforeEach(() => {
  global.process.exit.mockClear()
  reporter.error.mockClear()
})

afterAll(() => {
  global.process = realProcess
})

it(`calls contentful.createClient with expected params`, async () => {
  await fetchData({ ...options, reporter })
  expect(reporter.error).not.toBeCalled()
  expect(contentful.createClient).toMatchSnapshot()
})

it(`Displays detailed plugin options on contentful client error`, async () => {
  // setGetLocaleMock(() => {
  //   throw new Error(`error`)
  // })

  await fetchData({ ...options, reporter })

  expect(reporter.error).toBeCalled()
  expect(reporter.optionsSummary).toBeCalledWith(
    expect.objectContaining({
      options,
    })
  )
  expect(process.exit).toBeCalledWith(CONTENTFUL_CONNECTION_FAILED)
})
