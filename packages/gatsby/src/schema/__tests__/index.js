const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { buildSchema } = require(`../schema`)
const graphql = require(`../../internal-plugins/query-runner/graphql`)

const nodes = [
  {
    id: `file1`,
    parent: null,
    children: [`md1`],
    internal: {
      type: `File`,
      contentDigest: `file1`,
    },
    name: `1.md`,
  },
  {
    id: `file2`,
    parent: null,
    children: [`md2`],
    internal: {
      type: `File`,
      contentDigest: `file2`,
    },
    name: `2.md`,
  },
  {
    id: `file3`,
    parent: null,
    children: [`author1`, `author2`],
    internal: {
      type: `File`,
      contentDigest: `file3`,
    },
    name: `authors.yaml`,
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
          posts: (source, ignoredArgs, context, info) => {
            const { email } = source
            const resolve = context.resolvers.findMany(`Markdown`)
            return resolve({
              source,
              args: {
                filter: {
                  frontmatter: { authors: { email: { in: [email] } } },
                },
              },
              context,
              info,
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
                resolve: async (source, ignoredArgs, context, info) => {
                  const { authors: authorEmails } = source
                  const resolve = context.resolvers.findMany(`Author`)
                  const authors = await resolve({
                    source,
                    args: {
                      filter: { email: { in: authorEmails } },
                    },
                    context,
                    info,
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
    const results = await graphql(query)
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
            ... on Markdown { frontmatter { title } }
            ... on Author { name }
          }
          childMarkdown { frontmatter { title } }
          childrenAuthor { name }
        }
      }
    `
    const results = await graphql(query)
    const expected = {
      allFile: [
        {
          childMarkdown: { frontmatter: { title: `Markdown File 1` } },
          children: [{ frontmatter: { title: `Markdown File 1` } }],
          childrenAuthor: [],
        },
        {
          childMarkdown: { frontmatter: { title: `Markdown File 2` } },
          children: [{ frontmatter: { title: `Markdown File 2` } }],
          childrenAuthor: [],
        },
        {
          childMarkdown: null,
          children: [{ name: `Author 1` }, { name: `Author 2` }],
          childrenAuthor: [{ name: `Author 1` }, { name: `Author 2` }],
        },
      ],
    }
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })

  it(`processes query args`, async () => {
    const query = `
      query {
        allFile(
          filter: { children: { internal: { type: { eq: "Markdown" } } } }
          sort: { fields: [ID], order: DESC }
        ) {
          name
          children {
            id
          }
        }
      }
    `
    const results = await graphql(query)
    const expected = {
      allFile: [
        { name: `2.md`, children: [{ id: `md2` }] },
        { name: `1.md`, children: [{ id: `md1` }] },
      ],
    }
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })

  it(`processes deep query args`, async () => {
    const query = `
      query {
        allMarkdown(
          filter: {
            frontmatter: {
              authors: {
                posts: {
                  frontmatter: {
                    title: {
                      eq: "Markdown File 2"
                    }
                  }
                }
              }
            }
          }
          sort: { fields: [FRONTMATTER___TITLE], order: DESC }
        ) {
          id
          frontmatter {
            authors {
              name
            }
          }
        }
      }
    `
    const results = await graphql(query)
    const expected = {
      allMarkdown: [
        { id: `md2`, frontmatter: { authors: [{ name: `Author 1` }] } },
        {
          id: `md1`,
          frontmatter: {
            authors: [{ name: `Author 1` }, { name: `Author 2` }],
          },
        },
      ],
    }
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })
})
