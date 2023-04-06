import { sourceNodes } from "../source-nodes"
import { is } from "../../utils/source-nodes"
import { store } from "../../redux"
import * as apiRunnerNode from "../../utils/api-runner-node"
import { actions } from "../../redux/actions"
import { getDataStore } from "../../datastore"

jest.mock(`../../utils/api-runner-node`)

const mockAPIs = {}

const testPlugin = {
  name: `gatsby-source-test`,
  version: `1.0.0`,
}

const sourcePluginSourcingFunctions: Array<(api: any) => void> = []
function runSourceNodesWithPluginImplementation(
  fn: (api: any) => void
): ReturnType<typeof sourceNodes> {
  sourcePluginSourcingFunctions.push(fn)
  return sourceNodes({ store })
}

describe(`Stateful source plugins`, () => {
  beforeAll(() => {
    ;(apiRunnerNode as jest.MockedFunction<any>).mockImplementation(
      (apiName, opts = {}) => {
        if (mockAPIs[apiName]) {
          return mockAPIs[apiName](
            {
              actions: Object.keys(actions).reduce((acc, actionName) => {
                acc[actionName] = (...args): any =>
                  // add test plugin to all actions
                  store.dispatch(actions[actionName](...args, testPlugin, opts))
                return acc
              }, {}),
            },
            {}
          )
        }
        return undefined
      }
    )

    mockAPIs[`sourceNodes`] = jest.fn(api => {
      while (sourcePluginSourcingFunctions.length) {
        sourcePluginSourcingFunctions.shift()?.(api)
      }
    })
  })

  beforeEach(() => {
    mockAPIs[`sourceNodes`].mockClear()
    store.dispatch({ type: `DELETE_CACHE` })
  })

  it.each([
    [
      `Stale nodes are deleted for plugins using touchNode`,
      { needToTouchNodes: true },
    ],
    [
      `Stale nodes are not deleted for plugins using actions.enableStatefulSourceNodes()`,
      { needToTouchNodes: false },
    ],
  ])(`%s`, async (_, { needToTouchNodes }) => {
    const nodes = [
      {
        id: `1`,
        internal: {
          type: `Test`,
          contentDigest: `1`,
        },
      },
      {
        id: `2`,
        internal: {
          type: `Test`,
          contentDigest: `1`,
        },
      },
    ]

    await runSourceNodesWithPluginImplementation(({ actions }) => {
      if (!needToTouchNodes) {
        actions.enableStatefulSourceNodes()
      }

      nodes.forEach(node => actions.createNode(node))
    })

    const lmdb = getDataStore()
    const allNodesInFirstSource = lmdb.getNodes()
    expect(allNodesInFirstSource.length).toBe(2)

    // simulate a new process start up where the cache is warm and no nodes are touched yet
    is.initialSourceNodesOfCurrentNodeProcess = true
    store.getState().nodesTouched = new Set()
    await runSourceNodesWithPluginImplementation(api => {
      if (needToTouchNodes) {
        api.actions.touchNode(nodes[1])
      }
    })
    is.initialSourceNodesOfCurrentNodeProcess = false

    const allNodesInSecondSource = lmdb.getNodes()

    if (needToTouchNodes) {
      // stale node should be deleted. Only one was touched and two were created
      expect(allNodesInSecondSource.length).toBe(1)
      expect(allNodesInSecondSource[0].id).toBe(`2`)
    } else {
      // stale node should not be deleted
      expect(allNodesInSecondSource.length).toBe(2)
      expect(allNodesInSecondSource[0].id).toBe(`1`)
    }
  })
})
