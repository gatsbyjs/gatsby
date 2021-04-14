const SOURCE_PLUGIN_NAME = `source/no-changes/gatsby-source`
const plugins = [SOURCE_PLUGIN_NAME]

const config = [
  {
    runs: [1, 2],
    plugins,
  },
]

const nodesTest = ({
  preBootstrapStateFromFirstRun,
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  // node is created after first run
  {
    const diff = compareState(
      preBootstrapStateFromFirstRun,
      postBuildStateFromFirstRun
    )

    expect(diff.dirtyIds).toEqual([`STABLE_NODE_1`])
    expect(diff.additions[`STABLE_NODE_1`]).toHaveProperty(`foo`, `bar`)
  }

  // node created by unchanged plugin was not invalidated before data sourcing
  if (process.env.GATSBY_EXPERIMENTAL_SELECTIVE_CACHE_INVALIDATION) {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // node created by unchanged plugin was not invalidated after data sourcing
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1, 2],
    type: `data`,
    query: graphql`
      {
        allIndependentStable {
          nodes {
            id
            foo
          }
        }
      }
    `,
  },
]

const queriesTest = ({ dataFirstRun, dataSecondRun }) => {
  expect(dataFirstRun).toMatchInlineSnapshot(`
    Object {
      "allIndependentStable": Object {
        "nodes": Array [
          Object {
            "foo": "bar",
            "id": "STABLE_NODE_1",
          },
        ],
      },
    }
  `)
  expect(dataFirstRun).toEqual(dataSecondRun)
}

module.exports = {
  config,
  queriesFixtures,
  queriesTest,
  plugins,
  nodesTest,
}
