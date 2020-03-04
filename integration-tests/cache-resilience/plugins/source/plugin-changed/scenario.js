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
  // node created by changed plugin is no longer in nodes store
  // after cache invalidation
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`INDEPENDENT_NODE_1`])
    expect(diff.deletions.INDEPENDENT_NODE_1).toBeTruthy()
  }

  // node created by changed plugin is changed
  // after second data sourcing
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
    expect(diff.changes[`INDEPENDENT_NODE_1`].diff).toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
      -   \\"foo\\": \\"bar\\",
      +   \\"foo\\": \\"baz\\",
          \\"id\\": \\"INDEPENDENT_NODE_1\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"0\\",
            \\"owner\\": \\"source/plugin-changed/gatsby-source\\",
            \\"type\\": \\"IndependentChanging\\",
          },
          \\"parent\\": null,
        }"
    `)
  }
}
const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1, 2],
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

const queriesTest = ({ firstRun, diff }) => {
  expect(firstRun).toMatchInlineSnapshot(`
    Object {
      "allIndependentChanging": Object {
        "nodes": Array [
          Object {
            "foo": "bar",
            "id": "INDEPENDENT_NODE_1",
          },
        ],
      },
    }
  `)
  expect(diff).toMatchInlineSnapshot(`
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
