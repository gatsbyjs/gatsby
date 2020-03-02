const fs = require(`fs-extra`)
const { spawnSync } = require(`child_process`)
const path = require(`path`)
const _ = require(`lodash`)
const del = require(`del`)
const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BUILD_FILE_PATH,
} = require(`../utils/constants`)
const {
  useGatsbyNodeAndConfigAndQuery,
} = require(`../utils/select-configuration`)
const { loadState } = require(`../utils/load-state`)

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

const stdio = `pipe`

const build = ({ updatePlugins } = {}) => {
  spawnSync(gatsbyBin, [`clean`], { stdio })
  let expectedResultsFromRun = useGatsbyNodeAndConfigAndQuery(1)

  const expectedQueryResults = {
    firstRun: expectedResultsFromRun,
  }

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
    expectedResultsFromRun = useGatsbyNodeAndConfigAndQuery(2)
  }

  expectedQueryResults.secondRun = expectedResultsFromRun

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

      expect(postBuildStateFromFirstRun).toEqual(preBootstrapStateFromSecondRun)
      expect(postBuildStateFromFirstRun).toEqual(postBuildStateFromSecondRun)
    })

    it.skip(`query results matches expectations`, () => {
      expect(states.queryResults.actual).toEqual(states.queryResults.expected)
    })
  })
})

describe.skip(`some plugins changed between gatsby runs`, () => {
  let states

  beforeAll(() => {
    states = build({
      updatePlugins: true,
    })
  })

  describe.skip(`Nodes`, () => {
    it(`sanity checks`, () => {
      // preconditions - we expect our cache to be empty on first run
      expect(states.nodes.preBootstrapStateFromFirstRun.size).toEqual(0)
    })

    it.skip(`query results matches expectations`, () => {
      console.log(states.queryResults.actual.firstRun[`gatsby-plugin-stable`])
      console.log(states.queryResults.expected.firstRun[`gatsby-plugin-stable`])
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
            -     \\"contentDigest\\": \\"603e50c1fe96279688538ab046d1d70a\\",
            +     \\"contentDigest\\": \\"f784f9722081b56fee8ca34708299a37\\",
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
            -     \\"contentDigest\\": \\"9d6d458358c77dbe8f4247752ebe41f0\\",
            +     \\"contentDigest\\": \\"3021b9f76357d1cffb3c40fabc9e08fb\\",
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
                  \\"contentDigest\\": \\"80e2ed37e11de736be839404c5f373f9\\",
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
            -     \\"contentDigest\\": \\"bd4478bada76e1f5a45a3b326eaec443\\",
            +     \\"contentDigest\\": \\"70f659e959d7d3fb752f811e8b0eb8ad\\",
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
            -     \\"contentDigest\\": \\"e88540d53597617cf99d612601037013\\",
            +     \\"contentDigest\\": \\"3b78e62e87d3f1d8e92d274aa8dbe548\\",
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

          expect(diff.deletions[`parent_childChangeForFields`]).toBeTruthy()
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
                  \\"contentDigest\\": \\"fb9e9b9c26522bceaa1f51c537b2aff2\\",
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
                  \\"contentDigest\\": \\"f85e860f002547e9da9e893e3e44e162\\",
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

          expect(diff.dirtyIds).toEqual([`parent_childAdditionForFields`])
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
                  \\"contentDigest\\": \\"bdf44fdce30b104b4f290d66c2dc3ca1\\",
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
            `parent_childDeletionForTransformer`,
            `parent_childDeletionForTransformer >>> Child`,
          ])

          expect(
            diff.deletions[`parent_childDeletionForTransformer >>> Child`]
          ).toBeTruthy()

          // expect(diff.changes[`parent_childDeletionForTransformer`].diff)
          //   .toMatchInlineSnapshot(`
          //   "  Object {
          //   -   \\"children\\": Array [
          //   -     \\"parent_childDeletionForTransformer >>> Child\\",
          //   -   ],
          //   +   \\"children\\": Array [],
          //       \\"foo\\": \\"run-1\\",
          //       \\"id\\": \\"parent_childDeletionForTransformer\\",
          //       \\"internal\\": Object {
          //         \\"contentDigest\\": \\"872081fdfb66891ee6ccdcd13716a5ce\\",
          //         \\"owner\\": \\"gatsby-source-child-deletion-for-transformer\\",
          //         \\"type\\": \\"Parent_ChildDeletionForTransformer\\",
          //       },
          //       \\"parent\\": null,
          //     }"
          // `)
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
                  \\"contentDigest\\": \\"872081fdfb66891ee6ccdcd13716a5ce\\",
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

          // expect(diff.changes[`parent_childDeletionForFields`].diff)
          //   .toMatchInlineSnapshot(`
          //   "  Object {
          //       \\"children\\": Array [],
          //   -   \\"fields\\": Object {
          //   -     \\"foo1\\": \\"bar\\",
          //   -   },
          //   +   \\"fields\\": Object {},
          //       \\"foo\\": \\"run-1\\",
          //       \\"id\\": \\"parent_childDeletionForFields\\",
          //       \\"internal\\": Object {
          //         \\"contentDigest\\": \\"8f6ce9febd79d1af741b4b7edfa023a5\\",
          //   -     \\"fieldOwners\\": Object {
          //   -       \\"foo1\\": \\"gatsby-fields-child-deletion\\",
          //   -     },
          //   +     \\"fieldOwners\\": Object {},
          //         \\"owner\\": \\"gatsby-source-child-deletion-for-fields\\",
          //         \\"type\\": \\"Parent_ChildDeletionForFields\\",
          //       },
          //       \\"parent\\": null,
          //     }"
          // `)
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
                  \\"contentDigest\\": \\"8f6ce9febd79d1af741b4b7edfa023a5\\",
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
