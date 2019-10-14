/**
 * This test suite assert correctness of caching query results.
 *
 * It checks if:
 *  - gatsby will run all expected queries when running with empty cache
 *  - gatsby will rerun queries that should be invalidated
 *  - gatsby will NOT run any unneeded queries (if it reuses cached queries)
 * Usual test structure:
 *  - sanity check that gatsby runs all queries after cache is cleaned
 *  - changing single node, rerunning queries and asserting only expected queries were run
 *    - without restarting gatsby process (relying on in-memory cache)
 *    - with restarting gatsby process (relying on data loaded from persisted cache)
 *
 * Tests rely on query running adding data dependencies on top level connection and single fields correctly
 * (asserting correctness of this is not part of this test suite).
 *
 * Mocked systems:
 *  - fs-extra (to not write query results to filesystem)
 *  - reporter (to not spam output of test runner)
 *  - api-runner-node (to be able to dynamically adjust `sourceNodes` and `createPage` API hooks)
 *  - query-runner (it's not really mocked - it still uses real query-runner, this is just cleanest way to add spy to default commonJS export I could find)
 *
 * Concerns:
 *  - `setup()` function re-implements subset of gatsby functionality (parts of bootstrap, develop and build commands) to limit time cost of running this test
 *     - this test might need extra maintenance when gatsby internals are being changed,
 *     - it might report false positives in unforeseen scenarios after internal changes.
 */

jest.mock(`fs-extra`, () => {
  return {
    outputFile: jest.fn(),
    ensureDir: jest.fn(),
  }
})

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    panicOnBuild: console.log,
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
    phantomActivity: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

let mockPersistedState = {}
let lokiStorage = {}
jest.mock(`../../redux/persist`, () => {
  return {
    readFromCache: () => mockPersistedState,
    writeToCache: state => {
      mockPersistedState = state
    },
  }
})

let mockedLokiFsAdapter = {
  loadDatabase: (dbname, callback) => {
    callback(lokiStorage[dbname])
  },

  saveDatabase: (dbname, dbstring, callback) => {
    lokiStorage[dbname] = dbstring
    callback(null)
  },
}

let pluginOptions = {}

let mockAPIs = {}
const setAPIhooks = hooks => (mockAPIs = { ...mockAPIs, ...hooks })

let pageQueries = {}
const setPageQueries = queries => (pageQueries = queries)

let staticQueries = {}
const setStaticQueries = queries => (staticQueries = queries)

const getTypedNodeCreators = ({
  actions: { createNode },
  createContentDigest,
}) => {
  const typedNodeCreator = type => node => {
    node.internal = {
      type,
      contentDigest: createContentDigest(node),
    }
    return createNode(node)
  }

  return {
    createSiteNode: typedNodeCreator(`Site`),
    createTestNode: typedNodeCreator(`Test`),
    createTestBNode: typedNodeCreator(`TestB`),
    createNotUsedNode: typedNodeCreator(`NotUsed`),
  }
}

let isFirstRun = true
const setup = async ({ restart = isFirstRun, clearCache = false } = {}) => {
  isFirstRun = false
  if (restart) {
    jest.resetModules()
    if (clearCache) {
      mockPersistedState = {}
      lokiStorage = {}
    }
  } else if (clearCache) {
    console.error(`Can't clear cache without restarting`)
    process.exit(1)
  }

  jest.doMock(`../query-runner`, () => {
    const actualQueryRunner = jest.requireActual(`../query-runner`)
    return jest.fn(actualQueryRunner)
  })

  jest.doMock(`../../utils/api-runner-node`, () => apiName => {
    if (mockAPIs[apiName]) {
      return mockAPIs[apiName](
        {
          actions: doubleBoundActionCreators,
          createContentDigest: require(`gatsby-core-utils`).createContentDigest,
        },
        pluginOptions
      )
    }
    return undefined
  })

  const queryUtil = require(`../`)
  const { store, emitter } = require(`../../redux`)
  const { saveState } = require(`../../db`)
  const reporter = require(`gatsby-cli/lib/reporter`)
  const queryRunner = require(`../query-runner`)
  const { boundActionCreators } = require(`../../redux/actions`)
  const doubleBoundActionCreators = Object.keys(boundActionCreators).reduce(
    (acc, actionName) => {
      acc[actionName] = (...args) =>
        boundActionCreators[actionName](...args, {
          name: `gatsby-source-test`,
          version: `1.0.0`,
        })
      return acc
    },
    {}
  )
  const apiRunner = require(`../../utils/api-runner-node`)

  if (restart) {
    const { backend } = require(`../../db/nodes`)
    if (backend === `loki`) {
      const loki = require(`../../db/loki`)
      const dbSaveFile = `${__dirname}/fixtures/loki.db`
      await loki.start({
        saveFile: dbSaveFile,
        lokiDBOptions: {
          adapter: mockedLokiFsAdapter,
        },
      })
    }
  }

  queryRunner.mockClear()

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: {
      directory: __dirname,
    },
  })

  await require(`../../utils/source-nodes`)({})
  // trigger page-hot-reloader (if it was setup in previous test)
  emitter.emit(`API_RUNNING_QUEUE_EMPTY`)

  if (restart) {
    await require(`../../schema`).build({})
    await apiRunner(`createPages`)
  }

  Object.entries(pageQueries).forEach(([componentPath, query]) => {
    store.dispatch({
      type: `QUERY_EXTRACTED`,
      payload: {
        componentPath,
        query,
      },
    })
  })

  Object.entries(staticQueries).forEach(([id, query]) => {
    store.dispatch({
      type: `REPLACE_STATIC_QUERY`,
      payload: {
        id: `sq--${id}`,
        hash: `sq--${id}`,
        query,
      },
    })
  })

  const queryIds = queryUtil.calcInitialDirtyQueryIds(store.getState())
  const { staticQueryIds, pageQueryIds } = queryUtil.groupQueryIds(queryIds)
  const activity = reporter.activityTimer(`query running`)
  activity.start()
  await queryUtil.processStaticQueries(staticQueryIds, {
    activity,
    state: store.getState(),
  })
  await queryUtil.processPageQueries(pageQueryIds, { activity })
  activity.end()

  await saveState()

  if (restart) {
    require(`../../bootstrap/page-hot-reloader`)
  }

  const idsOfQueriesThatRan = queryRunner.mock.calls.map(call => call[1].id)

  const pathsOfPagesWithQueriesThatRan = idsOfQueriesThatRan
    .filter(p => !p.startsWith(`sq--`))
    .sort()

  const staticQueriesThatRan = idsOfQueriesThatRan
    .filter(p => p.startsWith(`sq--`))
    .map(p => p.slice(4))
    .sort()

  return {
    pathsOfPagesWithQueriesThatRan,
    staticQueriesThatRan,
    pages: [...store.getState().pages.keys()].sort(),
  }
}

describe(`query caching between builds`, () => {
  beforeAll(() => {
    setAPIhooks({
      createPages: ({ actions: { createPage } }, _pluginOptions) => {
        createPage({
          component: `/src/templates/listing.js`,
          path: `/`,
          context: {},
        })

        createPage({
          component: `/src/templates/details.js`,
          path: `/foo`,
          context: {
            slug: `foo`,
          },
        })

        createPage({
          component: `/src/templates/details.js`,
          path: `/bar`,
          context: {
            slug: `bar`,
          },
        })
      },
    })
    setPageQueries({
      "/src/templates/listing.js": `
          {
            allTest {
              nodes {
                slug
                content
              }
            }
          }
        `,
      "/src/templates/details.js": `
          query($slug: String!) {
            test(slug: { eq: $slug}) {
              slug
              content
            }
          }
        `,
    })

    setStaticQueries({
      "static-query-1": `
          {
            site {
              siteMetadata {
                title
                description
              }
            }
          }
        `,
    })
  })

  describe(`Baseline`, () => {
    beforeAll(() => {
      setAPIhooks({
        sourceNodes: (nodeApiContext, _pluginOptions) => {
          const { createSiteNode, createTestNode } = getTypedNodeCreators(
            nodeApiContext
          )

          createTestNode({
            id: `test-1`,
            slug: `foo`,
            content: `Lorem ipsum.`,
          })
          createTestNode({
            id: `test-2`,
            slug: `bar`,
            content: `Dolor sit amet.`,
          })
          createSiteNode({
            id: `Site`,
            siteMetadata: {
              title: `My Site`,
              description: `Description of site`,
            },
          })
        },
      })
    })

    it(`first run - should run all queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup()

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // on initial we want all queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`, `/bar`, `/foo`])
      expect(staticQueriesThatRan).toEqual([`static-query-1`])
    }, 99999)

    it(`rerunning without data changes and without restart shouldn't run any queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup()

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // no changes should mean no queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([])
    }, 99999)

    it(`rerunning without data changes after restart shouldn't run any queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // no changes should mean no queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([])
    }, 99999)

    it(`rerunning after cache clearing - should run all queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
        clearCache: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // on initial we want all queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`, `/bar`, `/foo`])
      expect(staticQueriesThatRan).toEqual([`static-query-1`])
    }, 99999)
  })

  describe(`Changed data node used for static query`, () => {
    let nodeChangeCounter = 1
    beforeEach(() => {
      setAPIhooks({
        sourceNodes: (nodeApiContext, _pluginOptions) => {
          const { createSiteNode, createTestNode } = getTypedNodeCreators(
            nodeApiContext
          )

          createTestNode({
            id: `test-1`,
            slug: `foo`,
            content: `Lorem ipsum.`,
          })
          createTestNode({
            id: `test-2`,
            slug: `bar`,
            content: `Dolor sit amet.`,
          })
          createSiteNode({
            id: `Site`,
            siteMetadata: {
              title: `My Site`,
              description: `Description of site
            
              --edited
              edited content #${nodeChangeCounter++}
              `,
            },
          })
        },
      })
    })

    it(`rerunning after cache clearing - should run all queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
        clearCache: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // on initial we want all queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`, `/bar`, `/foo`])
      expect(staticQueriesThatRan).toEqual([`static-query-1`])
    }, 99999)

    it(`reruns only static query (no restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup()

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // it should not rerun any page query
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([`static-query-1`])
    }, 999999)

    it(`reruns only static query (with restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // it should not rerun any page query
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([`static-query-1`])
    }, 999999)
  })

  describe(`Changed data node used for pages`, () => {
    let nodeChangeCounter = 1
    beforeEach(() => {
      setAPIhooks({
        sourceNodes: (nodeApiContext, _pluginOptions) => {
          const { createSiteNode, createTestNode } = getTypedNodeCreators(
            nodeApiContext
          )

          createTestNode({
            id: `test-1`,
            slug: `foo`,
            content: `Lorem ipsum.`,
          })
          createTestNode({
            id: `test-2`,
            slug: `bar`,
            content: `Dolor sit amet.
            
            --edited
            edited content #${nodeChangeCounter++}
            `,
          })
          createSiteNode({
            id: `Site`,
            siteMetadata: {
              title: `My Site`,
              description: `Description of site`,
            },
          })
        },
      })
    })

    it(`rerunning after cache clearing - should run all queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
        clearCache: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // on initial we want all queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`, `/bar`, `/foo`])
      expect(staticQueriesThatRan).toEqual([`static-query-1`])
    }, 99999)

    it(`reruns queries only for listing and detail page that uses that node (no restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup()

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // we changed one node, so connection (`/`) and one detail page (`/bar`) should run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`, `/bar`])
      expect(staticQueriesThatRan).toEqual([])
    }, 999999)

    it(`reruns queries only for listing and detail page that uses that node (with restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // we changed one node, so connection (`/`) and one detail page (`/bar`) should run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`, `/bar`])
      expect(staticQueriesThatRan).toEqual([])
    }, 999999)
  })

  describe(`Changed data not used by either page or static queries`, () => {
    let nodeChangeCounter = 1
    beforeEach(() => {
      setAPIhooks({
        sourceNodes: (nodeApiContext, _pluginOptions) => {
          const {
            createSiteNode,
            createTestNode,
            createNotUsedNode,
          } = getTypedNodeCreators(nodeApiContext)

          createTestNode({
            id: `test-1`,
            slug: `foo`,
            content: `Lorem ipsum.`,
          })
          createTestNode({
            id: `test-2`,
            slug: `bar`,
            content: `Dolor sit amet.`,
          })
          createSiteNode({
            id: `Site`,
            siteMetadata: {
              title: `My Site`,
              description: `Description of site`,
            },
          })
          createNotUsedNode({
            id: `not-used`,
            content: `Content
            
            --edited
            edited content #${nodeChangeCounter++}`,
          })
        },
      })
    })

    it(`rerunning after cache clearing - should run all queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
        clearCache: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // on initial we want all queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`, `/bar`, `/foo`])
      expect(staticQueriesThatRan).toEqual([`static-query-1`])
    }, 99999)

    it(`changing node not used by anything doesn't trigger running any queries (no restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup()

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // no queries should run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([])
    }, 999999)

    it(`changing node not used by anything doesn't trigger running any queries (with restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`, `/bar`, `/foo`])

      // no queries should run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([])
    }, 999999)
  })

  describe(`Changing data used in multiple queries properly invalidates them`, () => {
    let nodeChangeCounter = 1
    beforeAll(() => {
      setAPIhooks({
        sourceNodes: (nodeApiContext, _pluginOptions) => {
          const { createTestNode, createTestBNode } = getTypedNodeCreators(
            nodeApiContext
          )

          createTestNode({
            id: `test-1`,
            slug: `foo`,
            content: `Lorem ipsum.
            
            --edited
            edited content #${nodeChangeCounter++}`,
          })

          // this node will not change
          createTestBNode({
            id: `test-b`,
            slug: `foo`,
            content: `Lorem ipsum.`,
          })
        },
        createPages: () => {},
      })
      setPageQueries({})
      setStaticQueries({
        "all-test-query-1": `
          {
            allTest {
              nodes {
                slug
              }
            }
          }
        `,
        "all-test-query-2": `
          {
            allTest {
              nodes {
                content
              }
            }
          }
        `,
        "all-test-b-query-1": `
          {
            allTestB {
              nodes {
                slug
              }
            }
          }
        `,
        "all-test-b-query-2": `
          {
            allTestB {
              nodes {
                content
              }
            }
          }
        `,
        "single-test-1": `
          {
            test(slug: { eq: "foo"}) {
              slug
            }
          }
        `,
        "single-test-2": `
          {
            test(slug: { eq: "foo"}) {
              content
            }
          }
        `,
        "single-test-b-1": `
          {
            testB(slug: { eq: "foo"}) {
              slug
            }
          }
        `,
        "single-test-b-2": `
          {
            testB(slug: { eq: "foo"}) {
              content
            }
          }
        `,
      })
    })

    it(`should run all queries after clearing cache`, async () => {
      const { staticQueriesThatRan } = await setup({
        restart: true,
        clearCache: true,
      })

      // on initial we want all queries to run
      expect(staticQueriesThatRan).toEqual([
        `all-test-b-query-1`,
        `all-test-b-query-2`,
        `all-test-query-1`,
        `all-test-query-2`,
        `single-test-1`,
        `single-test-2`,
        `single-test-b-1`,
        `single-test-b-2`,
      ])
    }, 99999)

    it(`should run only queries that use changed data (no restart)`, async () => {
      const { staticQueriesThatRan } = await setup()

      expect(staticQueriesThatRan).toEqual([
        `all-test-query-1`,
        `all-test-query-2`,
        `single-test-1`,
        `single-test-2`,
      ])
    }, 99999)

    it(`should run only queries that use changed data (with restart)`, async () => {
      const { staticQueriesThatRan } = await setup({
        restart: true,
      })

      expect(staticQueriesThatRan).toEqual([
        `all-test-query-1`,
        `all-test-query-2`,
        `single-test-1`,
        `single-test-2`,
      ])
    }, 99999)
  })

  describe.skip(`Changing page context invalidates page queries`, () => {
    beforeAll(() => {
      let pageChangeCounter = 1
      let nodeChangeCounter = 1
      setAPIhooks({
        sourceNodes: (nodeApiContext, _pluginOptions) => {
          const { createTestNode, createSiteNode } = getTypedNodeCreators(
            nodeApiContext
          )

          createTestNode({
            id: `test-1`,
            slug: `foo1`,
            content: `Lorem ipsum.`,
          })
          createTestNode({
            id: `test-2`,
            slug: `foo2`,
            content: `Dolor sit amet.`,
          })
          createTestNode({
            id: `test-3`,
            slug: `foo3`,
            content: `Consectetur adipiscing elit.`,
          })

          // this is just to trigger createPages without restarting
          createSiteNode({
            id: `Site`,
            siteMetadata: {
              title: `My Site`,
              description: `Description of site
            
              --edited
              edited content #${nodeChangeCounter++}
              `,
            },
          })
        },
        createPages: ({ actions: { createPage } }, _pluginOptions) => {
          createPage({
            component: `/src/templates/details.js`,
            path: `/`,
            context: {
              slug: `foo-${pageChangeCounter}`,
            },
          })

          pageChangeCounter++
        },
      })
      setPageQueries({
        "/src/templates/details.js": `
          query($slug: String!) {
            test(slug: { eq: $slug}) {
              slug
              content
            }
          }
        `,
      })
      setStaticQueries({})
    })

    it(`rerunning after cache clearing - should run all queries`, async () => {
      const { pathsOfPagesWithQueriesThatRan, pages } = await setup({
        restart: true,
        clearCache: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`])

      // on initial we want all queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`])
    }, 99999)

    it(`changing page context should rerun query (no restart)`, async () => {
      const { pathsOfPagesWithQueriesThatRan, pages } = await setup()

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`])

      // it should rerun query for page with changed context
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`])
    }, 999999)

    it(`changing page context should rerun query (with restart)`, async () => {
      const { pathsOfPagesWithQueriesThatRan, pages } = await setup({
        restart: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/`])

      // it should rerun query for page with changed context
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/`])
    }, 999999)
  })

  // this should be last test, it adds page that doesn't have queries (so it won't create any dependencies)
  describe(`Running "queries" for page without query`, () => {
    beforeAll(() => {
      setAPIhooks({
        createPages: ({ actions: { createPage } }, _pluginOptions) => {
          createPage({
            component: `/src/templates/no-dep-page.js`,
            path: `/no-dep-page`,
            context: {},
          })
        },
      })
      setPageQueries({})
      setStaticQueries({})
    })

    it(`rerunning after cache clearing - should run all queries`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
        clearCache: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/no-dep-page`])

      // on initial we want all queries to run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([`/no-dep-page`])
      expect(staticQueriesThatRan).toEqual([])
    }, 99999)

    it(`rerunning should not run any queries (no restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup()

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/no-dep-page`])

      // no queries should run
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([])
    }, 999999)

    // TO-DO: this is known issue - we always rerun queries for pages with no dependencies
    // this mean that we will retry to rerun them every time we restart gatsby
    it.skip(`rerunning should not run any queries (with restart)`, async () => {
      const {
        pathsOfPagesWithQueriesThatRan,
        staticQueriesThatRan,
        pages,
      } = await setup({
        restart: true,
      })

      // sanity check, to make sure test setup is correct
      expect(pages).toEqual([`/no-dep-page`])

      // no queries should run
      // Currently it actually re-run query for `/no-dep-page`
      expect(pathsOfPagesWithQueriesThatRan).toEqual([])
      expect(staticQueriesThatRan).toEqual([])
    }, 999999)
  })
})
