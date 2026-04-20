const _ = require(`lodash`)
const path = require(`path`)
const v8 = require(`v8`)
const reporter = require(`gatsby-cli/lib/reporter`)
const writeToCache = jest.spyOn(require(`../persist`), `writeToCache`)
const v8Serialize = jest.spyOn(v8, `serialize`)
const v8Deserialize = jest.spyOn(v8, `deserialize`)
const reporterInfo = jest.spyOn(reporter, `info`).mockImplementation(jest.fn)
const reporterWarn = jest.spyOn(reporter, `warn`).mockImplementation(jest.fn)

const {
  saveState,
  store,
  readState,
  savePartialStateToDisk,
} = require(`../index`)

const {
  actions: { createPage, createNode },
} = require(`../actions`)

const pageTemplatePath = `/Users/username/dev/site/src/templates/my-sweet-new-page.js`
const mockWrittenContent = new Map()
const mockCompatiblePath = path
jest.mock(`fs-extra`, () => {
  return {
    writeFileSync: jest.fn((file, content) =>
      mockWrittenContent.set(file, content)
    ),
    outputFileSync: jest.fn((file, content) =>
      mockWrittenContent.set(file, content)
    ),
    readFileSync: jest.fn(file => mockWrittenContent.get(file)),
    moveSync: jest.fn((from, to) => {
      // This will only work for folders if they are always the full prefix
      // of the file... (that goes for both input dirs). That's the case here.
      if (mockWrittenContent.has(to)) {
        throw new Error(`File/folder exists`)
      }

      // Move all files in this folder as well ... :/
      mockWrittenContent.forEach((value, key) => {
        if (key.startsWith(from)) {
          // rename('foo/bar', 'a/b/c') => foo/bar/ding.js -> a/b/c/ding.js
          // (.replace with string arg will only replace the first occurrence)
          mockWrittenContent.set(
            key.replace(from, to),
            mockWrittenContent.get(key)
          )
          mockWrittenContent.delete(key)
        }
      })
    }),
    existsSync: jest.fn(target => mockWrittenContent.has(target)),
    mkdtempSync: jest.fn(suffix => {
      const dir = mockCompatiblePath.join(
        `some`,
        `tmp` + suffix + Math.random()
      )
      mockWrittenContent.set(dir, Buffer(`empty dir`))
      return dir
    }),
    removeSync: jest.fn(file => mockWrittenContent.delete(file)),
  }
})
jest.mock(`glob`, () => {
  return {
    sync: jest.fn(pattern => {
      // Tricky.
      // Expecting a path prefix, ending with star. Else this won't work :/
      if (pattern.slice(-1) !== `*`) {
        throw new Error(`Expected pattern ending with star`)
      }
      const globPrefix = pattern.slice(0, -1)
      if (globPrefix.includes(`*`)) {
        throw new Error(`Expected pattern to be a prefix`)
      }
      const files = []
      mockWrittenContent.forEach((value, key) => {
        if (key.startsWith(globPrefix)) {
          files.push(key)
        }
      })
      return files
    }),
  }
})

jest.mock(`gatsby-core-utils`, () => {
  return {
    ...jest.requireActual(`gatsby-core-utils`),
    murmurhash: {
      murmurhash: jest.fn(() => `1234567890`),
    },
    uuid: {
      v4: jest.fn(() => `1234567890`),
    },
  }
})

function getFakeNodes() {
  // Set nodes to something or the cache will fail because it asserts this
  // Actual nodes content should match TS type; these are verified
  const map /* : Map<string, IReduxNode> */ = new Map()
  map.set(`pageA`, {
    id: `pageA`,
    internal: {
      type: `Ding`,
    },
  })
  map.set(`pageB`, {
    id: `pageB`,
    internal: {
      type: `Dong`,
    },
  })
  return map
}

describe(`redux db`, () => {
  const initialComponentsState = _.cloneDeep(store.getState().components)

  function createPages(pages) {
    // mock Date.now so Date.now() doesn't change in between tests
    const RealDateNow = Date.now
    let DateNowCallCount = 0
    // simulate passage of time by increasing call counter (instead of actual time value)
    Date.now = jest.fn(() => ++DateNowCallCount)

    store.dispatch(
      (Array.isArray(pages) ? pages : [pages]).map(
        page =>
          createPage(page, {
            name: `default-site-plugin`,
          }).filter(a => a.type === `CREATE_PAGE`)[0]
      )
    )

    Date.now = RealDateNow
  }

  const defaultPage = {
    path: `/my-sweet-new-page/`,
    // seems like jest serializer doesn't play nice with Maps on Windows
    component: pageTemplatePath,
    // The context is passed as props to the component as well
    // as into the component's GraphQL query.
    context: {
      id: `123456`,
    },
  }

  beforeEach(() => {
    store.getState().nodes = new Map()
    store.dispatch({
      type: `DELETE_CACHE`,
    })
    writeToCache.mockClear()
    mockWrittenContent.clear()
    mockWrittenContent.set(pageTemplatePath, `foo`)
    reporterWarn.mockClear()
    reporterInfo.mockClear()
  })

  it(`should write redux cache to disk`, async () => {
    createPages(defaultPage)

    expect(initialComponentsState).toEqual(new Map())

    store.getState().nodes = getFakeNodes()

    await saveState()

    expect(writeToCache).toBeCalled()

    // reset state in memory
    store.dispatch({
      type: `DELETE_CACHE`,
    })
    // make sure store in memory is empty
    expect(store.getState().components).toEqual(initialComponentsState)

    // read data that was previously cached
    const data = readState()

    // make sure data was read and is not the same as our clean redux state
    expect(data.components).not.toEqual(initialComponentsState)

    expect(data).toMatchSnapshot()
  })

  describe(`GATSBY_DISABLE_CACHE_PERSISTENCE`, () => {
    beforeAll(() => {
      process.env.GATSBY_DISABLE_CACHE_PERSISTENCE = `truthy`
    })

    afterAll(() => {
      delete process.env.GATSBY_DISABLE_CACHE_PERSISTENCE
    })
    it(`shouldn't write redux cache to disk when GATSBY_DISABLE_CACHE_PERSISTENCE env var is used`, async () => {
      expect(initialComponentsState).toEqual(new Map())

      store.getState().nodes = getFakeNodes()

      await saveState()

      expect(writeToCache).not.toBeCalled()
    })
  })

  describe(`Sharding`, () => {
    afterAll(() => {
      v8Serialize.mockRestore()
      v8Deserialize.mockRestore()
    })

    // we set limit to 1.5 * 1024 * 1024 * 1024 per shard
    // simulating size for page will allow us to see if we create expected amount of shards
    // and that we stitch them back together correctly
    const pageShardsScenarios = [
      {
        numberOfPages: 50 * 1000,
        simulatedPageObjectSize: 10 * 1024,
        expectedNumberOfPageShards: 1,
        expectedPageContextSizeWarning: false,
      },
      {
        numberOfPages: 50,
        simulatedPageObjectSize: 10 * 1024 * 1024,
        expectedNumberOfPageShards: 1,
        expectedPageContextSizeWarning: true,
      },
      {
        numberOfPages: 5,
        simulatedPageObjectSize: 0.9 * 1024 * 1024 * 1024,
        expectedNumberOfPageShards: 5,
        expectedPageContextSizeWarning: true,
      },
    ]

    const scenarios = []
    for (const pageShardsParams of pageShardsScenarios) {
      scenarios.push([
        pageShardsParams.numberOfPages,
        pageShardsParams.simulatedPageObjectSize,
        pageShardsParams.expectedNumberOfPageShards,
        pageShardsParams.expectedPageContextSizeWarning
          ? `with page context size warning`
          : `without page context size warning`,
        pageShardsParams.expectedPageContextSizeWarning,
      ])
    }

    it.each(scenarios)(
      `Scenario Pages %i x %i bytes = %i shards (%s)`,
      async (
        numberOfPages,
        simulatedPageObjectSize,
        expectedNumberOfPageShards,
        _expectedPageContextSizeWarningLabelForTestName,
        expectedPageContextSizeWarning
      ) => {
        // just some baseline checking to make sure test setup is correct - check both in-memory state and persisted state
        // and make sure it's empty
        const initialStateInMemory = store.getState()
        expect(initialStateInMemory.pages).toEqual(new Map())

        // we expect to have no persisted state yet - this returns empty object
        // and let redux to use initial states for all redux slices
        const initialPersistedState = readState()
        expect(initialPersistedState.pages).toBeUndefined()
        expect(initialPersistedState).toEqual({})

        createPages(
          new Array(numberOfPages).fill(undefined).map((_, index) => {
            return {
              path: `/page-${index}/`,
              component: `/Users/username/dev/site/src/templates/my-sweet-new-page.js`,
              context: {
                objectType: `page`,
                possiblyHugeField: `let's pretend this field is huge (we will simulate that by mocking some things used to asses size of object)`,
              },
            }
          })
        )

        const currentStateInMemory = store.getState()
        expect(currentStateInMemory.pages.size).toEqual(numberOfPages)

        // this is just to make sure that any implementation changes in readState
        // won't affect this test - so we clone current state of things and will
        // use that for assertions
        const clonedCurrentPages = new Map(currentStateInMemory.pages)

        // we expect to have no persisted state yet and that current in-memory state doesn't affect it
        const persistedStateBeforeSaving = readState()
        expect(persistedStateBeforeSaving.pages).toBeUndefined()
        expect(persistedStateBeforeSaving).toEqual({})

        // simulate that pages have sizes set in scenario parameters
        // it changes implementation to JSON.stringify because calling v8.serialize
        // again cause max stack size errors :shrug: - this also requires adjusting
        // deserialize implementation
        v8Serialize.mockImplementation(obj => {
          if (obj?.[1]?.context?.objectType === `page`) {
            return {
              toString: () => JSON.stringify(obj),
              length: simulatedPageObjectSize,
            }
          } else {
            return JSON.stringify(obj)
          }
        })
        v8Deserialize.mockImplementation(obj => JSON.parse(obj.toString()))

        await saveState()

        if (expectedPageContextSizeWarning) {
          expect(reporterWarn).toBeCalledWith(
            `The size of at least one page context chunk exceeded 500kb, which could lead to degraded performance. Consider putting less data in the page context.`
          )
        } else {
          expect(reporterWarn).not.toBeCalled()
        }

        const shardsWritten = {
          rest: 0,
          page: 0,
        }

        for (const fileWritten of mockWrittenContent.keys()) {
          const basename = path.basename(fileWritten)
          if (basename.startsWith(`redux.rest`)) {
            shardsWritten.rest++
          } else if (basename.startsWith(`redux.page`)) {
            shardsWritten.page++
          }
        }

        expect(writeToCache).toBeCalled()

        expect(shardsWritten.rest).toEqual(1)
        expect(shardsWritten.page).toEqual(expectedNumberOfPageShards)

        // and finally - let's make sure that reading shards stitches it back together
        // correctly
        const persistedStateAfterSaving = readState()

        expect(persistedStateAfterSaving.pages).toEqual(clonedCurrentPages)
      }
    )
  })

  it(`doesn't discard persisted cache if no pages`, () => {
    expect(store.getState().nodes.size).toEqual(0)
    expect(store.getState().pages.size).toEqual(0)

    store.dispatch(
      createNode(
        {
          id: `node-test`,
          context: {
            objectType: `node`,
          },
          internal: {
            type: `Foo`,
            contentDigest: `contentDigest-test`,
          },
        },
        { name: `gatsby-source-test` }
      )
    )

    // In strict mode nodes are stored in LMDB not redux state
    expect(store.getState().nodes.size).toEqual(0)
    expect(store.getState().pages.size).toEqual(0)

    let persistedState = readState()

    expect(persistedState.nodes?.size ?? 0).toEqual(0)
    expect(persistedState.pages?.size ?? 0).toEqual(0)

    saveState()

    // reset state in memory
    store.dispatch({
      type: `DELETE_CACHE`,
    })

    expect(store.getState().nodes.size).toEqual(0)
    expect(store.getState().pages.size).toEqual(0)

    persistedState = readState()

    // With lmdb store we always persist a single dummy node to bypass
    // "Cache exists but contains no nodes..." warning
    expect(persistedState.nodes?.size).toEqual(1)
    const nodes = Array.from(persistedState.nodes.values())
    expect(nodes[0]).toMatchObject({ id: `dummy-node-id` })

    expect(persistedState.pages?.size ?? 0).toEqual(0)
  })

  it(`discards persisted cache if no nodes are stored there`, () => {
    expect(store.getState().nodes.size).toEqual(0)
    expect(store.getState().pages.size).toEqual(0)

    createPages(defaultPage)

    expect(store.getState().nodes.size).toEqual(0)
    expect(store.getState().pages.size).toEqual(1)

    let persistedState = readState()

    expect(persistedState.nodes?.size ?? 0).toEqual(0)
    expect(persistedState.pages?.size ?? 0).toEqual(0)

    saveState()

    // reset state in memory
    store.dispatch({
      type: `DELETE_CACHE`,
    })

    expect(store.getState().nodes.size).toEqual(0)
    expect(store.getState().pages.size).toEqual(0)

    persistedState = readState()

    // With lmdb store we always persist a single dummy node to bypass
    // "Cache exists but contains no nodes..." warning
    expect(persistedState.nodes?.size ?? 0).toEqual(1)
    expect(persistedState.pages?.size ?? 0).toEqual(1)
    expect(reporterInfo).not.toBeCalled()
    const nodes = Array.from(persistedState.nodes.values())
    expect(nodes[0]).toMatchObject({ id: `dummy-node-id` })
  })

  describe(`savePartialStateToDisk`, () => {
    beforeEach(() => {
      createPages(defaultPage)
    })

    it(`saves with correct filename (with defaults)`, () => {
      savePartialStateToDisk([`pages`])

      let basename
      // get first non page template mocked fs write
      for (const savedFile of mockWrittenContent.keys()) {
        if (savedFile === pageTemplatePath) {
          continue
        }

        basename = path.basename(savedFile)
        break
      }

      expect(basename.startsWith(`redux.worker.slices__`)).toBe(true)
    })

    it(`saves correct slice of state`, () => {
      savePartialStateToDisk([`pages`])

      expect(writeToCache).toBeCalledWith(
        { pages: expect.anything() },
        [`pages`],
        undefined
      )
    })

    it(`respects optionalPrefix`, () => {
      savePartialStateToDisk([`pages`], `custom-prefix`)

      let basename
      // get first non page template mocked fs write
      for (const savedFile of mockWrittenContent.keys()) {
        if (savedFile === pageTemplatePath) {
          continue
        }

        basename = path.basename(savedFile)
        break
      }

      expect(basename.startsWith(`redux.worker.slices_custom-prefix_`)).toBe(
        true
      )
    })

    it(`respects transformState`, () => {
      const customTransform = state => {
        return {
          ...state,
          hello: `world`,
        }
      }

      savePartialStateToDisk([`pages`], undefined, customTransform)

      expect(writeToCache).toBeCalledWith(
        { pages: expect.anything(), hello: `world` },
        [`pages`],
        undefined
      )
    })
  })
})
