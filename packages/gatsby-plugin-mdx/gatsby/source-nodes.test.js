const { graphql } = require(`gatsby/graphql`)
const { onCreateNode } = require(`../gatsby-node`)
const sourceNodes = require(`./source-nodes`)
const { createContentDigest } = require(`gatsby-core-utils`)

// given a set of nodes and a query, return the result of the query
async function queryResult(
  nodes,
  fragment,
  { additionalParameters = {}, pluginOptions = {} }
) {
  const {
    createSchemaComposer,
  } = require(`../../gatsby/src/schema/schema-composer`)
  const {
    addInferredFields,
  } = require(`../../gatsby/src/schema/infer/add-inferred-fields`)
  const {
    getExampleValue,
  } = require(`../../gatsby/src/schema/infer/example-value`)
  const typeName = `Mdx`
  const sc = createSchemaComposer()
  await sourceNodes(
    {
      schema: {
        buildObjectType: params => params,
      },
      cache: {
        get: () => null,
        set: () => null,
      },
      getNodes: () => [],
      actions: {
        createTypes: typeDefs => {
          if (typeof typeDefs === `string`) sc.addTypeDefs(typeDefs)
          else if (typeDefs.name === typeName) {
            const tc = sc.createObjectTC(typeName)
            addInferredFields({
              schemaComposer: sc,
              typeComposer: tc,
              exampleValue: getExampleValue({ nodes, typeName }),
            })
            tc.addFields(typeDefs.fields)
            sc.Query.addFields({
              listNode: { type: [tc], resolve: () => nodes },
            })
          }
        },
      },
      ...additionalParameters,
    },
    {
      ...pluginOptions,
    }
  )

  const schema = sc.buildSchema()
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

const bootstrapTest = (
  label,
  content,
  query,
  test,
  { additionalParameters = {}, pluginOptions = {} } = {}
) => {
  const node = {
    id: `whatever`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/x-markdown`,
    },
  }
  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(label, async done => {
    node.content = content
    const createNode = mdxNode => {
      queryResult([mdxNode], query, {
        additionalParameters,
        pluginOptions,
      }).then(result => {
        try {
          test(result.data.listNode[0])
          done()
        } catch (err) {
          done.fail(err)
        }
      })
    }
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    await onCreateNode(
      {
        node,
        loadNodeContent,
        actions,
        createNodeId,
        createContentDigest,
      },
      { ...additionalParameters, ...pluginOptions }
    )
  })
}

const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
export default ({children, ...props}) => (
<div>
{children}
</div>
)

export const meta = {author: "chris"}

This is excerpt.

<!--more-->

# Some title

a bit of a paragraph

some content
`

describe(`Excerpt is generated correctly from schema`, () => {
  bootstrapTest(
    `correctly loads an excerpt`,
    content,
    `frontmatter {
          title
      }
      excerpt
      `,
    node => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt).toBe(
        `This is excerpt. Some title a bit of a paragraph some content`
      )
    }
  )

  bootstrapTest(
    `correctly loads an excerpt with pruneLength`,
    content,
    `frontmatter {
          title
      }
      excerpt(pruneLength: 15)
      `,
    node => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt).toBe(`This is excerpt…`)
    }
  )

  bootstrapTest(
    `correctly loads an excerpt with excerpt_separator`,
    content,
    `frontmatter {
          title
      }
      excerpt
      `,
    node => {
      expect(node).toMatchSnapshot()
      expect(node.excerpt).toBe(`This is excerpt.`)
    },
    { pluginOptions: { excerpt_separator: `<!--more-->` } }
  )
})
