const { save } = require(`../prepare/cache`)
const fetchRoutes = require(`../prepare/fetch-routes`)
const puppeteer = require(`puppeteer`)
const { main } = require(`../prepare/index`)

jest.mock(`../prepare/cache`, () => {
  return {
    load: jest.fn(() => {
      return {
        timestamp: Date.now(),
        hash: `initial-run`,
        assets: {},
      }
    }),
    save: jest.fn(),
    cacheFile: `/font-preload-cache.json`,
  }
})
jest.mock(`../prepare/fetch-routes`, () => jest.fn())
jest.mock(`puppeteer`, () => {
  return {
    launch: jest.fn(),
  }
})
jest.mock(`progress`, () => {
  function ProgressBar() {
    this.interrupt = jest.fn()
    this.tick = jest.fn()
  }

  return ProgressBar
})
jest.spyOn(console, `log`).mockImplementation(() => {})

const mockPageRequests = requests => {
  const createMockBrowser = () => {
    const prefixLength = `http://localhost:8000`.length
    const listeners = []
    let currentPath

    const page = {
      on: (_event, cb) => listeners.push(cb),
      goto: path => {
        currentPath = path
        const pageRequests = requests[path.substring(prefixLength)]

        if (pageRequests) {
          pageRequests.forEach(req => listeners.forEach(cb => cb(req)))
        }
      },
      url: () => currentPath,
      setCacheEnabled: () => {},
    }

    return { close: jest.fn(), newPage: () => Promise.resolve(page) }
  }

  puppeteer.launch.mockImplementationOnce(() =>
    Promise.resolve(createMockBrowser())
  )
}

const createMockRequest = asset => {
  return {
    url: () => asset,
    method: () => `GET`,
    resourceType: () => `font`,
  }
}

describe(`prepare`, () => {
  it(`visits each provided route`, async () => {
    expect.assertions(1)

    fetchRoutes.mockImplementationOnce(() => [`/foo`, `/bar`, `/baz`])
    mockPageRequests({
      [`/foo`]: [
        createMockRequest(`/path/to/font.otf`),
        createMockRequest(`https://foo.bar/path/to/font.otf`),
      ],
      [`/bar`]: [
        createMockRequest(`/path/to/another.ttf`),
        createMockRequest(`https://foo.bar/path/to/a/font.woff`),
      ],
      [`/baz`]: [
        createMockRequest(`/another/font.woff2`),
        createMockRequest(`/some/external/font.ttf`),
        createMockRequest(`https://foo.bar/another/font.ttf`),
      ],
    })

    await main()

    expect(save.mock.calls[0][0]).toMatchSnapshot({
      timestamp: expect.any(Number),
    })
  })
})
