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

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

const { compareState } = require(`../utils/nodes-diff`)

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
                  "counter": 36,
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
                    "counter": 36,
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
                    "counter": 36,
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
          `gatsby-source-parent-change-for-transformer`,
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
              "2131d29a-296c-5f73-affc-e422bec644fe": Object {
                "bar": undefined,
                "children": Array [],
                "foo": "run-1",
                "id": "2131d29a-296c-5f73-affc-e422bec644fe",
                "internal": Object {
                  "contentDigest": "cbc07ead8c18c9d616f0004a893d5cf3",
                  "counter": 38,
                  "owner": "gatsby-transformer-parent-change",
                  "type": "ChildOfParent_ParentChangeForTransformer",
                },
                "parent": "parent_parentChangeForTransformer",
              },
              "parent_parentChangeForTransformer": Object {
                "children": Array [
                  "2131d29a-296c-5f73-affc-e422bec644fe",
                ],
                "foo": "run-1",
                "id": "parent_parentChangeForTransformer",
                "internal": Object {
                  "contentDigest": "a032c69550f5567021eda97cc3a1faf2",
                  "counter": 37,
                  "owner": "gatsby-source-parent-change-for-transformer",
                  "type": "Parent_ParentChangeForTransformer",
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
              "2131d29a-296c-5f73-affc-e422bec644fe": Object {
                "id": "2131d29a-296c-5f73-affc-e422bec644fe",
                "newValue": Object {
                  "bar": "run-2",
                  "children": Array [],
                  "foo": undefined,
                  "id": "2131d29a-296c-5f73-affc-e422bec644fe",
                  "internal": Object {
                    "contentDigest": "a33e2263d5a5f42473e111fb400cef3d",
                    "counter": 38,
                    "owner": "gatsby-transformer-parent-change",
                    "type": "ChildOfParent_ParentChangeForTransformer",
                  },
                  "parent": "parent_parentChangeForTransformer",
                },
                "oldValue": Object {
                  "bar": undefined,
                  "children": Array [],
                  "foo": "run-1",
                  "id": "2131d29a-296c-5f73-affc-e422bec644fe",
                  "internal": Object {
                    "contentDigest": "cbc07ead8c18c9d616f0004a893d5cf3",
                    "counter": 38,
                    "owner": "gatsby-transformer-parent-change",
                    "type": "ChildOfParent_ParentChangeForTransformer",
                  },
                  "parent": "parent_parentChangeForTransformer",
                },
              },
              "parent_parentChangeForTransformer": Object {
                "id": "parent_parentChangeForTransformer",
                "newValue": Object {
                  "bar": "run-2",
                  "children": Array [
                    "2131d29a-296c-5f73-affc-e422bec644fe",
                  ],
                  "id": "parent_parentChangeForTransformer",
                  "internal": Object {
                    "contentDigest": "4a6a70b2f8849535de50f47c609006fe",
                    "counter": 37,
                    "owner": "gatsby-source-parent-change-for-transformer",
                    "type": "Parent_ParentChangeForTransformer",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [
                    "2131d29a-296c-5f73-affc-e422bec644fe",
                  ],
                  "foo": "run-1",
                  "id": "parent_parentChangeForTransformer",
                  "internal": Object {
                    "contentDigest": "a032c69550f5567021eda97cc3a1faf2",
                    "counter": 37,
                    "owner": "gatsby-source-parent-change-for-transformer",
                    "type": "Parent_ParentChangeForTransformer",
                  },
                  "parent": null,
                },
              },
            },
            "deletions": Object {},
          }
        `)
      })

      it(`are deleted and recreated when the owner plugin of a child changes`, () => {
        const {
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = getSubStateByPlugins(states, [
          `gatsby-source-child-change-for-transformer`,
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
              "parent_childChangeForTransformer": Object {
                "id": "parent_childChangeForTransformer",
                "newValue": Object {
                  "children": Array [],
                  "foo": "run-1",
                  "id": "parent_childChangeForTransformer",
                  "internal": Object {
                    "contentDigest": "25f73a6d69ce857a76e0a2cdbc186975",
                    "counter": 39,
                    "owner": "gatsby-source-child-change-for-transformer",
                    "type": "Parent_ChildChangeForTransformer",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [
                    "3b0c942e-b51f-587b-b37d-b36c5e9af8fa",
                  ],
                  "foo": "run-1",
                  "id": "parent_childChangeForTransformer",
                  "internal": Object {
                    "contentDigest": "25f73a6d69ce857a76e0a2cdbc186975",
                    "counter": 39,
                    "owner": "gatsby-source-child-change-for-transformer",
                    "type": "Parent_ChildChangeForTransformer",
                  },
                  "parent": null,
                },
              },
            },
            "deletions": Object {
              "3b0c942e-b51f-587b-b37d-b36c5e9af8fa": Object {
                "children": Array [],
                "foo": "bar",
                "id": "3b0c942e-b51f-587b-b37d-b36c5e9af8fa",
                "internal": Object {
                  "contentDigest": "59b3a74325cbf2001bc21eb662f1e297",
                  "counter": 40,
                  "owner": "gatsby-transformer-child-change",
                  "type": "ChildOfParent_ChildChangeForTransformer",
                },
                "parent": "parent_childChangeForTransformer",
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
              "3b0c942e-b51f-587b-b37d-b36c5e9af8fa": Object {
                "id": "3b0c942e-b51f-587b-b37d-b36c5e9af8fa",
                "newValue": Object {
                  "children": Array [],
                  "foo": "baz",
                  "id": "3b0c942e-b51f-587b-b37d-b36c5e9af8fa",
                  "internal": Object {
                    "contentDigest": "3bca2830e09b3c30b3ca76dccdaf5e8b",
                    "counter": 40,
                    "owner": "gatsby-transformer-child-change",
                    "type": "ChildOfParent_ChildChangeForTransformer",
                  },
                  "parent": "parent_childChangeForTransformer",
                },
                "oldValue": Object {
                  "children": Array [],
                  "foo": "bar",
                  "id": "3b0c942e-b51f-587b-b37d-b36c5e9af8fa",
                  "internal": Object {
                    "contentDigest": "59b3a74325cbf2001bc21eb662f1e297",
                    "counter": 40,
                    "owner": "gatsby-transformer-child-change",
                    "type": "ChildOfParent_ChildChangeForTransformer",
                  },
                  "parent": "parent_childChangeForTransformer",
                },
              },
            },
            "deletions": Object {},
          }
        `)
      })

      it(`to be named`, () => {
        const {
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = getSubStateByPlugins(states, [
          `gatsby-source-parent-change-for-fields`,
          `gatsby-fields-parent-change`,
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
              "parent_parentChangeForFields": Object {
                "children": Array [],
                "fields": Object {
                  "bar": undefined,
                  "foo": "run-1",
                },
                "foo": "run-1",
                "id": "parent_parentChangeForFields",
                "internal": Object {
                  "contentDigest": "ad237cf525f0ccb39ea0ba07165d4119",
                  "counter": 41,
                  "fieldOwners": Object {
                    "bar": "gatsby-fields-parent-change",
                    "foo": "gatsby-fields-parent-change",
                  },
                  "owner": "gatsby-source-parent-change-for-fields",
                  "type": "Parent_ParentChangeForFields",
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
              "parent_parentChangeForFields": Object {
                "id": "parent_parentChangeForFields",
                "newValue": Object {
                  "bar": "run-2",
                  "children": Array [],
                  "fields": Object {
                    "bar": "run-2",
                    "foo": undefined,
                  },
                  "id": "parent_parentChangeForFields",
                  "internal": Object {
                    "contentDigest": "72122def77d239ba36e9b9729fc53adf",
                    "counter": 41,
                    "fieldOwners": Object {
                      "bar": "gatsby-fields-parent-change",
                      "foo": "gatsby-fields-parent-change",
                    },
                    "owner": "gatsby-source-parent-change-for-fields",
                    "type": "Parent_ParentChangeForFields",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [],
                  "fields": Object {
                    "bar": undefined,
                    "foo": "run-1",
                  },
                  "foo": "run-1",
                  "id": "parent_parentChangeForFields",
                  "internal": Object {
                    "contentDigest": "ad237cf525f0ccb39ea0ba07165d4119",
                    "counter": 41,
                    "fieldOwners": Object {
                      "bar": "gatsby-fields-parent-change",
                      "foo": "gatsby-fields-parent-change",
                    },
                    "owner": "gatsby-source-parent-change-for-fields",
                    "type": "Parent_ParentChangeForFields",
                  },
                  "parent": null,
                },
              },
            },
            "deletions": Object {},
          }
        `)
      })

      it(`to be named #2`, () => {
        const {
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = getSubStateByPlugins(states, [
          `gatsby-source-child-change-for-fields`,
          `gatsby-fields-child-change`,
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
              "parent_childChangeForFields": Object {
                "id": "parent_childChangeForFields",
                "newValue": Object {
                  "children": Array [],
                  "fields": Object {},
                  "foo": "run-1",
                  "id": "parent_childChangeForFields",
                  "internal": Object {
                    "contentDigest": "893740bfde4b8a6039e939cb0290d626",
                    "counter": 42,
                    "fieldOwners": Object {},
                    "owner": "gatsby-source-child-change-for-fields",
                    "type": "Parent_ChildChangeForFields",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [],
                  "fields": Object {
                    "foo1": "bar",
                  },
                  "foo": "run-1",
                  "id": "parent_childChangeForFields",
                  "internal": Object {
                    "contentDigest": "893740bfde4b8a6039e939cb0290d626",
                    "counter": 42,
                    "fieldOwners": Object {
                      "foo1": "gatsby-fields-child-change",
                    },
                    "owner": "gatsby-source-child-change-for-fields",
                    "type": "Parent_ChildChangeForFields",
                  },
                  "parent": null,
                },
              },
            },
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
            "changes": Object {
              "parent_childChangeForFields": Object {
                "id": "parent_childChangeForFields",
                "newValue": Object {
                  "children": Array [],
                  "fields": Object {
                    "foo2": "baz",
                  },
                  "foo": "run-1",
                  "id": "parent_childChangeForFields",
                  "internal": Object {
                    "contentDigest": "893740bfde4b8a6039e939cb0290d626",
                    "counter": 42,
                    "fieldOwners": Object {
                      "foo2": "gatsby-fields-child-change",
                    },
                    "owner": "gatsby-source-child-change-for-fields",
                    "type": "Parent_ChildChangeForFields",
                  },
                  "parent": null,
                },
                "oldValue": Object {
                  "children": Array [],
                  "fields": Object {
                    "foo1": "bar",
                  },
                  "foo": "run-1",
                  "id": "parent_childChangeForFields",
                  "internal": Object {
                    "contentDigest": "893740bfde4b8a6039e939cb0290d626",
                    "counter": 42,
                    "fieldOwners": Object {
                      "foo1": "gatsby-fields-child-change",
                    },
                    "owner": "gatsby-source-child-change-for-fields",
                    "type": "Parent_ChildChangeForFields",
                  },
                  "parent": null,
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
