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

beforeEach(() => {
  DefinePlugin.mockClear()
  readFileSync.mockClear()
  store.dispatch({
    type: `SET_PROGRAM`,
    payload: {
      extensions: [],
      browserslist: [],
      directory: process.cwd(),
    },
  })
})

const getConfig = (
  program,
  directory = process.cwd(),
  suppliedStage = `build-html`
) =>
  webpackConfig(
    {
      extensions: [`.js`],
      ...program,
    },
    directory,
    suppliedStage
  )

describe(`basic functionality`, () => {
  it(`returns webpack config with expected shape`, async () => {
    const config = await getConfig()

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
  })
})

describe(`environment variables`, () => {
  afterEach(() => {
    delete process.env.GATSBY_ACTIVE_ENV
  })

  it(`sanitizes process.env variables`, async () => {
    await getConfig()

    expect(DefinePlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        "process.env": `{}`,
      })
    )
  })

  it(`provides expected variables`, async () => {
    await getConfig()

    expect(DefinePlugin).toHaveBeenCalledWith(
      expect.objectContaining(
        [
          `__PATH_PREFIX__`,
          `process.env.BUILD_STAGE`,
          `process.env.GATSBY_BUILD_STAGE`,
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
      await getConfig()

      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`.env.staging`),
        expect.anything()
      )
    })

    it(`falls back to NODE_ENV`, async () => {
      await getConfig()

      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`.env.${process.env.NODE_ENV}`),
        expect.anything()
      )
    })
  })
})

describe(`polyfil for ie support`, () => {
  it(`should not add ie polyfil if ie is not supported`, async () => {
    const config = await getConfig(
      { browserslist: `defaults, not ie >= 9` },
      `gatsby-app`,
      `build-javascript`
    )

    expect(config.entry.app).toEqual([`gatsby-app/.cache/production-app`])
  })

  it(`should add ie9 polyfil if ie >= 9 is supported`, async () => {
    const config = await getConfig(
      { browserslist: `defaults, ie >= 9` },
      `gatsby-app`,
      `build-javascript`
    )

    expect(config.entry.app).toEqual([
      `react-app-polyfill/ie9`,
      `gatsby-app/.cache/production-app`,
    ])
  })

  it(`should add ie9 polyfil if ie >= 10 is supported`, async () => {
    const config = await getConfig(
      { browserslist: `defaults, ie >= 10` },
      `gatsby-app`,
      `build-javascript`
    )

    expect(config.entry.app).toEqual([
      `react-app-polyfill/ie9`,
      `gatsby-app/.cache/production-app`,
    ])
  })

  it(`should add ie11 polyfil if ie >= 11 is supported`, async () => {
    const config = await getConfig(
      { browserslist: `defaults, ie >= 11` },
      `gatsby-app`,
      `build-javascript`
    )

    expect(config.entry.app).toEqual([
      `react-app-polyfill/ie11`,
      `gatsby-app/.cache/production-app`,
    ])
  })
})
