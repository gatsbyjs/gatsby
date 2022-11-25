const mockHasES6ModuleSupport = jest.fn()
jest.mock(`../browserslist`, () => {
  return {
    getBrowsersList: () => [],
    hasES6ModuleSupport: () => mockHasES6ModuleSupport(),
  }
})
jest.mock(`webpack`, () => {
  return {
    ...jest.requireActual(`webpack`),
    DefinePlugin: jest.fn(),
  }
})
jest.mock(`fs-extra`, () => {
  const { readFileSync, ...rest } = jest.requireActual(`fs-extra`)
  return {
    ...rest,
    readFileSync: jest
      .fn()
      .mockImplementation((...args) => readFileSync(...args)),
  }
})
const { DefinePlugin } = require(`webpack`)
const { readFileSync } = require(`fs-extra`)
const webpackConfig = require(`../webpack.config`)
const { store } = require(`../../redux`)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

beforeEach(() => {
  DefinePlugin.mockClear()
  readFileSync.mockClear()
  mockHasES6ModuleSupport.mockReturnValue(false)
  store.dispatch({
    type: `SET_PROGRAM`,
    payload: {
      extensions: [],
      browserslist: [],
      directory: process.cwd(),
    },
  })
})

const getConfig = stage =>
  webpackConfig(
    {
      directory: process.cwd(),
      extensions: [`.js`],
    },
    process.cwd(),
    stage
  )

describe(`build-javascript`, () => {
  const stage = `build-javascript`

  const getPolyfillRule = config =>
    config.module.rules.find(rule => {
      if (Array.isArray(rule.use)) {
        return (
          rule.use[0]?.loader && rule.use[0].loader.indexOf(`babel-loader`) >= 0
        )
      }

      return undefined
    })

  it(`polyfills dependencies when ES6 module support is false`, async () => {
    mockHasES6ModuleSupport.mockReturnValue(false)

    const config = await getConfig(stage)
    const polyfillRule = getPolyfillRule(config)

    expect(polyfillRule).toBeTruthy()
  })

  it(`doesn't polyfill dependencies when ES6 module support is true`, async () => {
    mockHasES6ModuleSupport.mockReturnValue(true)

    const config = await getConfig(stage)
    const polyfillRule = getPolyfillRule(config)

    expect(polyfillRule).toBeFalsy()
  })
})

describe(`build-html`, () => {
  const stage = `build-html`

  describe(`basic functionality`, () => {
    it(`returns webpack config with expected shape`, async () => {
      const config = await getConfig(stage)

      expect(config).toEqual(
        expect.objectContaining(
          [`context`, `entry`, `output`, `module`, `plugins`, `resolve`].reduce(
            (merged, key) => {
              merged[key] = expect.anything()
              return merged
            },
            {}
          )
        )
      )
    }, 30000)
  })

  describe(`environment variables`, () => {
    afterEach(() => {
      delete process.env.GATSBY_ACTIVE_ENV
    })

    it(`sanitizes process.env variables`, async () => {
      await getConfig(stage)

      expect(DefinePlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          "process.env": `({})`,
        })
      )
    })

    it(`provides expected variables`, async () => {
      await getConfig(stage)

      expect(DefinePlugin).toHaveBeenCalledWith(
        expect.objectContaining(
          [
            `__PATH_PREFIX__`,
            `process.env.BUILD_STAGE`,
            `process.env.NODE_ENV`,
            `process.env.PUBLIC_DIR`,
          ].reduce((merged, key) => {
            merged[key] = expect.anything()
            return merged
          }, {})
        )
      )
    })

    describe(`env var overriding`, () => {
      it(`allows for GATSBY_ACTIVE_ENV override`, async () => {
        process.env.GATSBY_ACTIVE_ENV = `staging`
        await getConfig(stage)

        expect(readFileSync).toHaveBeenCalledWith(
          expect.stringContaining(`.env.staging`),
          expect.anything()
        )
        expect(DefinePlugin).toBeCalledTimes(1)
        expect(DefinePlugin.mock.calls[0][0]).toMatchObject({
          [`process.env.NODE_ENV`]: JSON.stringify(process.env.NODE_ENV),
        })
      })

      it(`falls back to NODE_ENV`, async () => {
        await getConfig(stage)

        expect(readFileSync).toHaveBeenCalledWith(
          expect.stringContaining(`.env.${process.env.NODE_ENV}`),
          expect.anything()
        )
      })
    })
  })
})
