const fs = require(`fs-extra`)
const { spawnSync } = require(`child_process`)
const path = require(`path`)
const _ = require(`lodash`)
const del = require(`del`)
const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BUILD_FILE_PATH,
} = require(`../utils/constants`)
const { selectConfiguration } = require(`../utils/select-configuration`)
const { loadState } = require(`../utils/load-state`)
const { diff } = require(`../utils/nodes-diff`)

const getNodesSubStateByPlugins = (state, pluginNamesArray) =>
  _.mapValues(state.nodes, stateShard => {
    const filteredMap = new Map()

    stateShard.forEach(node => {
      if (pluginNamesArray.includes(node.internal.owner)) {
        filteredMap.set(node.id, node)
      }
    })

    return filteredMap
  })

const getDiskCacheSnapshotSubStateByPlugins = (state, pluginNamesArray) =>
  _.mapValues(state.diskCacheSnapshot, stateShard =>
    _.pick(stateShard, pluginNamesArray)
  )

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

const { compareState } = require(`../utils/nodes-diff`)

const stdio = `inherit`

// process.env.GATSBY_EXPERIMENTAL_SELECTIVE_CACHE_INVALIDATION = `1`

const build = ({ updatePlugins } = {}) => {
  spawnSync(gatsbyBin, [`clean`], { stdio })
  selectConfiguration(1)

  let processOutput

  // First run, get state
  processOutput = spawnSync(gatsbyBin, [`build`], {
    stdio,
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  if (processOutput.status !== 0) {
    throw new Error(`Gatsby exited with non zero code`)
  }

  const preBootstrapStateFromFirstRun = loadState(ON_PRE_BOOTSTRAP_FILE_PATH)

  const postBuildStateFromFirstRun = loadState(ON_POST_BUILD_FILE_PATH)

  if (updatePlugins) {
    // Invalidations
    selectConfiguration(2)
  }

  // Second run, get state and compare with state from previous run
  processOutput = spawnSync(gatsbyBin, [`build`], {
    stdio,
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  if (processOutput.status !== 0) {
    throw new Error(`Gatsby exited with non zero code`)
  }

  const preBootstrapStateFromSecondRun = loadState(ON_PRE_BOOTSTRAP_FILE_PATH)

  const postBuildStateFromSecondRun = loadState(ON_POST_BUILD_FILE_PATH)

  return {
    nodes: {
      preBootstrapStateFromFirstRun: preBootstrapStateFromFirstRun.nodes,
      postBuildStateFromFirstRun: postBuildStateFromFirstRun.nodes,
      preBootstrapStateFromSecondRun: preBootstrapStateFromSecondRun.nodes,
      postBuildStateFromSecondRun: postBuildStateFromSecondRun.nodes,
    },
    diskCacheSnapshot: {
      preBootstrapStateFromFirstRun:
        preBootstrapStateFromFirstRun.diskCacheSnapshot,
      postBuildStateFromFirstRun: postBuildStateFromFirstRun.diskCacheSnapshot,
      preBootstrapStateFromSecondRun:
        preBootstrapStateFromSecondRun.diskCacheSnapshot,
      postBuildStateFromSecondRun:
        postBuildStateFromSecondRun.diskCacheSnapshot,
    },
    queryResults: {
      firstRun: postBuildStateFromFirstRun.queryResults,
      secondRun: postBuildStateFromSecondRun.queryResults,
    },
  }
}

beforeAll(async () => {
  await del([`plugins/**/src/**`])

  selectConfiguration(1)
})

afterAll(() => {
  // go back to initial
  selectConfiguration(1)

  // delete saved states
  if (fs.existsSync(ON_PRE_BOOTSTRAP_FILE_PATH)) {
    fs.unlinkSync(ON_PRE_BOOTSTRAP_FILE_PATH)
  }
  if (fs.existsSync(ON_POST_BUILD_FILE_PATH)) {
    fs.unlinkSync(ON_POST_BUILD_FILE_PATH)
  }
})

/*
describe.skip(`nothing changed between gatsby runs`, () => {
  let states

  beforeAll(() => {
    states = build({
      updatePlugins: false,
    })
  })

  describe(`Nodes`, () => {
    it(`nodes are persisted between builds when nothing changes`, () => {
      const {
        nodes: {
          preBootstrapStateFromFirstRun,
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        },
      } = states

      expect(preBootstrapStateFromFirstRun.size).toEqual(0)
      // sanity check to make sure there are any nodes after first run
      expect(postBuildStateFromFirstRun.size).toBeGreaterThan(0)
      // no nodes where invalidated if nothing changes
      expect(postBuildStateFromFirstRun).toEqual(preBootstrapStateFromSecondRun)
      // final nodes store is the same after first and second run
      expect(postBuildStateFromFirstRun).toEqual(postBuildStateFromSecondRun)
    })

    // it.skip(`query results matches expectations`, () => {
    //   expect(states.queryResults.actual).toEqual(states.queryResults.expected)
    // })
  })

  // describe(`Key-value persisted store (cache)`, () => {

  // })
})
*/

describe(`Some plugins changed between gatsby runs`, () => {
  let states

  beforeAll(() => {
    states = build({
      updatePlugins: true,
    })
  })

  describe(`Nodes`, () => {
    const usedPlugins = []
    const getNodesTestArgs = (states, plugins) => {
      const nodesSubState = getNodesSubStateByPlugins(states, plugins)

      usedPlugins.push(...plugins)
      return {
        ...nodesSubState,
        compareState,
      }
    }

    afterAll(() => {
      console.log({ usedPlugins })
    })

    it(`Sanity checks`, () => {
      // preconditions - we expect our cache to be empty on first run
      expect(states.nodes.preBootstrapStateFromFirstRun.size).toEqual(0)
    })

    describe(`Source plugins without transformers`, () => {
      it(`Not changing plugin doesn't invalidate nodes created by it`, () => {
        const {
          plugins,
          nodesTest,
        } = require(`../plugins/source/no-changes/scenario`)

        nodesTest(getNodesTestArgs(states, plugins))
      })

      it(`Adding plugin adds new node`, () => {
        const {
          plugins,
          nodesTest,
        } = require(`../plugins/source/plugin-added/scenario`)

        nodesTest(getNodesTestArgs(states, plugins))
      })

      it(`Removing plugin clears nodes owned by it`, () => {
        const {
          plugins,
          nodesTest,
        } = require(`../plugins/source/plugin-removed/scenario`)

        nodesTest(getNodesTestArgs(states, plugins))
      })

      it(`Changing plugin clears nodes owned by it and recreate nodes`, () => {
        const {
          plugins,
          nodesTest,
        } = require(`../plugins/source/plugin-changed/scenario`)

        nodesTest(getNodesTestArgs(states, plugins))
      })
    })

    describe(`Source plugins with transformers (child nodes)`, () => {
      describe(`Changes to source plugins`, () => {
        it(`Adding source plugin cause transformers to create child nodes`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-child-nodes/source-added/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })

        it(`Removing source plugin invalidate nodes owned by it and all children nodes`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-child-nodes/source-removed/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })

        it(`Changing source plugin invalidate nodes owned by it and all children nodes and recreates all nodes`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-child-nodes/source-changed/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })
      })

      describe(`Changes to transformer plugins`, () => {
        it(`Adding transformer adds child nodes to existing nodes`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-child-nodes/transformer-added/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })

        it(`Removing transformer clear nodes owned by it and remove children from parent nodes`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-child-nodes/transformer-removed/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })

        it(`Changing transformer clears and recreates nodes owned by it`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-child-nodes/transformer-changed/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })
      })
    })

    describe(`Source plugins with transformers (node fields)`, () => {
      describe(`Changes to source plugins`, () => {
        it(`Adding source plugin creates a node with fields`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-node-fields/source-added/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })

        it(`Changing source plugin clears and recreates nodes owned by it`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-node-fields/source-changed/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })
      })

      describe(`Changes to transformer plugins`, () => {
        it(`Adding transformer adds fields to node created by source plugin`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-node-fields/transformer-added/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })

        it(`Removing transformer removes fields from node created by source plugin`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-node-fields/transformer-removed/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })

        it(`Changing transformer removes fields from node created by source plugin and recreate fields`, () => {
          const {
            plugins,
            nodesTest,
          } = require(`../plugins/source-and-transformers-node-fields/transformer-changed/scenario`)

          nodesTest(getNodesTestArgs(states, plugins))
        })
      })
    })
  })

  describe(`Persisted key-value store (cache)`, () => {
    it(`Preserve disk cache if owner plugin did not changed`, () => {
      const {
        persistedKeyValueStoreTest,
        plugins,
      } = require(`../plugins/key-value-cache/no-changes/scenario`)

      persistedKeyValueStoreTest(
        getDiskCacheSnapshotSubStateByPlugins(states, plugins)
      )
    })

    it(`Removing owner plugin clears disk cache`, () => {
      const {
        persistedKeyValueStoreTest,
        plugins,
      } = require(`../plugins/key-value-cache/plugin-removed/scenario`)

      persistedKeyValueStoreTest(
        getDiskCacheSnapshotSubStateByPlugins(states, plugins)
      )
    })

    it(`Adding owner plugin creates disk cache`, () => {
      const {
        persistedKeyValueStoreTest,
        plugins,
      } = require(`../plugins/key-value-cache/plugin-added/scenario`)

      persistedKeyValueStoreTest(
        getDiskCacheSnapshotSubStateByPlugins(states, plugins)
      )
    })

    it(`Changing owner plugin clears disk cache and recreates it`, () => {
      const {
        persistedKeyValueStoreTest,
        plugins,
      } = require(`../plugins/key-value-cache/plugin-changed/scenario`)

      persistedKeyValueStoreTest(
        getDiskCacheSnapshotSubStateByPlugins(states, plugins)
      )
    })
  })

  describe(`Query results`, () => {
    const getQueryResultTestArgs = scenarioName => {
      const result = {
        firstRun: states.queryResults.firstRun[scenarioName],
        secondRun: states.queryResults.secondRun[scenarioName],
      }

      result.diff = diff(result.firstRun, result.secondRun)

      return result
    }

    describe(`Source plugins without transformers`, () => {
      it(`Not changing plugin doesn't change query results`, () => {
        const scenarioName = `source/no-changes`
        const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

        queriesTest(getQueryResultTestArgs(scenarioName))
      })

      it(`Changing plugin invalidates query results`, () => {
        const scenarioName = `source/plugin-changed`
        const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

        queriesTest(getQueryResultTestArgs(scenarioName))
      })
    })
  })

  it.todo(`Jobs`)
})
