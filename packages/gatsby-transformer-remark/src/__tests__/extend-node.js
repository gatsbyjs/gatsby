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

const bootstrapTest = (label, content, query, test, additionalParameters = {}) => {
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

  it(label, async (done) => {
    node.content = content
    const createNode = markdownNode => {
      queryResult(
        [markdownNode],
        query,
        {
          types: [{ name: `MarkdownRemark` }],
        }
      ).then(result => {
        try {
          test(result.data.listNode[0])
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
    { ...additionalParameters }
    )
    })
}

describe(`Excerpt is generated correctly from schema`, () => {

  bootstrapTest(
    `correctly loads an excerpt`,
    `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony?`,
    `excerpt
    frontmatter {
        title
    }
    `,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt).toMatch(`Where oh where is my little pony?`)
    }
  )

  bootstrapTest(
    `correctly loads a default excerpt`,
    `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---`,
    `excerpt
    frontmatter {
        title
    }
    `,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt).toMatch(``)
    }
  )

  bootstrapTest(
    `correctly uses excerpt separator`,
    `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony?
<!-- end -->
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.
    `,
    `excerpt
    frontmatter {
        title
    }
    `,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt).toMatch(`Where oh where is my little pony?`)
    },
    { excerpt_separator: `<!-- end -->` }
  )

  const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.
In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.
`

  bootstrapTest(
    `correctly prunes length to default value`,
    content,
    `excerpt
    frontmatter {
        title
    }
    `,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt.length).toBe(139)
    }
  )

  bootstrapTest(
    `correctly prunes length to provided parameter`,
    content,
    `excerpt(pruneLength: 50)
    frontmatter {
        title
    }
    `,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt.length).toBe(46)
    }
  )

  bootstrapTest(
    `correctly prunes length to provided parameter with truncate`,
    content,
    `excerpt(pruneLength: 50, truncate: true)
    frontmatter {
        title
    }
    `,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt.length).toBe(50)
    }
  )
})

describe(`Wordcount and timeToRead are generated correctly from schema`, () => {
  bootstrapTest(
    `correctly uses wordCount parameters`,
    `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.
`,
    `wordCount {
      words
      paragraphs
      sentences
    }
    frontmatter {
        title
    }`,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.wordCount).toEqual(
        {
        paragraphs: 2,
        sentences: 19,
        words: 150,
        }
      )
    })

  const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
`

  bootstrapTest(
    `correctly uses a default value for wordCount`,
    content,
    `wordCount {
      words
      paragraphs
      sentences
    }
    frontmatter {
        title
    }`,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.wordCount).toEqual(
        {
        paragraphs: null,
        sentences: null,
        words: null,
        }
      )
    })

  bootstrapTest(
    `correctly uses a default value for timeToRead`,
    content,
    `timeToRead
    frontmatter {
        title
    }`,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(node.timeToRead).toBe(1)
    })
})

describe(`Table of contents is generated correctly from schema`, () => {
  // Used to verify that console.warn is called when field not found
  jest.spyOn(global.console, `warn`)

  bootstrapTest(
    `returns null on non existing table of contents field`,
    `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
# first title

some text

## second title

some other text
`,
    `tableOfContents
    frontmatter {
        title
    }`,
    (node) => {
      expect(node).toMatchSnapshot()
      expect(console.warn).toBeCalled()
      expect(node.tableOfContents).toBe(null)
    })

  bootstrapTest(
    `correctly generates table of contents`,
    `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
# first title

some text

## second title

some other text

# third title

final text
`,
    `tableOfContents(pathToSlugField: "frontmatter.title")
    frontmatter {
        title
    }`,
    (node) => {
      expect(node).toMatchSnapshot()
    })
  })
