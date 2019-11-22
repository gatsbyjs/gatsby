require(`../../db/__tests__/fixtures/ensure-loki`)()
const { getNodes } = require(`../../db/nodes`)
const { store } = require(`../../redux`)

const getNodeCount = () => getNodes().length
const getNodeIds = () =>
  getNodes()
    .map(node => node.id)
    .sort()

let mockAPIs = {}
jest.doMock(`../../utils/api-runner-node`, () => {
  const fn = (apiName, apiRunArgs = {}) => {
    const { boundActionCreators } = require(`../../redux/actions`)
    const doubleBoundActionCreators = Object.keys(boundActionCreators).reduce(
      (acc, actionName) => {
        acc[actionName] = (...args) =>
          boundActionCreators[actionName](
            ...args,
            {
              name: `gatsby-source-test`,
              version: `1.0.0`,
            },
            apiRunArgs
          )
        return acc
      },
      {}
    )

    if (mockAPIs[apiName]) {
      return mockAPIs[apiName](
        {
          actions: doubleBoundActionCreators,
          createContentDigest: require(`gatsby-core-utils`).createContentDigest,
          store,
          ...apiRunArgs,
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

require(`../../redux/plugin-runner`)

let pluginOptions = {}

// custom API to have access to actions
mockAPIs[`resetNodes`] = ({ actions }) => {
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

const run = async ({ sourceNodes, sourceNodesStatefully }) => {
  mockAPIs[`sourceNodes`] = sourceNodes
  mockAPIs[`sourceNodesStatefully`] = sourceNodesStatefully

  let sourceNodesFn
  jest.isolateModules(async () => {
    sourceNodesFn = jest.fn(require(`../source-nodes`))
  })

  await sourceNodesFn({ firstRun: true })

  return {
    refresh: async ({ sourceNodes } = {}) => {
      if (sourceNodes) {
        mockAPIs[`sourceNodes`] = sourceNodes
      }

      await sourceNodesFn({ firstRun: false })
    },
    sourceNodesFn,
  }
}

describe(`garbage collect stale nodes`, () => {
  beforeEach(async () => {
    store.dispatch({
      type: `DELETE_CACHE`,
    })

    const apiRunner = require(`../../utils/api-runner-node`)
    await apiRunner(`resetNodes`)
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

  describe(`sourceNodesStatefully`, () => {
    // add stale stateful node to assert it's being garbage collected on first source-nodes run
    beforeEach(async () => {
      store.dispatch({
        type: `DELETE_CACHE`,
      })

      store.dispatch({
        type: `CREATE_NODE`,
        payload: {
          id: `stateful-stale`,
          children: [],
          internal: {
            type: `Stateful`,
            contentDigest: `0`,
            isCreatedByStatefulSourceNodes: true,
          },
        },
      })
    })

    it(`Preserve nodes created statefully even if they are not created in sourceNodes lifecycle`, async () => {
      // baseline - look for stale node that should be garbage collected in next source-nodes run
      expect(getNodeCount()).toEqual(1)
      expect(getNodeIds()).toEqual([`stateful-stale`])

      let unsynchronizedUpdateAddNode, unsynchronizedUpdateDeleteNode
      const { refresh, sourceNodesFn } = await run({
        sourceNodes: () => {},
        sourceNodesStatefully: ({ actions }) => {
          actions.createNode({
            id: `stateful-1`,
            internal: {
              type: `Stateful`,
              contentDigest: `0`,
            },
          })
          const node2 = {
            id: `stateful-2`,
            internal: {
              type: `Stateful`,
              contentDigest: `0`,
            },
          }
          actions.createNode(node2)

          unsynchronizedUpdateAddNode = () => {
            actions.createNode({
              id: `stateful-3`,
              internal: {
                type: `Stateful`,
                contentDigest: `0`,
              },
            })
          }
          unsynchronizedUpdateDeleteNode = () => {
            actions.deleteNode({
              node: node2,
            })
          }
        },
      })

      expect(sourceNodesFn).toBeCalledTimes(1)
      expect(getNodeCount()).toEqual(2)
      // we don't have `stateful-stale` node anymore
      expect(getNodeIds()).toEqual([`stateful-1`, `stateful-2`])

      // call unsychronized update #1
      unsynchronizedUpdateAddNode()
      expect(getNodeCount()).toEqual(3)
      expect(getNodeIds()).toEqual([`stateful-1`, `stateful-2`, `stateful-3`])

      // call sourceNodes - sourceNodes will not create Stateful nodes,
      // so we are checking if Stateful nodes are preserved
      await refresh()

      expect(sourceNodesFn).toBeCalledTimes(2)
      expect(getNodeCount()).toEqual(3)
      expect(getNodeIds()).toEqual([`stateful-1`, `stateful-2`, `stateful-3`])

      // call unsychronized update #2
      unsynchronizedUpdateDeleteNode()
      expect(getNodeCount()).toEqual(2)
      expect(getNodeIds()).toEqual([`stateful-1`, `stateful-3`])

      // call sourceNodes - sourceNodes will not create Stateful nodes,
      // so we are checking if Stateful nodes are preserved
      await refresh()

      expect(sourceNodesFn).toBeCalledTimes(3)
      expect(getNodeCount()).toEqual(2)
      expect(getNodeIds()).toEqual([`stateful-1`, `stateful-3`])
    })
  })
})
