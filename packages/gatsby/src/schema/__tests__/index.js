const { graphql } = require(`graphql`)

const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { buildSchema } = require(`../schema`)

const nodes = [
  {
    id: `file1`,
    parent: null,
    children: [`md1`],
    internal: {
      type: `File`,
      contentDigest: `file1`,
    },
  },
  {
    id: `file2`,
    parent: null,
    children: [`md2`],
    internal: {
      type: `File`,
      contentDigest: `file2`,
    },
  },
  {
    id: `file3`,
    parent: null,
    children: [`author1`, `author2`],
    internal: {
      type: `File`,
      contentDigest: `file3`,
    },
  },
  {
    id: `md1`,
    parent: `file1`,
    children: [],
    internal: {
      type: `Markdown`,
      contentDigest: `md1`,
    },
    frontmatter: {
      title: `Markdown File 1`,
      date: new Date(Date.UTC(2019, 0, 1)),
      authors: [`author2@example.com`, `author1@example.com`],
    },
  },
  {
    id: `md2`,
    parent: `file2`,
    children: [],
    internal: {
      type: `Markdown`,
      contentDigest: `md2`,
    },
    frontmatter: {
      title: `Markdown File 2`,
      published: false,
      authors: [`author1@example.com`],
    },
  },
  {
    id: `author1`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Author`,
      contentDigest: `author1`,
    },
    name: `Author 1`,
    email: `author1@example.com`,
  },
  {
    id: `author2`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Author`,
      contentDigest: `author1`,
    },
    name: `Author 2`,
    email: `author2@example.com`,
  },
]

nodes.forEach(node => {
  store.dispatch(actions.createNode(node, { name: `test` }))
})

jest.mock(`../../utils/api-runner-node`, () => (api, options) => {
  switch (api) {
    case `addTypeDefs`:
      options.addTypeDefs(`
        type Frontmatter { authors: [Author] @link(by: "email") }
        type Markdown implements Node { frontmatter: Frontmatter }
        type Author implements Node { posts: [Markdown] }
      `)
      break
    case `addResolvers`:
      options.addResolvers({
        Author: {
          posts: ({ source, args, context, info }) => {
            const { email } = source
            const {
              resolve,
            } = info.schema.getQueryType().getFields().allMarkdown
            return resolve(undefined, {
              filter: { frontmatter: { authors: { email: { in: [email] } } } },
            })
          },
        },
      })
      break
    case `setFieldsOnGraphQLNodeType`:
      return options.type.name !== `Markdown`
        ? []
        : [
            {
              [`frontmatter.authorNames`]: {
                type: [`String`],
                resolve: async (source, args, context, info) => {
                  const { authors: authorEmails } = source
                  const {
                    resolve,
                  } = info.schema.getQueryType().getFields().allAuthor
                  const authors = await resolve(undefined, {
                    filter: { email: { in: authorEmails } },
                  })
                  return authors.map(author => author.name)
                },
              },
            },
          ]
  }
  return null
})

describe(`Schema query`, () => {
  beforeAll(async () => {
    const schema = await buildSchema()
    store.dispatch({
      type: `SET_SCHEMA`,
      payload: schema,
    })
  })

  it(`processes selection set`, async () => {
    const query = `
      query {
        allMarkdown {
          frontmatter {
            title
            date
            published
            authors {
              name
              email
              posts {
                frontmatter {
                  title
                }
              }
            }
            authorNames
          }
        }
      }
    `
    const { schema } = store.getState()
    const results = await graphql(schema, query)
    const expected = {
      allMarkdown: [
        {
          frontmatter: {
            authorNames: [`Author 1`, `Author 2`],
            authors: [
              {
                email: `author1@example.com`,
                name: `Author 1`,
                posts: [
                  { frontmatter: { title: `Markdown File 1` } },
                  { frontmatter: { title: `Markdown File 2` } },
                ],
              },
              {
                email: `author2@example.com`,
                name: `Author 2`,
                posts: [{ frontmatter: { title: `Markdown File 1` } }],
              },
            ],
            date: `2019-01-01T00:00:00.000Z`,
            published: null,
            title: `Markdown File 1`,
          },
        },
        {
          frontmatter: {
            authorNames: [`Author 1`],
            authors: [
              {
                email: `author1@example.com`,
                name: `Author 1`,
                posts: [
                  { frontmatter: { title: `Markdown File 1` } },
                  { frontmatter: { title: `Markdown File 2` } },
                ],
              },
            ],
            date: null,
            published: false,
            title: `Markdown File 2`,
          },
        },
      ],
    }
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })

  it(`processes children fields`, async () => {
    const query = `
      query {
        allFile {
          children {
            ... on Markdown { id }
            ... on Author { id }
          }
          childMarkdown { id }
          childrenAuthor { id }
        }
      }
    `
    const { schema } = store.getState()
    const results = await graphql(schema, query)
    const expected = {
      allFile: [
        {
          childMarkdown: { id: `md1` },
          children: [{ id: `md1` }],
          childrenAuthor: [],
        },
        {
          childMarkdown: { id: `md2` },
          children: [{ id: `md2` }],
          childrenAuthor: [],
        },
        {
          childMarkdown: null,
          children: [{ id: `author1` }, { id: `author2` }],
          childrenAuthor: [{ id: `author1` }, { id: `author2` }],
        },
      ],
    }

    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })
})
