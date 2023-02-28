const apiRunnerNode = require(`../api-runner-node`)
const path = require(`path`)

jest.mock(`../../redux`, () => {
  return {
    store: {
      getState: jest.fn(),
    },
    emitter: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }
})
jest.mock(`../get-cache`, () => {
  return {
    getCache: jest.fn(),
  }
})

const start = jest.fn()
const end = jest.fn()
const panicOnBuild = jest.fn()

const mockActivity = {
  start,
  end,
  panicOnBuild,
  done: end,
}

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    activityTimer: jest.fn(() => mockActivity),
    createProgress: jest.fn(() => mockActivity),
    panicOnBuild: jest.fn(),
    setErrorMap: jest.fn(),
  }
})

const { store, emitter } = require(`../../redux`)
const reporter = require(`gatsby-cli/lib/reporter`)
const { getCache } = require(`../get-cache`)

const fixtureDir = path.resolve(__dirname, `fixtures`, `api-runner-node`)

beforeEach(() => {
  store.getState.mockClear()
  emitter.on.mockClear()
  emitter.off.mockClear()
  emitter.emit.mockClear()
  start.mockClear()
  end.mockClear()
  reporter.panicOnBuild.mockClear()
  reporter.setErrorMap.mockClear()
  getCache.mockClear()
})

describe(`api-runner-node`, () => {
  it(`Ends activities if plugin didn't end them`, async () => {
    store.getState.mockImplementation(() => {
      return {
        program: {},
        config: {},
        flattenedPlugins: [
          {
            name: `test-plugin-correct`,
            resolve: path.join(fixtureDir, `test-plugin-correct`),
            nodeAPIs: [`testAPIHook`],
          },
          {
            name: `test-plugin-spinner`,
            resolve: path.join(fixtureDir, `test-plugin-spinner`),
            nodeAPIs: [`testAPIHook`],
          },
          {
            name: `test-plugin-progress`,
            resolve: path.join(fixtureDir, `test-plugin-progress`),
            nodeAPIs: [`testAPIHook`],
          },
          {
            name: `test-plugin-spinner-throw`,
            resolve: path.join(fixtureDir, `test-plugin-spinner-throw`),
            nodeAPIs: [`testAPIHook`],
          },
          {
            name: `test-plugin-progress-throw`,
            resolve: path.join(fixtureDir, `test-plugin-progress-throw`),
            nodeAPIs: [`testAPIHook`],
          },
        ],
      }
    })
    await apiRunnerNode(`testAPIHook`)

    expect(start).toBeCalledTimes(6)
    // we called end same amount of times we called start, even tho plugins
    // didn't call end/done themselves
    expect(end).toBeCalledTimes(6)
  })

  it(`Doesn't initialize cache in onPreInit API`, async () => {
    store.getState.mockImplementation(() => {
      return {
        program: {},
        config: {},
        flattenedPlugins: [
          {
            name: `test-plugin-on-preinit-works`,
            resolve: path.join(fixtureDir, `test-plugin-on-preinit-works`),
            nodeAPIs: [`onPreInit`, `otherTestApi`],
          },
          {
            name: `test-plugin-on-preinit-fails`,
            resolve: path.join(fixtureDir, `test-plugin-on-preinit-fails`),
            nodeAPIs: [`onPreInit`],
          },
        ],
      }
    })
    await apiRunnerNode(`onPreInit`)
    expect(getCache).not.toHaveBeenCalled()
    expect(reporter.panicOnBuild).toBeCalledTimes(1)
    expect(reporter.panicOnBuild.mock.calls[0][0]).toMatchObject({
      context: {
        api: `onPreInit`,
        pluginName: `test-plugin-on-preinit-fails`,
        sourceMessage: `Usage of "cache" instance in "onPreInit" API is not supported as this API runs before cache initialization (called in test-plugin-on-preinit-fails)`,
      },
    })

    // Make sure getCache is called on other APIs:
    await apiRunnerNode(`otherTestApi`)
    expect(getCache).toHaveBeenCalled()
  })

  it(`Correctly handle error args`, async () => {
    store.getState.mockImplementation(() => {
      return {
        program: {},
        config: {},
        flattenedPlugins: [
          {
            name: `test-plugin-error-args`,
            resolve: path.join(fixtureDir, `test-plugin-error-args`),
            nodeAPIs: [`onPreInit`],
          },
        ],
      }
    })
    await apiRunnerNode(`onPreInit`)
    expect(reporter.panicOnBuild).toBeCalledTimes(3)
    expect(reporter.panicOnBuild.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "Konohagakure",
        undefined,
        "test-plugin-error-args",
      ],
      Array [
        [Error: Rasengan],
        undefined,
        "test-plugin-error-args",
      ],
      Array [
        "Jiraiya",
        [Error: Tsunade],
        "test-plugin-error-args",
      ],
    ]
  `)
  })

  it(`Correctly uses setErrorMap with pluginName prefixes`, async () => {
    store.getState.mockImplementation(() => {
      return {
        program: {},
        config: {},
        flattenedPlugins: [
          {
            name: `test-plugin-plugin-prefixes`,
            resolve: path.join(fixtureDir, `test-plugin-plugin-prefixes`),
            nodeAPIs: [`onPreInit`],
          },
        ],
      }
    })
    await apiRunnerNode(`onPreInit`)
    expect(reporter.panicOnBuild).toBeCalledTimes(1)
    expect(reporter.setErrorMap).toBeCalledTimes(1)
    expect(reporter.panicOnBuild.mock.calls[0]).toEqual([
      {
        id: `1337`,
        context: {
          someProp: `Naruto`,
        },
      },
      undefined,
      `test-plugin-plugin-prefixes`,
    ])
    expect(reporter.setErrorMap.mock.calls[0][0]).toMatchObject({
      "test-plugin-plugin-prefixes_1337": {
        text: {},
        level: `ERROR`,
        docsUrl: `https://www.gatsbyjs.com/docs/gatsby-cli/#new`,
      },
    })
  })

  it(`setErrorMap works with activityTimer`, async () => {
    store.getState.mockImplementation(() => {
      return {
        program: {},
        config: {},
        flattenedPlugins: [
          {
            name: `test-plugin-activity-map`,
            resolve: path.join(fixtureDir, `test-plugin-activity-map`),
            nodeAPIs: [`onPreInit`],
          },
        ],
      }
    })
    await apiRunnerNode(`onPreInit`)
    expect(reporter.setErrorMap).toBeCalledTimes(1)
    expect(panicOnBuild).toBeCalledTimes(1)
    expect(reporter.activityTimer.mock.calls[3]).toEqual([
      `Test Activity`,
      {},
      `test-plugin-activity-map`,
    ])
    expect(panicOnBuild.mock.calls[0][0]).toEqual({
      id: `1337`,
      context: { someProp: `Naruto` },
    })
  })

  it(`setErrorMap works with createProgress`, async () => {
    store.getState.mockImplementation(() => {
      return {
        program: {},
        config: {},
        flattenedPlugins: [
          {
            name: `test-plugin-progress-map`,
            resolve: path.join(fixtureDir, `test-plugin-progress-map`),
            nodeAPIs: [`onPreInit`],
          },
        ],
      }
    })
    await apiRunnerNode(`onPreInit`)
    expect(reporter.setErrorMap).toBeCalledTimes(1)
    expect(reporter.createProgress).toBeCalledTimes(4)
    expect(reporter.createProgress.mock.calls[3]).toEqual([
      `Test Progress`,
      0,
      0,
      {},
      `test-plugin-progress-map`,
    ])
    expect(panicOnBuild.mock.calls[0][0]).toEqual({
      id: `1337`,
      context: { someProp: `Naruto` },
    })
  })
})
