const SOURCE_PLUGIN_NAME = `source/plugin-changed/gatsby-source`
const plugins = [SOURCE_PLUGIN_NAME]

const config = [
  {
    runs: [1, 2],
    plugins,
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  // Node created by changed plugin is removed during invalidation
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`INDEPENDENT_NODE_1`])
    expect(diff.deletions.INDEPENDENT_NODE_1).toBeTruthy()
  }

  // Node created by changed plugin is recreated in second run
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`INDEPENDENT_NODE_1`])
    expect(diff.changes[`INDEPENDENT_NODE_1`].oldValue).toHaveProperty(
      `foo`,
      `bar`
    )
    expect(diff.changes[`INDEPENDENT_NODE_1`].newValue).toHaveProperty(
      `foo`,
      `baz`
    )
  }
}
const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1, 2],
    type: `data`,
    query: graphql`
      {
        allIndependentChanging {
          nodes {
            id
            foo
          }
        }
      }
    `,
  },
]

const queriesTest = ({ dataDiff }) => {
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allIndependentChanging\\": Object {
          \\"nodes\\": Array [
            Object {
    -         \\"foo\\": \\"bar\\",
    +         \\"foo\\": \\"baz\\",
              \\"id\\": \\"INDEPENDENT_NODE_1\\",
            },
          ],
        },
      }"
  `)
}

module.exports = {
  config,
  queriesFixtures,
  queriesTest,
  plugins,
  nodesTest,
}
