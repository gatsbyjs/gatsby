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
  // no node were created after first run
  // node is created after first run
  {
    const diff = compareState(
      preBootstrapStateFromFirstRun,
      postBuildStateFromFirstRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // node existed after cache invalidation
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // node was created after second data sourcing
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

const queriesTest = ({ firstRun, secondRun }) => {
  // type doesn't exist in schema
  expect(firstRun).toMatchInlineSnapshot(`
    Object {
      "typeinfo": null,
    }
  `)
  // type exist in schema
  expect(secondRun).toMatchInlineSnapshot(`
    Object {
      "typeinfo": Object {
        "fields": Array [
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
          Object {
            "name": "foo",
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
