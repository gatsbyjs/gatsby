const fs = require(`fs-extra`)
const { spawnSync } = require(`child_process`)
const path = require(`path`)
const os = require(`os`)
const _ = require(`lodash`)
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

const gatsbyBin = path.join(`node_modules`, `gatsby`, `cli.js`)

const { compareState } = require(`../utils/nodes-diff`)

const stdio = `inherit`

const build = ({ updatePlugins } = {}) => {
  spawnSync(process.execPath, [gatsbyBin, `clean`], { stdio })
  selectConfiguration(1)

  let processOutput

  // First run, get state
  processOutput = spawnSync(process.execPath, [gatsbyBin, `build`], {
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
  processOutput = spawnSync(process.execPath, [gatsbyBin, `build`], {
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

describe(`nothing changed between gatsby runs`, () => {
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
  })
})

describe(`Some plugins changed between gatsby runs`, () => {
  let states

  beforeAll(() => {
    states = build({
      updatePlugins: true,
    })
  })

  describe(`Nodes`, () => {
    const getNodesTestArgs = (states, plugins) => {
      const nodesSubState = getNodesSubStateByPlugins(states, plugins)

      return {
        ...nodesSubState,
        compareState,
      }
    }

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
      if (os.platform() === "win32") {
        scenarioName = scenarioName.replace("/", "\\")
      }

      const result = {
        dataFirstRun: states.queryResults.firstRun[scenarioName].data,
        dataSecondRun: states.queryResults.secondRun[scenarioName].data,
        typesFirstRun: states.queryResults.firstRun[scenarioName].types,
        typesSecondRun: states.queryResults.secondRun[scenarioName].types,
      }

      if (result.dataFirstRun && result.dataSecondRun) {
        result.dataDiff = diff(result.dataFirstRun, result.dataSecondRun)
      }

      if (result.typesFirstRun && result.typesSecondRun) {
        result.typesDiff = diff(result.typesFirstRun, result.typesSecondRun)
      }

      return result
    }

    describe(`Source plugins without transformers`, () => {
      it(`Not changing plugin doesn't change query results`, () => {
        const scenarioName = `source/no-changes`
        const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

        queriesTest(getQueryResultTestArgs(scenarioName))
      })

      it(`Adding plugin adds a type to schema`, () => {
        const scenarioName = `source/plugin-added`
        const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

        queriesTest(getQueryResultTestArgs(scenarioName))
      })

      it(`Removing plugin removes a type from schema`, () => {
        const scenarioName = `source/plugin-removed`
        const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

        queriesTest(getQueryResultTestArgs(scenarioName))
      })

      it(`Changing plugin invalidates query results`, () => {
        const scenarioName = `source/plugin-changed`
        const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

        queriesTest(getQueryResultTestArgs(scenarioName))
      })
    })

    describe(`Source plugins with transformers`, () => {
      describe(`Changes to source plugins`, () => {
        it(`Adding source plugin creates parent and child types in schema and they are queryable on second run`, () => {
          const scenarioName = `source-and-transformers-child-nodes/source-added`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })

        it(`Removing source plugin removes parent and child types from schema and they are queryable on first run`, () => {
          const scenarioName = `source-and-transformers-child-nodes/source-removed`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })

        it(`Changing source plugin adjust schema and query result changes just certain fields`, () => {
          const scenarioName = `source-and-transformers-child-nodes/source-changed`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })
      })

      describe(`Changes to transformer plugins`, () => {
        it(`Adding transformer plugin adds child type to schema and updates query result`, () => {
          const scenarioName = `source-and-transformers-child-nodes/transformer-added`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })

        it(`Removing transformer plugin removes child type from schema and updates query result`, () => {
          const scenarioName = `source-and-transformers-child-nodes/transformer-removed`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })

        it(`Changing transformer plugin adjusts schema and query result changes just certain fields`, () => {
          const scenarioName = `source-and-transformers-child-nodes/transformer-changed`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })
      })
    })

    describe(`Source plugins with transformers (node fields)`, () => {
      describe(`Changes to source plugins`, () => {
        it(`Adding source plugin creates node and node field types in schema and they are queryable on second run`, () => {
          const scenarioName = `source-and-transformers-node-fields/source-added`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })

        it(`Changing source plugin adjusts schema and they are queryable on second run`, () => {
          const scenarioName = `source-and-transformers-node-fields/source-changed`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })
      })

      describe(`Changes to transformer plugins`, () => {
        it(`Adding transformer plugin adds fields type to schema and updates query result`, () => {
          const scenarioName = `source-and-transformers-node-fields/transformer-added`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })

        it(`Removing transformer plugin removes fields type from schema and updates query result`, () => {
          const scenarioName = `source-and-transformers-node-fields/transformer-removed`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })

        it(`Changing transformer plugin adjusts schema and query result changes just certain fields`, () => {
          const scenarioName = `source-and-transformers-node-fields/transformer-changed`
          const { queriesTest } = require(`../plugins/${scenarioName}/scenario`)

          queriesTest(getQueryResultTestArgs(scenarioName))
        })
      })
    })
  })
})
