const SOURCE_PLUGIN_NAME = `source/plugin-added/gatsby-source`
const plugins = [SOURCE_PLUGIN_NAME]

const config = [
  {
    runs: [2],
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
  // No node was created because there is no plugin
  {
    const diff = compareState(
      preBootstrapStateFromFirstRun,
      postBuildStateFromFirstRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // No node so nothing to invalidate
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // Node was created by a plugin that was added
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`ADDITION_NODE_1`])
    expect(diff.additions.ADDITION_NODE_1).toBeTruthy()
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1, 2],
    type: `types`,
    query: graphql`
      {
        typeinfo: __type(name: "Addition") {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesFirstRun, typesSecondRun }) => {
  // type doesn't exist in schema
  expect(typesFirstRun).toMatchInlineSnapshot(`
    Object {
      "typeinfo": null,
    }
  `)
  // type exist in schema
  expect(typesSecondRun).toMatchInlineSnapshot(`
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
}

module.exports = {
  config,
  queriesFixtures,
  queriesTest,
  plugins,
  nodesTest,
}
