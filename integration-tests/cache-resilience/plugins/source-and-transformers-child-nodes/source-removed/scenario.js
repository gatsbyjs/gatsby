const SOURCE_PLUGIN_NAME = `source-and-transformers-child-nodes/source-removed/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-child-nodes/source-removed/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Both plugins in first run. Only transformer plugin in second run.
const config = [
  {
    runs: [1],
    plugins,
  },
  {
    runs: [2],
    plugins: [TRANSFORMER_PLUGIN_NAME],
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  // Source plugin was removed so both Nodes created by it and children are removed during invalidation
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([
      `parent_parentDeletionForTransformer`,
      `parent_parentDeletionForTransformer >>> Child`,
    ])

    expect(diff.deletions[`parent_parentDeletionForTransformer`]).toBeTruthy()
    expect(
      diff.deletions[`parent_parentDeletionForTransformer >>> Child`]
    ).toBeTruthy()
  }

  // Nodes are not recreated since source plugin was removed
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([
      `parent_parentDeletionForTransformer`,
      `parent_parentDeletionForTransformer >>> Child`,
    ])

    expect(diff.deletions[`parent_parentDeletionForTransformer`]).toBeTruthy()
    expect(
      diff.deletions[`parent_parentDeletionForTransformer >>> Child`]
    ).toBeTruthy()
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1],
    type: `data`,
    query: graphql`
      {
        allParentParentDeletionForTransformer {
          nodes {
            id
            foo
            childChildOfParentParentDeletionForTransformer {
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
        typeinfoParent: __type(name: "Parent_ParentDeletionForTransformer") {
          fields {
            name
          }
        }

        typeinfoChild: __type(
          name: "ChildOfParent_ParentDeletionForTransformer"
        ) {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesFirstRun, typesSecondRun, dataFirstRun }) => {
  // both parent and child types on first run
  expect(typesFirstRun).toMatchInlineSnapshot(`
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
            "name": "childChildOfParentParentDeletionForTransformer",
          },
          Object {
            "name": "children",
          },
          Object {
            "name": "childrenChildOfParentParentDeletionForTransformer",
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

  // no parent or child types on second run
  expect(typesSecondRun).toMatchInlineSnapshot(`
    Object {
      "typeinfoChild": null,
      "typeinfoParent": null,
    }
  `)

  // expected query result
  expect(dataFirstRun).toMatchInlineSnapshot(`
    Object {
      "allParentParentDeletionForTransformer": Object {
        "nodes": Array [
          Object {
            "childChildOfParentParentDeletionForTransformer": Object {
              "foo": "run-1",
              "id": "parent_parentDeletionForTransformer >>> Child",
            },
            "foo": "run-1",
            "id": "parent_parentDeletionForTransformer",
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
