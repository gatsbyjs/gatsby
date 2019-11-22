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
    delete value.internal.contentDigest
    delete value.version
  }
  return value
}

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

const build = () => {
  spawnSync(gatsbyBin, [`clean`])

  spawnSync(gatsbyBin, [`build`], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  const preBootstrapStateFromFirstRun = loadState(`./on_pre_bootstrap`)

  const postBootstrapStateFromFirstRun = loadState(`./on_post_bootstrap`)

  // Invalidations

  fs.appendFileSync(
    `./plugins/gatsby-plugin-x/gatsby-node.js`,
    `// Placeholder comment for invalidation`
  )

  // Second run, get state and compare with state from previous run
  spawnSync(gatsbyBin, [`build`], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  const preBootstrapStateFromSecondRun = loadState(`./on_pre_bootstrap`)

  const postBootstrapStateFromSecondRun = loadState(`./on_post_bootstrap`)

  return {
    preBootstrapStateFromFirstRun,
    postBootstrapStateFromFirstRun,
    preBootstrapStateFromSecondRun,
    postBootstrapStateFromSecondRun,
  }
}

describe(`Cache`, () => {
  describe(`Redux`, () => {
    it(`is persisted between builds`, done => {
      spawnSync(gatsbyBin, [`clean`])

      // First run, get state
      spawnSync(gatsbyBin, [`build`], {
        stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
        env: {
          ...process.env,
          NODE_ENV: `production`,
        },
      })

      const preBootstrapStateFromFirstRun = loadState(`./on_pre_bootstrap`)

      const postBootstrapStateFromFirstRun = loadState(`./on_post_bootstrap`)

      expect(preBootstrapStateFromFirstRun.size).toEqual(0)

      // Second run, get state and compare with state from previous run
      spawnSync(gatsbyBin, [`build`], {
        stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
        env: {
          ...process.env,
          NODE_ENV: `production`,
        },
      })

      const preBootstrapStateFromSecondRun = loadState(`./on_pre_bootstrap`)

      expect(postBootstrapStateFromFirstRun).toEqual(
        preBootstrapStateFromSecondRun
      )

      done()
    })

    describe(`Nodes`, () => {
      it.todo(`are not deleted when the owner plugin does not change`)

      it(`are deleted and recreated when owner plugin changes`, done => {
        const {
          preBootstrapStateFromFirstRun,
          postBootstrapStateFromFirstRun,
          preBootstrapStateFromSecondRun,
          postBootstrapStateFromSecondRun,
        } = build()
        expect(preBootstrapStateFromFirstRun.size).toEqual(0)
        expect(postBootstrapStateFromFirstRun).toMatchSnapshot()
        expect(preBootstrapStateFromSecondRun).toMatchSnapshot()
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
              "TEST_NODE": Object {
                "children": Array [],
                "id": "TEST_NODE",
                "internal": Object {
                  "contentDigest": "0",
                  "counter": 17,
                  "owner": "gatsby-plugin-x",
                  "type": "X",
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
            "changes": Object {},
            "deletions": Object {},
          }
        `)
        done()
      })

      it.todo(
        `are deleted and recreated when the owner plugin of a parent changes`
      )

      it.todo(
        `are deleted and recreated when the owner plugin of a child changes`
      )
    })

    describe(`Fields`, () => {
      it.todo(`are deleted and recreated when owner plugin changes`, () => {})
    })

    describe(`Inference Metadata`, () => {})
  })
  describe(`Disk`, () => {})
})
