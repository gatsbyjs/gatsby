const fs = require(`fs`)
const { spawnSync } = require(`child_process`)
const path = require(`path`)
const v8 = require(`v8`)
const _ = require(`lodash`)

// TODO: Make this not mutate the passed in value
const sanitiseNode = value => {
  if (value && value.buildTime) {
    delete value.buildTime
    delete value.internal.contentDigest
  }
  if (
    value &&
    value.internal &&
    value.internal.contentDigest &&
    value.internal.type === `SitePlugin`
  ) {
    delete value.packageJson
    delete value.internal.contentDigest
    delete value.version
  }
  return value
}

const getSubStateByPlugins = (state, pluginNamesArray) =>
  _.mapValues(state, stateShard => {
    const filteredMap = new Map()

    stateShard.forEach(node => {
      if (pluginNamesArray.includes(node.internal.owner)) {
        filteredMap.set(node.id, node)
      }
    })

    return filteredMap
  })

const loadState = path => {
  const state = v8.deserialize(fs.readFileSync(path))
  state.forEach((node, index) => {
    state.set(index, sanitiseNode(node))
  })
  return state
}

// expect.addSnapshotSerializer({
//   test(value) {
//     return value && value.buildTime
//   },
//   print(value, serialize) {
//     delete value.buildTime
//     delete value.internal.contentDigest
//     return serialize(value)
//   },
// })

// expect.addSnapshotSerializer({
//   test(value) {
//     return (
//       value &&
//       value.internal &&
//       value.internal.contentDigest &&
//       value.internal.type === `SitePlugin`
//     )
//   },
//   print(value, serialize) {
//     delete value.internal.contentDigest
//     delete value.version
//     return serialize(value)
//   },
// })

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

const { compareState } = require(`./changes`)

const useGatsbyNode = (run = 1) => {
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

const build = () => {
  spawnSync(gatsbyBin, [`clean`])
  useGatsbyNode(1)

  let processOutput
  processOutput = spawnSync(gatsbyBin, [`build`], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      EXIT_ON_POST_BOOTSTRAP: `1`,
      NODE_ENV: `production`,
    },
  })

  if (processOutput.status !== 0) {
    throw new Error(`Gatsby exited with non-zero code`)
  }

  const preBootstrapStateFromFirstRun = loadState(`./on_pre_bootstrap.state`)

  const postBootstrapStateFromFirstRun = loadState(`./on_post_bootstrap.state`)

  // Invalidations
  useGatsbyNode(2)

  // Second run, get state and compare with state from previous run
  processOutput = spawnSync(gatsbyBin, [`build`], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      EXIT_ON_POST_BOOTSTRAP: `1`,
      NODE_ENV: `production`,
    },
  })

  if (processOutput.status !== 0) {
    throw new Error(`Gatsby exited with non-zero code`)
  }

  const preBootstrapStateFromSecondRun = loadState(`./on_pre_bootstrap.state`)

  const postBootstrapStateFromSecondRun = loadState(`./on_post_bootstrap.state`)

  return {
    preBootstrapStateFromFirstRun,
    postBootstrapStateFromFirstRun,
    preBootstrapStateFromSecondRun,
    postBootstrapStateFromSecondRun,
  }
}

describe(`Cache`, () => {
  beforeAll(() => {
    useGatsbyNode(1)
  })

  describe(`Redux`, () => {
    it(`is persisted between builds`, done => {
      spawnSync(gatsbyBin, [`clean`])

      // First run, get state
      spawnSync(gatsbyBin, [`build`], {
        stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
        env: {
          ...process.env,
          EXIT_ON_POST_BOOTSTRAP: `1`,
          NODE_ENV: `production`,
        },
      })

      const preBootstrapStateFromFirstRun = loadState(
        `./on_pre_bootstrap.state`
      )

      const postBootstrapStateFromFirstRun = loadState(
        `./on_post_bootstrap.state`
      )

      expect(preBootstrapStateFromFirstRun.size).toEqual(0)

      // Second run, get state and compare with state from previous run
      spawnSync(gatsbyBin, [`build`], {
        stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
        env: {
          ...process.env,
          EXIT_ON_POST_BOOTSTRAP: `1`,
          NODE_ENV: `production`,
        },
      })

      const preBootstrapStateFromSecondRun = loadState(
        `./on_pre_bootstrap.state`
      )

      expect(postBootstrapStateFromFirstRun).toEqual(
        preBootstrapStateFromSecondRun
      )

      done()
    })

    describe.only(`Nodes`, () => {
      let states

      beforeAll(() => {
        states = build()
      })

      it(`sanity checks`, () => {
        // preconditions - we expect our cache to be empty on first run
        expect(states.preBootstrapStateFromFirstRun.size).toEqual(0)

        // test-dev only snapshots to see what's happening
        expect(states.postBootstrapStateFromFirstRun).toMatchSnapshot()
        expect(states.preBootstrapStateFromSecondRun).toMatchSnapshot()
        expect(states.postBootstrapStateFromSecondRun).toMatchSnapshot()
      })

      it(`are not deleted when the owner plugin does not change`, () => {
        const {
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = getSubStateByPlugins(states, [`gatsby-plugin-stable`])

        const postCacheInvalidationDiff = compareState(
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun
        )

        expect(postBootstrapStateFromFirstRun).toEqual(
          preBootstrapStateFromSecondRun
        )

        expect(postCacheInvalidationDiff).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {},
            "deletions": Object {},
          }
        `)

        expect(
          compareState(
            postBootstrapStateFromFirstRun,
            postBootstrapStateFromSecondRun
          )
        ).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {},
            "deletions": Object {},
          }
        `)
      })

      it(`are deleted and recreated when owner plugin changes`, () => {
        const {
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = getSubStateByPlugins(states, [`gatsby-plugin-independent-node`])

        expect(
          compareState(
            postBootstrapStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )
        ).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {},
            "deletions": Object {
              "INDEPENDENT_NODE_1": Object {
                "children": Array [],
                "foo": "bar",
                "id": "INDEPENDENT_NODE_1",
                "internal": Object {
                  "contentDigest": "0",
                  "counter": 28,
                  "owner": "gatsby-plugin-independent-node",
                  "type": "IndependentChanging",
                },
                "parent": null,
              },
            },
          }
        `)
        expect(
          compareState(
            postBootstrapStateFromFirstRun,
            postBootstrapStateFromSecondRun
          )
        ).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {
              "INDEPENDENT_NODE_1": Object {
                "id": "INDEPENDENT_NODE_1",
                "newValue": Object {
                  "children": Array [],
                  "foo": "baz",
                  "id": "INDEPENDENT_NODE_1",
                  "internal": Object {
                    "contentDigest": "0",
                    "counter": 28,
                    "owner": "gatsby-plugin-independent-node",
                    "type": "IndependentChanging",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [],
                  "foo": "bar",
                  "id": "INDEPENDENT_NODE_1",
                  "internal": Object {
                    "contentDigest": "0",
                    "counter": 28,
                    "owner": "gatsby-plugin-independent-node",
                    "type": "IndependentChanging",
                  },
                  "parent": null,
                },
              },
            },
            "deletions": Object {},
          }
        `)
      })

      it(`are deleted and recreated when the owner plugin of a parent changes`, () => {
        const {
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = getSubStateByPlugins(states, [
          `gatsby-source-parent-change`,
          `gatsby-transformer-parent-change`,
        ])

        expect(
          compareState(
            postBootstrapStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )
        ).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {},
            "deletions": Object {
              "4886e795-4b87-5964-b308-112031bdaf88": Object {
                "bar": undefined,
                "children": Array [],
                "foo": "run-1",
                "id": "4886e795-4b87-5964-b308-112031bdaf88",
                "internal": Object {
                  "contentDigest": "96dd125d43f25f0bba42a7b4b7ba4885",
                  "counter": 30,
                  "owner": "gatsby-transformer-parent-change",
                  "type": "ChildOfParent_ParentChange",
                },
                "parent": "parent_parentChange",
              },
              "parent_parentChange": Object {
                "children": Array [
                  "4886e795-4b87-5964-b308-112031bdaf88",
                ],
                "foo": "run-1",
                "id": "parent_parentChange",
                "internal": Object {
                  "contentDigest": "aede568d9b5cf8ae620c06a9fa57f456",
                  "counter": 29,
                  "owner": "gatsby-source-parent-change",
                  "type": "Parent_ParentChange",
                },
                "parent": null,
              },
            },
          }
        `)

        expect(
          compareState(
            postBootstrapStateFromFirstRun,
            postBootstrapStateFromSecondRun
          )
        ).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {
              "4886e795-4b87-5964-b308-112031bdaf88": Object {
                "id": "4886e795-4b87-5964-b308-112031bdaf88",
                "newValue": Object {
                  "bar": "run-2",
                  "children": Array [],
                  "foo": undefined,
                  "id": "4886e795-4b87-5964-b308-112031bdaf88",
                  "internal": Object {
                    "contentDigest": "51f401f9d5b7fb4fd7c93dc1d0a30ae7",
                    "counter": 30,
                    "owner": "gatsby-transformer-parent-change",
                    "type": "ChildOfParent_ParentChange",
                  },
                  "parent": "parent_parentChange",
                },
                "oldValue": Object {
                  "bar": undefined,
                  "children": Array [],
                  "foo": "run-1",
                  "id": "4886e795-4b87-5964-b308-112031bdaf88",
                  "internal": Object {
                    "contentDigest": "96dd125d43f25f0bba42a7b4b7ba4885",
                    "counter": 30,
                    "owner": "gatsby-transformer-parent-change",
                    "type": "ChildOfParent_ParentChange",
                  },
                  "parent": "parent_parentChange",
                },
              },
              "parent_parentChange": Object {
                "id": "parent_parentChange",
                "newValue": Object {
                  "bar": "run-2",
                  "children": Array [
                    "4886e795-4b87-5964-b308-112031bdaf88",
                  ],
                  "id": "parent_parentChange",
                  "internal": Object {
                    "contentDigest": "5d9d1ac97e627eff9946d1473a70bb19",
                    "counter": 29,
                    "owner": "gatsby-source-parent-change",
                    "type": "Parent_ParentChange",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [
                    "4886e795-4b87-5964-b308-112031bdaf88",
                  ],
                  "foo": "run-1",
                  "id": "parent_parentChange",
                  "internal": Object {
                    "contentDigest": "aede568d9b5cf8ae620c06a9fa57f456",
                    "counter": 29,
                    "owner": "gatsby-source-parent-change",
                    "type": "Parent_ParentChange",
                  },
                  "parent": null,
                },
              },
            },
            "deletions": Object {},
          }
        `)
      })

      // this test case is skipped now because it's not handled in code itself
      it(`are deleted and recreated when the owner plugin of a child changes`, () => {
        const {
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = getSubStateByPlugins(states, [
          `gatsby-source-child-change`,
          `gatsby-transformer-child-change`,
        ])

        expect(
          compareState(
            postBootstrapStateFromFirstRun,
            preBootstrapStateFromSecondRun
          )
        ).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {
              "parent_childChange": Object {
                "id": "parent_childChange",
                "newValue": Object {
                  "children": Array [],
                  "foo": "run-1",
                  "id": "parent_childChange",
                  "internal": Object {
                    "contentDigest": "265623643e8806ecc810413fcf1ccefa",
                    "counter": 31,
                    "owner": "gatsby-source-child-change",
                    "type": "Parent_ChildChange",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [
                    "358f53bc-3eef-5881-a226-042304a159e3",
                  ],
                  "foo": "run-1",
                  "id": "parent_childChange",
                  "internal": Object {
                    "contentDigest": "265623643e8806ecc810413fcf1ccefa",
                    "counter": 31,
                    "owner": "gatsby-source-child-change",
                    "type": "Parent_ChildChange",
                  },
                  "parent": null,
                },
              },
            },
            "deletions": Object {
              "358f53bc-3eef-5881-a226-042304a159e3": Object {
                "children": Array [],
                "foo": "bar",
                "id": "358f53bc-3eef-5881-a226-042304a159e3",
                "internal": Object {
                  "contentDigest": "8072e58493504423579431f250d1846a",
                  "counter": 32,
                  "owner": "gatsby-transformer-child-change",
                  "type": "ChildOfParent_ChildChange",
                },
                "parent": "parent_childChange",
              },
            },
          }
        `)

        expect(
          compareState(
            postBootstrapStateFromFirstRun,
            postBootstrapStateFromSecondRun
          )
        ).toMatchInlineSnapshot(`
          Object {
            "additions": Object {},
            "changes": Object {
              "358f53bc-3eef-5881-a226-042304a159e3": Object {
                "id": "358f53bc-3eef-5881-a226-042304a159e3",
                "newValue": Object {
                  "children": Array [],
                  "foo": "baz",
                  "id": "358f53bc-3eef-5881-a226-042304a159e3",
                  "internal": Object {
                    "contentDigest": "3f488c5264ccc0164818775b3ad38e52",
                    "counter": 32,
                    "owner": "gatsby-transformer-child-change",
                    "type": "ChildOfParent_ChildChange",
                  },
                  "parent": "parent_childChange",
                },
                "oldValue": Object {
                  "children": Array [],
                  "foo": "bar",
                  "id": "358f53bc-3eef-5881-a226-042304a159e3",
                  "internal": Object {
                    "contentDigest": "8072e58493504423579431f250d1846a",
                    "counter": 32,
                    "owner": "gatsby-transformer-child-change",
                    "type": "ChildOfParent_ChildChange",
                  },
                  "parent": "parent_childChange",
                },
              },
            },
            "deletions": Object {},
          }
        `)
      })
    })

    describe(`Fields`, () => {
      it.todo(`are deleted and recreated when owner plugin changes`, () => {})
    })
  })
  describe(`Disk`, () => {})
})
