const SOURCE_PLUGIN_NAME = `source-and-transformers-child-nodes/source-added/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-child-nodes/source-added/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Only transformer plugin in first run. Both plugins in second run
const config = [
  {
    runs: [1],
    plugins: [TRANSFORMER_PLUGIN_NAME],
  },
  {
    runs: [2],
    plugins,
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  // No new nodes were created yet since sourcing for second run hasn't happened yet
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // New source and transformer nodes were created as a result of the newly added plugin
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([
      `parent_parentAdditionForTransformer`,
      `parent_parentAdditionForTransformer >>> Child`,
    ])

    expect(diff.additions[`parent_parentAdditionForTransformer`]).toBeTruthy()
    expect(
      diff.additions[`parent_parentAdditionForTransformer >>> Child`]
    ).toBeTruthy()
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [2],
    type: `data`,
    query: graphql`
      {
        allParentParentAdditionForTransformer {
          nodes {
            id
            foo
            childChildOfParentParentAdditionForTransformer {
              id
              foo
            }
          }
        }
      }
    `,
  },
  {
    runs: [1, 2],
    type: `types`,
    query: graphql`
      {
        typeinfoParent: __type(name: "Parent_ParentAdditionForTransformer") {
          fields {
            name
          }
        }

        typeinfoChild: __type(
          name: "ChildOfParent_ParentAdditionForTransformer"
        ) {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesFirstRun, typesSecondRun, dataSecondRun }) => {
  // no parent or child types on first run
  expect(typesFirstRun).toMatchInlineSnapshot(`
    Object {
      "typeinfoChild": null,
      "typeinfoParent": null,
    }
  `)

  // both parent and child types on second run
  expect(typesSecondRun).toMatchInlineSnapshot(`
    Object {
      "typeinfoChild": Object {
        "fields": Array [
          Object {
            "name": "children",
          },
          Object {
            "name": "foo",
          },
          Object {
            "name": "id",
          },
          Object {
            "name": "internal",
          },
          Object {
            "name": "parent",
          },
        ],
      },
      "typeinfoParent": Object {
        "fields": Array [
          Object {
            "name": "childChildOfParentParentAdditionForTransformer",
          },
          Object {
            "name": "children",
          },
          Object {
            "name": "childrenChildOfParentParentAdditionForTransformer",
          },
          Object {
            "name": "foo",
          },
          Object {
            "name": "id",
          },
          Object {
            "name": "internal",
          },
          Object {
            "name": "parent",
          },
        ],
      },
    }
  `)

  // expected query result
  expect(dataSecondRun).toMatchInlineSnapshot(`
    Object {
      "allParentParentAdditionForTransformer": Object {
        "nodes": Array [
          Object {
            "childChildOfParentParentAdditionForTransformer": Object {
              "foo": "bar",
              "id": "parent_parentAdditionForTransformer >>> Child",
            },
            "foo": "bar",
            "id": "parent_parentAdditionForTransformer",
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
