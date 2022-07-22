const SOURCE_PLUGIN_NAME = `source/plugin-removed/gatsby-source`
const plugins = [SOURCE_PLUGIN_NAME]

const config = [
  {
    runs: [1],
    plugins,
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  // Node created by deleted plugin is removed during invalidation
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`DELETION_NODE_1`])
    expect(diff.deletions.DELETION_NODE_1).toBeTruthy()
  }

  // Node created by removed plugin is no longer in nodes store
  // after second data sourcing
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`DELETION_NODE_1`])
    expect(diff.deletions.DELETION_NODE_1).toBeTruthy()
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1, 2],
    type: `types`,
    query: graphql`
      {
        typeinfo: __type(name: "Deletion") {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesFirstRun, typesSecondRun }) => {
  // type exist in schema
  expect(typesFirstRun).toMatchInlineSnapshot(`
    Object {
      "typeinfo": Object {
        "fields": Array [
          Object {
            "name": "foo",
          },
          Object {
            "name": "id",
          },
          Object {
            "name": "parent",
          },
          Object {
            "name": "children",
          },
          Object {
            "name": "internal",
          },
        ],
      },
    }
  `)
  // type doesn't exist in schema
  expect(typesSecondRun).toMatchInlineSnapshot(`
    Object {
      "typeinfo": null,
    }
  `)
}

module.exports = {
  config,
  queriesFixtures,
  queriesTest,
  plugins,
  nodesTest,
}
