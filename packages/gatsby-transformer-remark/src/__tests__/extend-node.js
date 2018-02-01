const _ = require(`lodash`)
const {
  graphql,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
} = require(`graphql`)
const { onCreateNode } = require(`../gatsby-node`)
const {
  inferObjectStructureFromNodes,
} = require(`../../../gatsby/src/schema/infer-graphql-type`)

// given a set of nodes and a query, return the result of the query
async function queryResult(nodes, fragment, { types = [] } = {}) {
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => {
        return {
          listNode: {
            name: `LISTNODE`,
            type: new GraphQLList(
              new GraphQLObjectType({
                name: `MarkdownRemark`,
                fields: inferObjectStructureFromNodes({
                  nodes,
                  types: [...types],
                }),
              })
            ),
            resolve() {
              return nodes
            },
          },
        }
      },
    }),
  })

  const result = await graphql(
    schema,
    `query {
            listNode {
                ${fragment}
            }
          }
        `
  )
  return result
}

describe(`Excerpt is generated correctly from schema`, () => {
  const node = {
    id: `whatever`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/markdown`,
    },
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`correctly loads a default excerpt`, async () => {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony?
`

    node.content = content

    const createNode = markdownNode => {
      queryResult(
        [markdownNode],
        `
                excerpt
                frontmatter {
                    title
                }
            `,
        {
          types: [{ name: `MarkdownRemark` }],
        }
      ).then(result => {
        expect(_.isString(result.data.listNode.excerpt))
      })
    }
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
    })
  })
})
