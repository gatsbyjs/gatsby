const { request } = require(`graphql-request`)
const createMockLogger = require(`logger-mock`)
const fetchRoutes = require(`../prepare/fetch-routes`)

jest.mock(`graphql-request`, () => {
  return { request: jest.fn() }
})

describe(`fetch-routes`, () => {
  const endpoint = `http://localhost:3000/___graphql`
  let cache
  let logger

  beforeEach(() => {
    cache = {
      timestamp: Date.now(),
      hash: `initial-run`,
      assets: {},
    }
    logger = createMockLogger()
  })

  it(`doesn't throw when no routes are present`, async () => {
    expect.assertions(2)

    request.mockImplementationOnce(() => {
      return {
        allSitePage: {
          nodes: [],
        },
      }
    })

    const routes = await fetchRoutes({ logger, endpoint, cache })

    expect(request).toHaveBeenCalled()
    expect(routes).toEqual([])
  })

  it(`generates an array of routes`, async () => {
    expect.assertions(1)

    request.mockImplementationOnce(() => {
      return {
        allSitePage: {
          nodes: [{ path: `/foo` }, { path: `/bar` }, { path: `/baz` }],
        },
      }
    })

    const routes = await fetchRoutes({ logger, endpoint, cache })

    expect(routes).toEqual([`/foo`, `/bar`, `/baz`])
  })

  it(`prompts the user when the list of routes has not changed since last run`, async () => {
    expect.assertions(1)

    request.mockImplementationOnce(() => {
      return {
        allSitePage: {
          nodes: [{ path: `/foo` }, { path: `/bar` }, { path: `/baz` }],
        },
      }
    })
    logger.confirm.mockImplementationOnce(() =>
      Promise.resolve(false /* don't crawl routes */)
    )
    const mockExit = jest
      .spyOn(process, `exit`)
      .mockImplementationOnce(() => {})

    cache.hash = `7c709be36bd82265bb0eb74a233f3040`
    await fetchRoutes({ logger, endpoint, cache })

    expect(mockExit).toHaveBeenCalledWith(0)
  })
})
