import chalk from "chalk"
import fetchGraphQL, { moduleHelpers } from "../dist/utils/fetch-graphql"
import store from "../dist/store"

jest.mock(`async-retry`, () => {
  return {
    __esModule: true,
    default: jest.fn((tryFunction) => {
      const bail = (e) => {
        throw e
      }

      return tryFunction(bail)
    })
  }
})

describe(`fetchGraphQL helper`, () => {
  let mock
  const panicMessages = []

  beforeAll(() => {
    const sharedError = `Request failed with status code`
    try {
      mock = jest.spyOn(moduleHelpers, `getHttp`).mockImplementation(() => {
        return {
          post: (_url, { query }) => {
            if (typeof query === `number`) {
              throw new Error(`${sharedError} ${query}`)
            }

            if (query === `wpgraphql-deactivated`) {
              return Promise.resolve({
                request: {},
                headers: {
                  [`content-type`]: `text/html`,
                },
              })
            }

            return null
          },
        }
      })
    } catch (e) {
      if (!e.message.includes(sharedError)) {
        throw e
      }
    }

    const fakeReporter = {
      panic: ({ context: { sourceMessage } }) => {
        panicMessages.push(sourceMessage)
      },
    }

    store.dispatch.gatsbyApi.setState({
      helpers: {
        reporter: fakeReporter,
      },
    })
  })

  test(`handles 500 errors`, async () => {
    await fetchGraphQL({
      query: 500,
      url: `fake url`,
    })

    expect(
      panicMessages[0]
    ).toInclude(`Your WordPress server is either overloaded or encountered a PHP error.`)
  })

  test(`handles 502, 503, and 504 errors`, async () => {
    const errorMessage = `Your WordPress server at ${chalk.bold(
      `fake url`
    )} appears to be overloaded.`

    await fetchGraphQL({
      query: 502,
      url: `fake url`,
    })
    expect(panicMessages[1]).toInclude(errorMessage)

    await fetchGraphQL({
      query: 503,
      url: `fake url`,
    })
    expect(panicMessages[2]).toInclude(errorMessage)

    await fetchGraphQL({
      query: 504,
      url: `fake url`,
    })
    expect(panicMessages[3]).toInclude(errorMessage)
  })

  test(`errors when WPGraphQL is not active`, async () => {
    await fetchGraphQL({
      query: `wpgraphql-deactivated`,
      url: `fake url`,
    })

    expect(
      panicMessages[4]
    ).toInclude(`Unable to connect to WPGraphQL.`)
  })

  afterAll(() => {
    mock.mockRestore()
  })
})
