const SOURCE_PLUGIN_NAME = `source-and-transformers-node-fields/source-added/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-node-fields/source-added/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Transformer plugin in first run. Both plugins in second run.
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
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )
    // there was no nodes, so nothing changed
    expect(diff.dirtyIds).toEqual([])
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )
    // expect new node to be created
    expect(diff.dirtyIds).toEqual([`parent_parentAdditionForFields`])
    // expect node to have field set by transformer
    expect(diff.additions[`parent_parentAdditionForFields`]).toHaveProperty(
      `fields.foo`,
      `bar`
    )
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [2],
    type: `data`,
    query: graphql`
      {
        allParentParentAdditionForFields {
          nodes {
            id
            foo
            fields {
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
        typeinfoParent: __type(name: "Parent_ParentAdditionForFields") {
          fields {
            name
          }
        }

        typeinfoChild: __type(name: "Parent_ParentAdditionForFieldsFields") {
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
            "name": "foo",
          },
        ],
      },
      "typeinfoParent": Object {
        "fields": Array [
          Object {
            "name": "children",
          },
          Object {
            "name": "fields",
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
      "allParentParentAdditionForFields": Object {
        "nodes": Array [
          Object {
            "fields": Object {
              "foo": "bar",
            },
            "foo": "bar",
            "id": "parent_parentAdditionForFields",
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
