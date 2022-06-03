const SOURCE_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-added/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-added/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Only source plugin in first run. Both plugins in second run
const config = [
  {
    runs: [1],
    plugins: [SOURCE_PLUGIN_NAME],
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
  if (process.env.GATSBY_EXPERIMENTAL_SELECTIVE_CACHE_INVALIDATION) {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    // there was nothing to invalidate
    expect(diff.dirtyIds).toEqual([])
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    // source node was changed
    expect(diff.dirtyIds).toEqual([`parent_childAdditionForFields`])

    // field and fieldOwner was added to source node
    expect(diff.changes[`parent_childAdditionForFields`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
      +   \\"fields\\": Object {
      +     \\"foo1\\": \\"bar\\",
      +   },
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childAdditionForFields\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"b6d6df9ccdfc5388cde03e3140520cf5\\",
      +     \\"fieldOwners\\": Object {
      +       \\"foo1\\": \\"source-and-transformers-node-fields/transformer-added/gatsby-transformer\\",
      +     },
            \\"owner\\": \\"source-and-transformers-node-fields/transformer-added/gatsby-source\\",
            \\"type\\": \\"Parent_ChildAdditionForFields\\",
          },
          \\"parent\\": null,
        }"
    `)
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1],
    type: `data`,
    query: graphql`
      {
        allParentChildAdditionForFields {
          nodes {
            id
            foo
          }
        }
      }
    `,
  },
  {
    runs: [2],
    type: `data`,
    query: graphql`
      {
        allParentChildAdditionForFields {
          nodes {
            id
            foo
            fields {
              foo1
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
        typeinfoParent: __type(name: "Parent_ChildAdditionForFields") {
          fields {
            name
          }
        }

        typeinfoChild: __type(name: "Parent_ChildAdditionForFieldsFields") {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesDiff, dataDiff }) => {
  // fields and fields type are added
  expect(typesDiff).toMatchInlineSnapshot(`
    "  Object {
    -   \\"typeinfoChild\\": null,
    +   \\"typeinfoChild\\": Object {
    +     \\"fields\\": Array [
    +       Object {
    +         \\"name\\": \\"foo1\\",
    +       },
    +     ],
    +   },
        \\"typeinfoParent\\": Object {
          \\"fields\\": Array [
            Object {
              \\"name\\": \\"children\\",
    +       },
    +       Object {
    +         \\"name\\": \\"fields\\",
            },
            Object {
              \\"name\\": \\"foo\\",
            },
            Object {
              \\"name\\": \\"id\\",
            },
            Object {
              \\"name\\": \\"internal\\",
            },
            Object {
              \\"name\\": \\"parent\\",
            },
          ],
        },
      }"
  `)

  // fields are added
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allParentChildAdditionForFields\\": Object {
          \\"nodes\\": Array [
            Object {
    +         \\"fields\\": Object {
    +           \\"foo1\\": \\"bar\\",
    +         },
              \\"foo\\": \\"run-1\\",
              \\"id\\": \\"parent_childAdditionForFields\\",
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
