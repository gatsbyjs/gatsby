const path = require(`path`)
require(`../../db/__tests__/fixtures/ensure-loki`)()
const { getNodes } = require(`../../db/nodes`)

const getNodeCount = () => getNodes().length
const getNodeIds = () =>
  getNodes()
    .map(node => node.id)
    .sort()

let mockAPIs = {}
jest.doMock(`../../utils/api-runner-node`, () => {
  const fn = (apiName, args = {}) => {
    if (mockAPIs[apiName]) {
      return mockAPIs[apiName](
        {
          actions: doubleBoundActionCreators,
          createContentDigest: require(`gatsby-core-utils`).createContentDigest,
          ...args,
        },
        pluginOptions
      )
    }
    return undefined
  }

  const actualAPIRunner = jest.requireActual(`../../utils/api-runner-node`)
  fn.transaction = actualAPIRunner.transaction

  return fn
})

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

const { store } = require(`../../redux`)
require(`../../redux/plugin-runner`)

let pluginOptions = {}

const resetNodes = ({ actions }) => {
  actions.createNode({
    id: `node-1`,
    children: [`node-1-1`],
    internal: { type: `Test`, contentDigest: `0` },
  })

  actions.createNode({
    id: `node-1-1`,
    parent: `node-1`,
    internal: { type: `Test`, contentDigest: `0` },
  })

  actions.createNode({
    id: `node-2`,
    internal: { type: `Test`, contentDigest: `0` },
  })
}

const run = async ({ sourceNodes }) => {
  mockAPIs[`sourceNodes`] = sourceNodes

  let sourceNodesFn
  jest.isolateModules(async () => {
    sourceNodesFn = jest.fn(require(`../source-nodes`))
  })

  await sourceNodesFn()

  return {
    refresh: async ({ sourceNodes } = {}) => {
      if (sourceNodes) {
        mockAPIs[`sourceNodes`] = sourceNodes
      }

      await sourceNodesFn()
    },
    sourceNodesFn,
  }
}

describe(`garbage collect stale nodes`, () => {
  beforeEach(() => {
    store.dispatch({
      type: `DELETE_CACHE`,
    })

    resetNodes({ actions: doubleBoundActionCreators })
  })

  describe(`garbage collection works on first sourceNodes`, () => {
    it(`preserve nothing if nothing is re-created`, async () => {
      // assert pre-conditions
      expect(getNodeCount()).toEqual(3)
      expect(getNodeIds()).toEqual([`node-1`, `node-1-1`, `node-2`])

      await run({
        sourceNodes: () => {},
      })

      // Recreated 0 nodes, we should have no nodes
      expect(getNodeCount()).toEqual(0)
      expect(getNodeIds()).toEqual([])
    })

    it(`preserve single leaf node that is re-created`, async () => {
      // assert pre-conditions
      expect(getNodeCount()).toEqual(3)
      expect(getNodeIds()).toEqual([`node-1`, `node-1-1`, `node-2`])

      await run({
        sourceNodes: ({ actions }) => {
          actions.createNode({
            id: `node-2`,
            internal: { type: `Test`, contentDigest: `0` },
          })
        },
      })

      // Recreated 1 node unchanged - we should keep that node and all of its descendents
      expect(getNodeCount()).toEqual(1)
      expect(getNodeIds()).toEqual([`node-2`])
    })

    it(`preserve single leaf node that is touched`, async () => {
      // assert pre-conditions
      expect(getNodeCount()).toEqual(3)
      expect(getNodeIds()).toEqual([`node-1`, `node-1-1`, `node-2`])

      await run({
        sourceNodes: ({ actions }) => {
          actions.touchNode({
            nodeId: `node-2`,
          })
        },
      })

      // Touched 1 node - we should keep that node and all of its descendents
      expect(getNodeCount()).toEqual(1)
      expect(getNodeIds()).toEqual([`node-2`])
    })

    it(`preserve single parent node that is re-created (and its descedents)`, async () => {
      // assert pre-conditions
      expect(getNodeCount()).toEqual(3)
      expect(getNodeIds()).toEqual([`node-1`, `node-1-1`, `node-2`])

      await run({
        sourceNodes: ({ actions }) => {
          actions.createNode({
            id: `node-1`,
            internal: { type: `Test`, contentDigest: `0` },
          })
        },
      })

      // Recreated 1 node unchanged - we should keep that node and all of its descendents
      expect(getNodeCount()).toEqual(2)
      expect(getNodeIds()).toEqual([`node-1`, `node-1-1`])
    })

    it(`preserve single parent node that is touched (and its descedents)`, async () => {
      // assert pre-conditions
      expect(getNodeCount()).toEqual(3)
      expect(getNodeIds()).toEqual([`node-1`, `node-1-1`, `node-2`])

      await run({
        sourceNodes: ({ actions }) => {
          actions.touchNode({
            nodeId: `node-1`,
          })
        },
      })

      // Recreated 1 node unchanged - we should keep that node and all of its descendents
      expect(getNodeCount()).toEqual(2)
      expect(getNodeIds()).toEqual([`node-1`, `node-1-1`])
    })
  })

  it(`garbage collection works on subsequent sourceNodes calls`, async () => {
    // assert pre-conditions
    expect(getNodeCount()).toEqual(3)
    expect(getNodeIds()).toEqual([`node-1`, `node-1-1`, `node-2`])

    const { refresh, sourceNodesFn } = await run({
      sourceNodes: ({ actions }) => {
        actions.touchNode({
          nodeId: `node-1`,
        })
      },
    })

    // make sure intermediate state as one we expect
    expect(sourceNodesFn).toBeCalledTimes(1)
    expect(getNodeCount()).toEqual(2)
    expect(getNodeIds()).toEqual([`node-1`, `node-1-1`])

    // trigger second `souceNodes` run
    await refresh({
      sourceNodes: ({ actions }) => {
        actions.createNode({
          id: `node-3`,
          internal: { type: `Test`, contentDigest: `0` },
        })
      },
    })

    expect(sourceNodesFn).toBeCalledTimes(2)
    // we should only get nodes created in last `sourceNodes` call
    expect(getNodeCount()).toEqual(1)
    expect(getNodeIds()).toEqual([`node-3`])
  })

  describe(`SitePage`, () => {
    beforeAll(() => {
      const {
        onCreatePage,
      } = require(`../../internal-plugins/internal-data-bridge/gatsby-node`)
      mockAPIs[`onCreatePage`] = onCreatePage
    })
    afterAll(() => {
      mockAPIs[`onCreatePage`] = undefined
    })

    it(`Preserve SitePage nodes even if they are not created in sourceNodes lifecycle`, async () => {
      const { refresh, sourceNodesFn } = await run({
        sourceNodes: () => {},
      })

      expect(sourceNodesFn).toBeCalledTimes(1)

      doubleBoundActionCreators.createPage({
        path: `/path-A/`,
        component: path.resolve(`./fixtures/template-component.js`),
      })

      expect(sourceNodesFn).toBeCalledTimes(1)
      expect(getNodeCount()).toEqual(1)
      expect(getNodes()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: `/path-A/`,
          }),
        ])
      )

      // add new page
      doubleBoundActionCreators.createPage({
        path: `/path-B/`,
        component: path.resolve(`./fixtures/template-component.js`),
      })

      // call sourceNodes - sourceNodes will not create SitePage,
      // so we are checking if SitePage nodes are preserved
      await refresh()

      expect(sourceNodesFn).toBeCalledTimes(2)
      expect(getNodes()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: `/path-A/`,
          }),
          expect.objectContaining({
            path: `/path-B/`,
          }),
        ])
      )

      // remove 1 page
      doubleBoundActionCreators.deletePage({
        path: `/path-B/`,
        component: path.resolve(`./fixtures/template-component.js`),
      })

      // call sourceNodes - sourceNodes will not create SitePage,
      // so we are checking if SitePage nodes are preserved
      await refresh()

      expect(sourceNodesFn).toBeCalledTimes(3)
      expect(getNodes()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: `/path-A/`,
          }),
        ])
      )
    })
  })
})
