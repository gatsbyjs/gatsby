const fs = require(`fs-extra`)
const { spawnSync } = require(`child_process`)
const path = require(`path`)
const v8 = require(`v8`)
const _ = require(`lodash`)
const del = require(`del`)
const slash = require(`slash`)
const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BUILD_FILE_PATH,
} = require(`../utils/constants`)
const { createContentDigest } = require(`gatsby-core-utils`)

const sanitizePageCreatorPluginOptions = options => {
  if (options && options.path) {
    return {
      ...options,
      path: slash(path.relative(process.cwd(), options.path)),
    }
  }
  return options
}

// TODO: Make this not mutate the passed in value
const sanitiseNode = value => {
  if (value && value.internal && value.internal.contentDigest) {
    if (value.internal.type === `Site`) {
      delete value.buildTime
      delete value.internal.contentDigest
    }
    if (value.internal.type === `SitePlugin`) {
      delete value.packageJson
      delete value.internal.contentDigest
      delete value.version
      if (value.name === `gatsby-plugin-page-creator`) {
        // make id more stable
        value.id = createContentDigest(
          `${value.name}${JSON.stringify(
            sanitizePageCreatorPluginOptions(value.pluginOptions)
          )}`
        )
      }
    }
    if (value.internal.type === `SitePage`) {
      delete value.internal.contentDigest
      delete value.internal.description
      delete value.pluginCreatorId
      delete value.pluginCreator___NODE
    }
  }

  // we don't care about order of node creation at this point
  delete value.internal.counter

  // loki adds $loki metadata into nodes
  delete value.$loki

  return value
}

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

const loadState = path => {
  const state = v8.deserialize(fs.readFileSync(path))

  const sanitisedState = state.nodes.map(sanitiseNode)

  const newState = new Map()
  sanitisedState
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach(sanitisedNode => {
      newState.set(sanitisedNode.id, sanitisedNode)
    })

  return {
    nodes: newState,
    diskCacheSnapshot: state.diskCacheSnapshot,
    queryResults: state.queryResults,
  }
}

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

const { compareState } = require(`../utils/nodes-diff`)

const useGatsbyNode = run => {
  const r = fs.readdirSync(`plugins`)
  r.forEach(pluginName => {
    const inputPath = path.join(`plugins`, pluginName, `gatsby-node-${run}.js`)
    if (fs.existsSync(inputPath)) {
      fs.copyFileSync(
        inputPath,
        path.join(`plugins`, pluginName, `gatsby-node.js`)
      )
    }
  })
}

const useGatsbyConfig = run => {
  fs.copyFileSync(`gatsby-config-${run}.js`, path.join(`gatsby-config.js`))
}

const useGatsbyQuery = run => {
  const r = fs.readdirSync(`plugins`)
  return r.reduce((acc, pluginName) => {
    const inputPath = path.join(`plugins`, pluginName, `query-${run}.js`)
    if (fs.existsSync(inputPath)) {
      const pagePath = path.join(
        `plugins`,
        pluginName,
        `src`,
        `pages`,
        `${pluginName}.js`
      )

      const { query, expectedResult } = require(path.join(
        process.cwd(),
        inputPath
      ))

      const content = `
      import { graphql } from "gatsby"
export default () => null

export const query = graphql\`
  ${query}
\`
      `

      fs.outputFileSync(pagePath, content)

      acc[pluginName] = expectedResult
      // fs.copyFileSync(
      //   inputPath,
      //   path.join(`plugins`, pluginName, `gatsby-node.js`)
      // )
    }
    return acc
  }, {})
}

const useGatsbyNodeAndConfigAndQuery = (run = 1) => {
  useGatsbyNode(run)
  useGatsbyConfig(run)
  return useGatsbyQuery(run)
}

const build = ({ updatePlugins } = {}) => {
  spawnSync(gatsbyBin, [`clean`])
  let expectedResultsFromRun = useGatsbyNodeAndConfigAndQuery(1)

  const expectedQueryResults = {
    firstRun: expectedResultsFromRun,
  }

  let processOutput

  // First run, get state
  processOutput = spawnSync(gatsbyBin, [`build`], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  if (processOutput.status !== 0) {
    throw new Error(`Gatsby exited with non-zero code`)
  }

  const preBootstrapStateFromFirstRun = loadState(ON_PRE_BOOTSTRAP_FILE_PATH)

  const postBuildStateFromFirstRun = loadState(ON_POST_BUILD_FILE_PATH)

  if (updatePlugins) {
    // Invalidations
    expectedResultsFromRun = useGatsbyNodeAndConfigAndQuery(2)
  }

  expectedQueryResults.secondRun = expectedResultsFromRun

  // Second run, get state and compare with state from previous run
  processOutput = spawnSync(gatsbyBin, [`build`], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  if (processOutput.status !== 0) {
    throw new Error(`Gatsby exited with non-zero code`)
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
      actual: {
        firstRun: postBuildStateFromFirstRun.queryResults,
        secondRun: postBuildStateFromSecondRun.queryResults,
      },
      expected: expectedQueryResults,
    },
  }
}

afterAll(() => {
  // go back to initial
  useGatsbyNodeAndConfigAndQuery(1)

  // delete saved states
  if (fs.existsSync(ON_PRE_BOOTSTRAP_FILE_PATH)) {
    fs.unlinkSync(ON_PRE_BOOTSTRAP_FILE_PATH)
  }
  if (fs.existsSync(ON_POST_BUILD_FILE_PATH)) {
    fs.unlinkSync(ON_POST_BUILD_FILE_PATH)
  }
})

beforeAll(async () => {
  await del([`plugins/**/src/**`])

  useGatsbyNodeAndConfigAndQuery(1)
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

      expect(postBuildStateFromFirstRun).toEqual(preBootstrapStateFromSecondRun)
      expect(postBuildStateFromFirstRun).toEqual(postBuildStateFromSecondRun)
    })

    it(`query results matches expectations`, () => {
      expect(states.queryResults.actual).toEqual(states.queryResults.expected)
    })
  })
})

describe(`some plugins changed between gatsby runs`, () => {
  let states

  beforeAll(() => {
    states = build({
      updatePlugins: true,
    })
  })

  describe(`Nodes`, () => {
    it(`sanity checks`, () => {
      // preconditions - we expect our cache to be empty on first run
      expect(states.nodes.preBootstrapStateFromFirstRun.size).toEqual(0)
    })

    it(`query results matches expectations`, () => {
      expect(states.queryResults.actual).toEqual(states.queryResults.expected)
    })

    describe(`Plugin changes`, () => {
      it(`are not deleted when the owner plugin does not change`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [`gatsby-plugin-stable`])

        expect(postBuildStateFromFirstRun).toEqual(
          preBootstrapStateFromSecondRun
        )

        expect(postBuildStateFromFirstRun).toEqual(postBuildStateFromSecondRun)
      })

      it(`are deleted and recreated when owner plugin changes`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-plugin-independent-node`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`INDEPENDENT_NODE_1`])
          expect(diff.deletions.INDEPENDENT_NODE_1).toBeTruthy()
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`INDEPENDENT_NODE_1`])

          expect(diff.changes.INDEPENDENT_NODE_1.diff).toMatchInlineSnapshot(`
              "  Object {
                  \\"children\\": Array [],
              -   \\"foo\\": \\"bar\\",
              +   \\"foo\\": \\"baz\\",
                  \\"id\\": \\"INDEPENDENT_NODE_1\\",
                  \\"internal\\": Object {
                    \\"contentDigest\\": \\"0\\",
                    \\"owner\\": \\"gatsby-plugin-independent-node\\",
                    \\"type\\": \\"IndependentChanging\\",
                  },
                  \\"parent\\": null,
                }"
            `)
        }
      })

      it(`are deleted and recreated when the owner plugin of a parent changes`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-parent-change-for-transformer`,
          `gatsby-transformer-parent-change`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_parentChangeForTransformer`,
            `parent_parentChangeForTransformer >>> Child`,
          ])

          expect(
            diff.deletions[`parent_parentChangeForTransformer >>> Child`]
          ).toBeTruthy()
          expect(
            diff.deletions[`parent_parentChangeForTransformer`]
          ).toBeTruthy()
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_parentChangeForTransformer`,
            `parent_parentChangeForTransformer >>> Child`,
          ])

          expect(
            diff.changes[`parent_parentChangeForTransformer >>> Child`].diff
          ).toMatchInlineSnapshot(`
              "  Object {
              -   \\"bar\\": undefined,
              +   \\"bar\\": \\"run-2\\",
                  \\"children\\": Array [],
              -   \\"foo\\": \\"run-1\\",
              +   \\"foo\\": undefined,
                  \\"id\\": \\"parent_parentChangeForTransformer >>> Child\\",
                  \\"internal\\": Object {
              -     \\"contentDigest\\": \\"011e1b3b5c83557485e0357e70427b65\\",
              +     \\"contentDigest\\": \\"030fd9177896464496590fc0fe4d45bf\\",
                    \\"owner\\": \\"gatsby-transformer-parent-change\\",
                    \\"type\\": \\"ChildOfParent_ParentChangeForTransformer\\",
                  },
                  \\"parent\\": \\"parent_parentChangeForTransformer\\",
                }"
            `)
          expect(diff.changes[`parent_parentChangeForTransformer`].diff)
            .toMatchInlineSnapshot(`
              "  Object {
              +   \\"bar\\": \\"run-2\\",
                  \\"children\\": Array [
                    \\"parent_parentChangeForTransformer >>> Child\\",
                  ],
              -   \\"foo\\": \\"run-1\\",
                  \\"id\\": \\"parent_parentChangeForTransformer\\",
                  \\"internal\\": Object {
              -     \\"contentDigest\\": \\"a032c69550f5567021eda97cc3a1faf2\\",
              +     \\"contentDigest\\": \\"4a6a70b2f8849535de50f47c609006fe\\",
                    \\"owner\\": \\"gatsby-source-parent-change-for-transformer\\",
                    \\"type\\": \\"Parent_ParentChangeForTransformer\\",
                  },
                  \\"parent\\": null,
                }"
            `)
        }
      })

      it(`are deleted and recreated when the owner plugin of a child changes`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-child-change-for-transformer`,
          `gatsby-transformer-child-change`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_childChangeForTransformer >>> Child`,
            `parent_childChangeForTransformer`,
          ])

          expect(
            diff.deletions[`parent_childChangeForTransformer >>> Child`]
          ).toBeTruthy()

          expect(diff.changes[`parent_childChangeForTransformer`].diff)
            .toMatchInlineSnapshot(`
              "  Object {
              -   \\"children\\": Array [
              -     \\"parent_childChangeForTransformer >>> Child\\",
              -   ],
              +   \\"children\\": Array [],
                  \\"foo\\": \\"run-1\\",
                  \\"id\\": \\"parent_childChangeForTransformer\\",
                  \\"internal\\": Object {
                    \\"contentDigest\\": \\"25f73a6d69ce857a76e0a2cdbc186975\\",
                    \\"owner\\": \\"gatsby-source-child-change-for-transformer\\",
                    \\"type\\": \\"Parent_ChildChangeForTransformer\\",
                  },
                  \\"parent\\": null,
                }"
            `)
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_childChangeForTransformer >>> Child`,
          ])

          expect(
            diff.changes[`parent_childChangeForTransformer >>> Child`].diff
          ).toMatchInlineSnapshot(`
              "  Object {
                  \\"children\\": Array [],
              -   \\"foo\\": \\"bar\\",
              +   \\"foo\\": \\"baz\\",
                  \\"id\\": \\"parent_childChangeForTransformer >>> Child\\",
                  \\"internal\\": Object {
              -     \\"contentDigest\\": \\"ec8c3b932089b083a5380ab085be0633\\",
              +     \\"contentDigest\\": \\"32fe5b6bc0489b6fa0f7eb6a9b563b27\\",
                    \\"owner\\": \\"gatsby-transformer-child-change\\",
                    \\"type\\": \\"ChildOfParent_ChildChangeForTransformer\\",
                  },
                  \\"parent\\": \\"parent_childChangeForTransformer\\",
                }"
            `)
        }
      })

      it(`fields are deleted and recreated when the owner plugin of a node changes`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-parent-change-for-fields`,
          `gatsby-fields-parent-change`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`parent_parentChangeForFields`])

          expect(diff.deletions[`parent_parentChangeForFields`]).toBeTruthy()
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`parent_parentChangeForFields`])

          expect(diff.changes[`parent_parentChangeForFields`].diff)
            .toMatchInlineSnapshot(`
              "  Object {
              +   \\"bar\\": \\"run-2\\",
                  \\"children\\": Array [],
                  \\"fields\\": Object {
              -     \\"bar\\": undefined,
              -     \\"foo\\": \\"run-1\\",
              +     \\"bar\\": \\"run-2\\",
              +     \\"foo\\": undefined,
                  },
              -   \\"foo\\": \\"run-1\\",
                  \\"id\\": \\"parent_parentChangeForFields\\",
                  \\"internal\\": Object {
              -     \\"contentDigest\\": \\"ad237cf525f0ccb39ea0ba07165d4119\\",
              +     \\"contentDigest\\": \\"72122def77d239ba36e9b9729fc53adf\\",
                    \\"fieldOwners\\": Object {
                      \\"bar\\": \\"gatsby-fields-parent-change\\",
                      \\"foo\\": \\"gatsby-fields-parent-change\\",
                    },
                    \\"owner\\": \\"gatsby-source-parent-change-for-fields\\",
                    \\"type\\": \\"Parent_ParentChangeForFields\\",
                  },
                  \\"parent\\": null,
                }"
            `)
        }
      })

      it(`fields are deleted and recreated when the owner plugin of a field changes`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-child-change-for-fields`,
          `gatsby-fields-child-change`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`parent_childChangeForFields`])

          expect(diff.changes[`parent_childChangeForFields`].diff)
            .toMatchInlineSnapshot(`
              "  Object {
                  \\"children\\": Array [],
              -   \\"fields\\": Object {
              -     \\"foo1\\": \\"bar\\",
              -   },
              +   \\"fields\\": Object {},
                  \\"foo\\": \\"run-1\\",
                  \\"id\\": \\"parent_childChangeForFields\\",
                  \\"internal\\": Object {
                    \\"contentDigest\\": \\"893740bfde4b8a6039e939cb0290d626\\",
              -     \\"fieldOwners\\": Object {
              -       \\"foo1\\": \\"gatsby-fields-child-change\\",
              -     },
              +     \\"fieldOwners\\": Object {},
                    \\"owner\\": \\"gatsby-source-child-change-for-fields\\",
                    \\"type\\": \\"Parent_ChildChangeForFields\\",
                  },
                  \\"parent\\": null,
                }"
            `)
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`parent_childChangeForFields`])

          expect(diff.changes[`parent_childChangeForFields`].diff)
            .toMatchInlineSnapshot(`
              "  Object {
                  \\"children\\": Array [],
                  \\"fields\\": Object {
              -     \\"foo1\\": \\"bar\\",
              +     \\"foo2\\": \\"baz\\",
                  },
                  \\"foo\\": \\"run-1\\",
                  \\"id\\": \\"parent_childChangeForFields\\",
                  \\"internal\\": Object {
                    \\"contentDigest\\": \\"893740bfde4b8a6039e939cb0290d626\\",
                    \\"fieldOwners\\": Object {
              -       \\"foo1\\": \\"gatsby-fields-child-change\\",
              +       \\"foo2\\": \\"gatsby-fields-child-change\\",
                    },
                    \\"owner\\": \\"gatsby-source-child-change-for-fields\\",
                    \\"type\\": \\"Parent_ChildChangeForFields\\",
                  },
                  \\"parent\\": null,
                }"
            `)
        }
      })
    })

    describe(`Plugin Additions`, () => {
      it.skip(`Addition of plugin invalidates nodes cache`, () => {})
      it.skip(`Addition of plugin invalidates disk cache`, () => {})

      it(`ensure transformer nodes are created when source plugin is added`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-parent-addition-for-transformer`,
          `gatsby-transformer-parent-addition`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([])
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_parentAdditionForTransformer`,
            `parent_parentAdditionForTransformer >>> Child`,
          ])

          expect(
            diff.additions[`parent_parentAdditionForTransformer`]
          ).toBeTruthy()
          expect(
            diff.additions[`parent_parentAdditionForTransformer >>> Child`]
          ).toBeTruthy()
        }
      })

      it(`ensure transformer nodes are created when transformer plugin is added`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-child-addition-for-transformer`,
          `gatsby-transformer-child-addition`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([])
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_childAdditionForTransformer >>> Child`,
            `parent_childAdditionForTransformer`,
          ])

          expect(
            diff.additions[`parent_childAdditionForTransformer >>> Child`]
          ).toBeTruthy()

          expect(diff.changes[`parent_childAdditionForTransformer`].diff)
            .toMatchInlineSnapshot(`
            "  Object {
            -   \\"children\\": Array [],
            +   \\"children\\": Array [
            +     \\"parent_childAdditionForTransformer >>> Child\\",
            +   ],
                \\"foo\\": \\"run-1\\",
                \\"id\\": \\"parent_childAdditionForTransformer\\",
                \\"internal\\": Object {
                  \\"contentDigest\\": \\"24c80ac557fe30571844672133789fca\\",
                  \\"owner\\": \\"gatsby-source-child-addition-for-transformer\\",
                  \\"type\\": \\"Parent_ChildAdditionForTransformer\\",
                },
                \\"parent\\": null,
              }"
          `)
        }
      })

      it.skip(`ensure fields are created when owner of node is added`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-parent-addition-for-fields`,
          `gatsby-fields-parent-addition`,
        ])
        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )
          expect(diff.dirtyIds).toEqual([])
        }
        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )
          expect(diff.dirtyIds).toEqual([`parent_parentAdditionForFields`])
          expect(diff.additions[`parent_parentAdditionForFields`]).toBeTruthy()
        }
      })

      it(`ensure fields are created when owner of field is added`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-child-addition-for-fields`,
          `gatsby-fields-child-addition`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([])
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`parent_childAdditionForFields`])

          expect(diff.changes[`parent_childAdditionForFields`].diff)
            .toMatchInlineSnapshot(`
            "  Object {
                \\"children\\": Array [],
            +   \\"fields\\": Object {
            +     \\"foo1\\": \\"bar\\",
            +   },
                \\"foo\\": \\"run-1\\",
                \\"id\\": \\"parent_childAdditionForFields\\",
                \\"internal\\": Object {
                  \\"contentDigest\\": \\"73b91e21e8e1825f0719497573dedf53\\",
            +     \\"fieldOwners\\": Object {
            +       \\"foo1\\": \\"gatsby-fields-child-addition\\",
            +     },
                  \\"owner\\": \\"gatsby-source-child-addition-for-fields\\",
                  \\"type\\": \\"Parent_ChildAdditionForFields\\",
                },
                \\"parent\\": null,
              }"
          `)
        }
      })
    })

    describe(`Plugin Deletions`, () => {
      it(`Deletion of plugin invalidates nodes cache`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [`gatsby-plugin-deletion`])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`DELETION_NODE_1`])
          expect(diff.deletions.DELETION_NODE_1).toBeTruthy()
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`DELETION_NODE_1`])
          expect(diff.deletions.DELETION_NODE_1).toBeTruthy()
        }
      })
      it(`Deletion of plugin invalidates disk cache`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getDiskCacheSnapshotSubStateByPlugins(states, [
          `gatsby-plugin-deletion`,
        ])

        // plugin had something in disk cache
        expect(
          (postBuildStateFromFirstRun[`gatsby-plugin-deletion`] || []).length
        ).toEqual(1)
        // cache was deleted in second run
        expect(
          (preBootstrapStateFromSecondRun[`gatsby-plugin-deletion`] || [])
            .length
        ).toEqual(0)

        // finally, end result does not include cache
        expect(
          (postBuildStateFromSecondRun[`gatsby-plugin-deletion`] || []).length
        ).toEqual(0)
      })
      // it(`Deletion of plugin handles child nodes if it is a parent`, () => {})
      // it(`Deletion of plugin handles parent nodes if it is a child`, () => {})
      // it(`Deletion of plugin handles node fields`, () => {})
      it(`ensure transformer nodes are deleted when source plugin is deleted`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-parent-deletion-for-transformer`,
          `gatsby-transformer-parent-deletion`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_parentDeletionForTransformer`,
            `parent_parentDeletionForTransformer >>> Child`,
          ])

          expect(
            diff.deletions[`parent_parentDeletionForTransformer`]
          ).toBeTruthy()
          expect(
            diff.deletions[`parent_parentDeletionForTransformer >>> Child`]
          ).toBeTruthy()
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_parentDeletionForTransformer`,
            `parent_parentDeletionForTransformer >>> Child`,
          ])

          expect(
            diff.deletions[`parent_parentDeletionForTransformer`]
          ).toBeTruthy()
          expect(
            diff.deletions[`parent_parentDeletionForTransformer >>> Child`]
          ).toBeTruthy()
        }
      })

      it(`ensure transformer nodes are deleted when transformer plugin is deleted`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-child-deletion-for-transformer`,
          `gatsby-transformer-child-deletion`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([
            `parent_childDeletionForTransformer >>> Child`,
            `parent_childDeletionForTransformer`,
          ])

          expect(
            diff.deletions[`parent_childDeletionForTransformer >>> Child`]
          ).toBeTruthy()

          expect(diff.changes[`parent_childDeletionForTransformer`].diff)
            .toMatchInlineSnapshot(`
            "  Object {
            -   \\"children\\": Array [
            -     \\"parent_childDeletionForTransformer >>> Child\\",
            -   ],
            +   \\"children\\": Array [],
                \\"foo\\": \\"run-1\\",
                \\"id\\": \\"parent_childDeletionForTransformer\\",
                \\"internal\\": Object {
                  \\"contentDigest\\": \\"c3a86e3891837cae828521bcc99561de\\",
                  \\"owner\\": \\"gatsby-source-child-deletion-for-transformer\\",
                  \\"type\\": \\"Parent_ChildDeletionForTransformer\\",
                },
                \\"parent\\": null,
              }"
          `)
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )
          expect(diff.dirtyIds).toEqual([
            `parent_childDeletionForTransformer >>> Child`,
            `parent_childDeletionForTransformer`,
          ])

          expect(
            diff.deletions[`parent_childDeletionForTransformer >>> Child`]
          ).toBeTruthy()

          expect(diff.changes[`parent_childDeletionForTransformer`].diff)
            .toMatchInlineSnapshot(`
            "  Object {
            -   \\"children\\": Array [
            -     \\"parent_childDeletionForTransformer >>> Child\\",
            -   ],
            +   \\"children\\": Array [],
                \\"foo\\": \\"run-1\\",
                \\"id\\": \\"parent_childDeletionForTransformer\\",
                \\"internal\\": Object {
                  \\"contentDigest\\": \\"c3a86e3891837cae828521bcc99561de\\",
                  \\"owner\\": \\"gatsby-source-child-deletion-for-transformer\\",
                  \\"type\\": \\"Parent_ChildDeletionForTransformer\\",
                },
                \\"parent\\": null,
              }"
          `)
        }
      })

      it.skip(`ensure fields are deleted when owner of node is deleted`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-parent-addition-for-fields`,
          `gatsby-fields-parent-addition`,
        ])
        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )
          expect(diff.dirtyIds).toEqual([])
        }
        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )
          expect(diff.dirtyIds).toEqual([`parent_parentAdditionForFields`])
          expect(diff.additions[`parent_parentAdditionForFields`]).toBeTruthy()
        }
      })

      it(`ensure fields are deleted when owner of field is deleted`, () => {
        const {
          postBuildStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBuildStateFromSecondRun,
        } = getNodesSubStateByPlugins(states, [
          `gatsby-source-child-deletion-for-fields`,
          `gatsby-fields-child-deletion`,
        ])

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`parent_childDeletionForFields`])

          expect(diff.changes[`parent_childDeletionForFields`].diff)
            .toMatchInlineSnapshot(`
            "  Object {
                \\"children\\": Array [],
            -   \\"fields\\": Object {
            -     \\"foo1\\": \\"bar\\",
            -   },
            +   \\"fields\\": Object {},
                \\"foo\\": \\"run-1\\",
                \\"id\\": \\"parent_childDeletionForFields\\",
                \\"internal\\": Object {
                  \\"contentDigest\\": \\"e7fa2815ef392415bcf8d2b46ecb59d1\\",
            -     \\"fieldOwners\\": Object {
            -       \\"foo1\\": \\"gatsby-fields-child-deletion\\",
            -     },
            +     \\"fieldOwners\\": Object {},
                  \\"owner\\": \\"gatsby-source-child-deletion-for-fields\\",
                  \\"type\\": \\"Parent_ChildDeletionForFields\\",
                },
                \\"parent\\": null,
              }"
          `)
        }

        {
          const diff = compareState(
            postBuildStateFromFirstRun,
            postBuildStateFromSecondRun
          )

          expect(diff.dirtyIds).toEqual([`parent_childDeletionForFields`])

          expect(diff.changes[`parent_childDeletionForFields`].diff)
            .toMatchInlineSnapshot(`
            "  Object {
                \\"children\\": Array [],
            -   \\"fields\\": Object {
            -     \\"foo1\\": \\"bar\\",
            -   },
            +   \\"fields\\": Object {},
                \\"foo\\": \\"run-1\\",
                \\"id\\": \\"parent_childDeletionForFields\\",
                \\"internal\\": Object {
                  \\"contentDigest\\": \\"e7fa2815ef392415bcf8d2b46ecb59d1\\",
            -     \\"fieldOwners\\": Object {
            -       \\"foo1\\": \\"gatsby-fields-child-deletion\\",
            -     },
            +     \\"fieldOwners\\": Object {},
                  \\"owner\\": \\"gatsby-source-child-deletion-for-fields\\",
                  \\"type\\": \\"Parent_ChildDeletionForFields\\",
                },
                \\"parent\\": null,
              }"
          `)
        }
      })
    })
  })

  describe(`Disk`, () => {
    it(`sanity checks`, () => {
      // preconditions - we expect our cache to be empty on first run
      Object.values(
        states.diskCacheSnapshot.preBootstrapStateFromFirstRun
      ).forEach(cacheFiles => {
        // we expect disk cache for every plugin to be empty
        expect(cacheFiles).toEqual([])
      })
    })
    it(`preserve disk cache if owner plugin did not changed`, () => {
      const {
        postBuildStateFromFirstRun,
        preBootstrapStateFromSecondRun,
        postBuildStateFromSecondRun,
      } = getDiskCacheSnapshotSubStateByPlugins(states, [`gatsby-cache-stable`])

      // plugin had something in disk cache
      expect(
        (postBuildStateFromFirstRun[`gatsby-cache-stable`] || []).length
      ).toEqual(1)

      // cache was preserved as plugin didn't change
      expect(postBuildStateFromFirstRun).toEqual(preBootstrapStateFromSecondRun)

      // finally, end result is the same
      expect(postBuildStateFromFirstRun).toEqual(postBuildStateFromSecondRun)
    })

    it(`deletes disk cache for plugin if owner plugin changed`, () => {
      const {
        postBuildStateFromFirstRun,
        preBootstrapStateFromSecondRun,
        postBuildStateFromSecondRun,
      } = getDiskCacheSnapshotSubStateByPlugins(states, [
        `gatsby-cache-unstable`,
      ])

      // plugin had something in disk cache
      expect(
        (postBuildStateFromFirstRun[`gatsby-cache-unstable`] || []).length
      ).toEqual(1)
      // cache was deleted in second run
      expect(
        (preBootstrapStateFromSecondRun[`gatsby-cache-unstable`] || []).length
      ).toEqual(0)

      // finally, end result is the same
      expect(postBuildStateFromFirstRun).toEqual(postBuildStateFromSecondRun)
    })
  })
})
