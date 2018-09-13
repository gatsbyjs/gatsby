const {
  graphql,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
} = require(`gatsby/graphql`)
const { onCreateNode } = require(`../gatsby-node`)
const {
  inferObjectStructureFromNodes,
} = require(`../../../gatsby/src/schema/infer-graphql-type`)
const extendNodeType = require(`../extend-node-type`)

// given a set of nodes and a query, return the result of the query
async function queryResult(nodes, fragment, { types = [] } = {}) {
  const inferredFields = inferObjectStructureFromNodes({
    nodes,
    types: [...types],
  })
  const extendNodeTypeFields = await extendNodeType(
    {
      type: { name: `MarkdownRemark` },
      cache: {
        get: () => null,
        set: () => null,
      },
      getNodes: () => [],
    },
    {
      plugins: [],
    }
  )

  const markdownRemarkFields = {
    ...inferredFields,
    ...extendNodeTypeFields,
  }

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
                fields: markdownRemarkFields,
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

  it(`correctly loads an excerpt`, async (done) => {
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
        try {
          const createdNode = result.data.listNode[0]
          expect(createdNode).toMatchSnapshot()
          expect(createdNode.excerpt).toMatch(`Where oh where is my little pony?`)
          done()
        }
        catch(err) {
          done.fail(err)
        }
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

  it(`correctly loads a default excerpt`, async (done) => {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
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
        try {
          const createdNode = result.data.listNode[0]
          expect(createdNode).toMatchSnapshot()
          expect(createdNode.excerpt).toMatch(``)
          done()
        }
        catch(err) {
          done.fail(err)
        }
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

  it(`correctly uses excerpt separator`, async (done) => {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony?
<!-- end -->
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

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
        try {
          const createdNode = result.data.listNode[0]
          expect(createdNode).toMatchSnapshot()
          expect(createdNode.excerpt).toMatch(`Where oh where is my little pony?`)
          done()
        }
        catch(err) {
          done.fail(err)
        }
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
    },
    { excerpt_separator: `<!-- end -->` }
    )
  })

  it(`correctly prunes length to default value`, async (done) => {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.
In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

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
        try {
          const createdNode = result.data.listNode[0]
          expect(createdNode).toMatchSnapshot()
          expect(createdNode.excerpt.length).toBe(139)
          done()
        }
        catch(err) {
          done.fail(err)
        }
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
    },
    )
  })

  it(`correctly prunes length to provided parameter`, async (done) => {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.
In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

`

    node.content = content

    const createNode = markdownNode => {
      queryResult(
        [markdownNode],
        `
                excerpt(pruneLength: 50)
                frontmatter {
                    title
                }
            `,
        {
          types: [{ name: `MarkdownRemark` }],
        }
      ).then(result => {
        try {
          const createdNode = result.data.listNode[0]
          expect(createdNode).toMatchSnapshot()
          expect(createdNode.excerpt.length).toBe(46)
          done()
        }
        catch(err) {
          done.fail(err)
        }
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
    },
    )
  })

  it(`correctly prunes length to provided parameter with truncate`, async (done) => {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.
In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

`

    node.content = content

    const createNode = markdownNode => {
      queryResult(
        [markdownNode],
        `
                excerpt(pruneLength: 50, truncate: true)
                frontmatter {
                    title
                }
            `,
        {
          types: [{ name: `MarkdownRemark` }],
        }
      ).then(result => {
        try {
          const createdNode = result.data.listNode[0]
          expect(createdNode).toMatchSnapshot()
          expect(createdNode.excerpt.length).toBe(50)
          done()
        }
        catch(err) {
          done.fail(err)
        }
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
    },
    )
  })
})
