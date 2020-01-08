const { graphql } = require(`graphql`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { build } = require(`..`)
const withResolverContext = require(`../context`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

jest.mock(`../../utils/api-runner-node`)
const apiRunnerNode = require(`../../utils/api-runner-node`)

const nodes = require(`./fixtures/queries`)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
    phantomActivity: () => {
      return {
        start: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

describe(`Query schema`, () => {
  let schema
  let schemaComposer

  const runQuery = query =>
    graphql(
      schema,
      query,
      undefined,
      withResolverContext({
        schema,
        schemaComposer,
      })
    )

  beforeAll(async () => {
    apiRunnerNode.mockImplementation(async (api, ...args) => {
      if (api === `setFieldsOnGraphQLNodeType`) {
        if (args[0].type.name === `Markdown`) {
          return [
            {
              [`frontmatter.authorNames`]: {
                type: `[String!]!`,
                async resolve(source, args, context, info) {
                  const authors = await context.nodeModel.runQuery({
                    type: `Author`,
                    query: { filter: { email: { in: source.authors } } },
                    firstOnly: false,
                  })
                  return authors.map(author => author.name)
                },
              },
              [`frontmatter.anotherField`]: {
                type: `Boolean`,
                resolve() {
                  return true
                },
              },
            },
          ]
        }
        return []
      } else if (api === `createResolvers`) {
        return [
          args[0].createResolvers({
            Frontmatter: {
              authors: {
                resolve(source, args, context, info) {
                  // NOTE: When using the first field resolver argument (here called
                  // `source`, also called `parent` or `root`), it is important to
                  // take care of the fact that the resolver can be called more than once
                  // in one query, e.g. when the field is referenced both in the input filter
                  // and in the selection set. In this test example, the `authors` field will
                  // already have been expanded to an array of full `Author` nodes when the
                  // resolver is called the second time.
                  if (
                    source.authors.some(
                      author => author && typeof author === `object`
                    )
                  ) {
                    return source.authors
                  }
                  return context.nodeModel
                    .getAllNodes({ type: `Author` })
                    .filter(author => source.authors.includes(author.email))
                },
              },
            },
            Author: {
              posts: {
                resolve(source, args, context, info) {
                  // NOTE: One of the differences between using `runQuery` and
                  // `getAllNodes` is that the latter will always get the nodes
                  // which will be queried directly from the store, while `runQuery`
                  // will first try to call field resolvers, e.g. to expand
                  // foreign-key fields to full nodes. Here for example we can
                  // query `authors.email`.
                  // Another thing to note is that we don't have to use the
                  // `$elemMatch` operator when querying arrays of objects
                  // (although we could).
                  return context.nodeModel.runQuery({
                    type: `Markdown`,
                    query: {
                      filter: {
                        frontmatter: {
                          authors: { email: { eq: source.email } },
                          // authors: {
                          //   elemMatch: { email: { eq: source.email } },
                          // },
                        },
                      },
                    },
                    firstOnly: false,
                  })
                },
              },
            },
          }),
          args[0].createResolvers({
            Query: {
              allAuthorNames: {
                type: `[String!]!`,
                resolve(source, args, context, info) {
                  return context.nodeModel
                    .getAllNodes({ type: `Author` })
                    .map(author => author.name)
                },
              },
            },
          }),
        ]
      } else {
        return []
      }
    })

    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      actions.createNode(node, { name: `test` })(store.dispatch)
    )

    const typeDefs = [
      `type Markdown implements Node { frontmatter: Frontmatter! }`,
      `type Frontmatter { authors: [Author] }`,
      `type Author implements Node { posts: [Markdown] }`,
    ]
    typeDefs.forEach(def =>
      store.dispatch({ type: `CREATE_TYPES`, payload: def })
    )

    store.dispatch({
      type: `SET_SITE_CONFIG`,
      payload: {
        mapping: {
          "Markdown.frontmatter.reviewerByEmail": `Author.email`,
        },
      },
    })

    await build({})
    schema = store.getState().schema
    schemaComposer = store.getState().schemaCustomization.composer
  })

  describe(`on children fields`, () => {
    it(`handles Node interface children field`, async () => {
      const query = `
        {
          allFile {
            edges {
              node {
                children {
                  ... on Markdown { frontmatter { title } }
                  ... on Author { name }
                }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allFile: {
          edges: [
            {
              node: {
                children: [{ frontmatter: { title: `Markdown File 1` } }],
              },
            },
            {
              node: {
                children: [{ frontmatter: { title: `Markdown File 2` } }],
              },
            },
            {
              node: {
                children: [{ name: `Author 2` }, { name: `Author 1` }],
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`handles convenience child fields`, async () => {
      const query = `
        {
          allFile {
            edges {
              node {
                childMarkdown { frontmatter { title } }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allFile: {
          edges: [
            {
              node: {
                childMarkdown: { frontmatter: { title: `Markdown File 1` } },
              },
            },
            {
              node: {
                childMarkdown: { frontmatter: { title: `Markdown File 2` } },
              },
            },
            {
              node: {
                childMarkdown: null,
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`handles convenience children fields`, async () => {
      const query = `
        {
          allFile {
            edges {
              node {
                childrenAuthor { name }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allFile: {
          edges: [
            {
              node: {
                childrenAuthor: [],
              },
            },
            {
              node: {
                childrenAuthor: [],
              },
            },
            {
              node: {
                childrenAuthor: [{ name: `Author 2` }, { name: `Author 1` }],
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    // NOTE: Also tests handling children fields being in both
    // input filter and selection set.
    it(`handles query arguments on children fields`, async () => {
      const query = `
        {
          allFile(
            filter: {
              children: {
                elemMatch: { internal: { type: { eq: "Markdown" } } }
              }
            }
            sort: { fields: [id], order: [DESC] }
          ) {
            edges {
              node {
                name
                children {
                  id
                }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allFile: {
          edges: [
            {
              node: { name: `2.md`, children: [{ id: `md2` }] },
            },
            {
              node: { name: `1.md`, children: [{ id: `md1` }] },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })
  })

  describe(`on fields added with createTypes`, () => {
    it(`handles selection set`, async () => {
      const query = `
        {
          markdown {
            frontmatter {
              authors {
                posts {
                  frontmatter {
                    title
                  }
                }
              }
            }
          }
          allMarkdown {
            edges {
              node {
                frontmatter {
                  title
                  date(formatString: "MM-DD-YYYY")
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
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        markdown: {
          frontmatter: {
            authors: [
              {
                posts: [
                  { frontmatter: { title: `Markdown File 1` } },
                  { frontmatter: { title: `Markdown File 2` } },
                ],
              },
              { posts: [{ frontmatter: { title: `Markdown File 1` } }] },
            ],
          },
        },
        allMarkdown: {
          edges: [
            {
              node: {
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
                  date: `01-01-2019`,
                  published: null,
                  title: `Markdown File 1`,
                },
              },
            },
            {
              node: {
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
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`handles query arguments`, async () => {
      const query = `
        {
          author(
            posts: {
              elemMatch: {
                frontmatter: {
                  title: { eq: "Markdown File 2" }
                }
              }
            }
          ) {
            name
            posts {
              frontmatter {
                title
              }
            }
          }
          allMarkdown(
            filter: {
              frontmatter: {
                authors: {
                  elemMatch: {
                    name: { regex: "/^Author/" }
                    posts: {
                      elemMatch: {
                        frontmatter: {
                          title: {
                            eq: "Markdown File 2"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            sort: { fields: [frontmatter___title], order: [DESC] }
          ) {
            edges {
              node {
                id
                frontmatter {
                  authors {
                    name
                  }
                }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        author: {
          name: `Author 1`,
          posts: [
            { frontmatter: { title: `Markdown File 1` } },
            { frontmatter: { title: `Markdown File 2` } },
          ],
        },
        allMarkdown: {
          edges: [
            {
              node: {
                id: `md2`,
                frontmatter: { authors: [{ name: `Author 1` }] },
              },
            },
            {
              node: {
                id: `md1`,
                frontmatter: {
                  authors: expect.arrayContaining([
                    { name: `Author 1` },
                    { name: `Author 2` },
                  ]),
                },
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })
  })

  describe(`on pagination fields`, () => {
    describe(`edges { node }`, () => {
      it(`paginates results`, async () => {
        const query = `
          {
            pages: allMarkdown {
              totalCount
              edges {
                node {
                  frontmatter {
                    title
                    authors {
                      name
                    }
                  }
                }
              }
            }
            skiplimit: allMarkdown(
              skip: 1
              limit: 1
            ) {
              totalCount
              edges { node { id } }
            }
            findsort: allMarkdown(
              filter: {
                frontmatter: {
                  authors: { elemMatch: { name: { regex: "/^Author\\\\s\\\\d/" } } }
                }
              }
              sort: { fields: [frontmatter___title], order: [DESC] }
            ) {
              totalCount
              edges {
                node {
                  frontmatter {
                    title
                    authors {
                      name
                    }
                  }
                }
              }
            }
          }
        `
        const results = await runQuery(query)
        const expected = {
          findsort: {
            totalCount: 2,
            edges: [
              {
                node: {
                  frontmatter: {
                    authors: [{ name: `Author 1` }],
                    title: `Markdown File 2`,
                  },
                },
              },
              {
                node: {
                  frontmatter: {
                    authors: expect.arrayContaining([
                      { name: `Author 1` },
                      { name: `Author 2` },
                    ]),
                    title: `Markdown File 1`,
                  },
                },
              },
            ],
          },
          pages: {
            totalCount: 2,
            edges: [
              {
                node: {
                  frontmatter: {
                    authors: expect.arrayContaining([
                      { name: `Author 1` },
                      { name: `Author 2` },
                    ]),
                    title: `Markdown File 1`,
                  },
                },
              },
              {
                node: {
                  frontmatter: {
                    authors: [{ name: `Author 1` }],
                    title: `Markdown File 2`,
                  },
                },
              },
            ],
          },
          skiplimit: { totalCount: 2, edges: [{ node: { id: `md2` } }] },
        }
        expect(results.errors).toBeUndefined()
        expect(results.data).toEqual(expected)
      })

      it(`paginates null result`, async () => {
        const query = `
          {
            allMarkdown(
              skip: 1
              limit: 1,
              filter: {
                id: { eq: "non-existing"}
              }
            ) {
              totalCount
              edges { node { id } }
              nodes { id }
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "edges": Array [],
    "nodes": Array [],
    "totalCount": 0,
  },
}
`)
      })

      it(`adds nodes field as a convenience shortcut`, async () => {
        const query = `
          {
            allMarkdown(
              skip: 1
              limit: 1
            ) {
              totalCount
              nodes { id }
            }
          }
        `
        const results = await runQuery(query)
        const expected = {
          allMarkdown: {
            totalCount: 2,
            nodes: [{ id: `md2` }],
          },
        }
        expect(results.errors).toBeUndefined()
        expect(results.data).toEqual(expected)
      })
    })

    describe(`group field`, () => {
      it(`groups query results`, async () => {
        const query = `
          {
            allMarkdown {
              group(field: frontmatter___title) {
                fieldValue
                edges {
                  node {
                    frontmatter {
                      title
                      date(formatString: "YYYY-MM-DD")
                    }
                  }
                }
              }
            }
          }
        `
        const results = await runQuery(query)
        const expected = {
          allMarkdown: {
            group: [
              {
                fieldValue: `Markdown File 1`,
                edges: [
                  {
                    node: {
                      frontmatter: {
                        title: `Markdown File 1`,
                        date: `2019-01-01`,
                      },
                    },
                  },
                ],
              },
              {
                fieldValue: `Markdown File 2`,
                edges: [
                  {
                    node: {
                      frontmatter: {
                        title: `Markdown File 2`,
                        date: null,
                      },
                    },
                  },
                ],
              },
            ],
          },
        }
        expect(results.errors).toBeUndefined()
        expect(results.data).toEqual(expected)
      })

      it(`groups query results by scalar field with resolver`, async () => {
        const query = `
          {
            allMarkdown {
              group(field: frontmatter___date) {
                fieldValue
                edges {
                  node {
                    frontmatter {
                      title
                      date(formatString: "YYYY/MM/DD")
                    }
                  }
                }
              }
            }
          }
        `
        const results = await runQuery(query)
        const expected = {
          allMarkdown: {
            group: [
              {
                fieldValue: `2019-01-01T00:00:00.000Z`,
                edges: [
                  {
                    node: {
                      frontmatter: {
                        title: `Markdown File 1`,
                        date: `2019/01/01`,
                      },
                    },
                  },
                ],
              },
            ],
          },
        }
        expect(results.errors).toBeUndefined()
        expect(results.data).toEqual(expected)
      })

      it(`groups query results by foreign key field`, async () => {
        const query = `
          {
            allMarkdown {
              group(field: frontmatter___authors___name) {
                fieldValue
                edges {
                  node {
                    frontmatter {
                      title
                      date(formatString: "YYYY-MM-DD")
                    }
                  }
                }
              }
            }
          }
        `
        const results = await runQuery(query)
        const expected = {
          allMarkdown: {
            group: [
              {
                fieldValue: `Author 1`,
                edges: [
                  {
                    node: {
                      frontmatter: {
                        title: `Markdown File 1`,
                        date: `2019-01-01`,
                      },
                    },
                  },
                  {
                    node: {
                      frontmatter: {
                        title: `Markdown File 2`,
                        date: null,
                      },
                    },
                  },
                ],
              },
              {
                fieldValue: `Author 2`,
                edges: [
                  {
                    node: {
                      frontmatter: {
                        title: `Markdown File 1`,
                        date: `2019-01-01`,
                      },
                    },
                  },
                ],
              },
            ],
          },
        }
        expect(results.errors).toBeUndefined()
        expect(results.data).toEqual(expected)
      })

      it(`handles groups added in fragment`, async () => {
        const query = `
          fragment GroupTest on MarkdownConnection {
            group(field: frontmatter___authors___name) {
              fieldValue
              edges {
                node {
                  frontmatter {
                    title
                    date(formatString: "YYYY-MM-DD")
                  }
                }
              }
            }
          }

          {
            allMarkdown {
              ...GroupTest
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "group": Array [
      Object {
        "edges": Array [
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": "2019-01-01",
                "title": "Markdown File 1",
              },
            },
          },
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": null,
                "title": "Markdown File 2",
              },
            },
          },
        ],
        "fieldValue": "Author 1",
      },
      Object {
        "edges": Array [
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": "2019-01-01",
                "title": "Markdown File 1",
              },
            },
          },
        ],
        "fieldValue": "Author 2",
      },
    ],
  },
}
`)
      })

      it(`handles groups added in inline fragment`, async () => {
        const query = `
          {
            allMarkdown {
              ... on MarkdownConnection {
                group(field: frontmatter___authors___name) {
                  fieldValue
                  edges {
                    node {
                      frontmatter {
                        title
                        date(formatString: "YYYY-MM-DD")
                      }
                    }
                  }
                }
              }
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "group": Array [
      Object {
        "edges": Array [
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": "2019-01-01",
                "title": "Markdown File 1",
              },
            },
          },
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": null,
                "title": "Markdown File 2",
              },
            },
          },
        ],
        "fieldValue": "Author 1",
      },
      Object {
        "edges": Array [
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": "2019-01-01",
                "title": "Markdown File 1",
              },
            },
          },
        ],
        "fieldValue": "Author 2",
      },
    ],
  },
}
`)
      })

      it(`handles groups added in nested fragment`, async () => {
        const query = `
          fragment GroupTest on MarkdownConnection {
            group(field: frontmatter___authors___name) {
              fieldValue
              edges {
                node {
                  frontmatter {
                    title
                    date(formatString: "YYYY-MM-DD")
                  }
                }
              }
            }
          }

          fragment GroupTestWrapper on MarkdownConnection {
            ...GroupTest
          }

          {
            allMarkdown {
              ...GroupTestWrapper
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "group": Array [
      Object {
        "edges": Array [
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": "2019-01-01",
                "title": "Markdown File 1",
              },
            },
          },
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": null,
                "title": "Markdown File 2",
              },
            },
          },
        ],
        "fieldValue": "Author 1",
      },
      Object {
        "edges": Array [
          Object {
            "node": Object {
              "frontmatter": Object {
                "date": "2019-01-01",
                "title": "Markdown File 1",
              },
            },
          },
        ],
        "fieldValue": "Author 2",
      },
    ],
  },
}
`)
      })

      it(`groups null result`, async () => {
        const query = `
          {
            allMarkdown(
              skip: 1
              limit: 1,
              filter: {
                id: { eq: "non-existing"}
              }
            ) {
              group(field: frontmatter___title, skip: 1, limit: 1) {
                field
                fieldValue
              }
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "group": Array [],
  },
}
`)
      })
    })

    describe(`distinct field`, () => {
      it(`returns distinct values`, async () => {
        const query = `
          {
            allMarkdown {
              distinct(field: frontmatter___title)
            }
          }
        `
        const results = await runQuery(query)
        const expected = {
          allMarkdown: {
            distinct: [`Markdown File 1`, `Markdown File 2`],
          },
        }
        expect(results.errors).toBeUndefined()
        expect(results.data).toEqual(expected)
      })

      it(`returns distinct values on foreign-key field`, async () => {
        const query = `
          {
            allMarkdown {
              distinct(field: frontmatter___authors___name)
            }
          }
        `
        const results = await runQuery(query)
        const expected = {
          allMarkdown: {
            distinct: [`Author 1`, `Author 2`],
          },
        }
        expect(results.errors).toBeUndefined()
        expect(results.data).toEqual(expected)
      })

      it(`returns distinct values on scalar field with resolver`, async () => {
        const query = `
          {
            allMarkdown {
              distinct(field: frontmatter___date)
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "distinct": Array [
      "2019-01-01T00:00:00.000Z",
    ],
  },
}
`)
      })

      it(`handles null result`, async () => {
        const query = `
          {
            allMarkdown(
              skip: 1
              limit: 1
              filter: { id: { eq: "non-existing" } }
            ) {
              distinct(field: frontmatter___title)
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "distinct": Array [],
  },
}
`)
      })
    })
  })

  describe(`on fields added by setFieldsOnGraphQLNodeType API`, () => {
    it(`returns correct results`, async () => {
      const query = `
        {
          allMarkdown {
            edges {
              node {
                frontmatter {
                  authorNames
                  anotherField
                }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allMarkdown: {
          edges: [
            {
              node: {
                frontmatter: {
                  anotherField: true,
                  authorNames: [`Author 1`, `Author 2`],
                },
              },
            },
            {
              node: {
                frontmatter: {
                  anotherField: true,
                  authorNames: [`Author 1`],
                },
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })
  })

  describe(`on fields added to the root Query type`, () => {
    it(`returns correct results`, async () => {
      const query = `
      {
        allAuthorNames
      }
    `
      const results = await runQuery(query)
      const expected = {
        allAuthorNames: [`Author 1`, `Author 2`],
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })
  })

  describe(`on fields added from third-party schema`, () => {
    it.todo(`returns correct results`)
  })

  describe(`on foreign-key fields`, () => {
    it(`with the ___NODE convention`, async () => {
      const query = `
        {
          allMarkdown {
            nodes {
              frontmatter {
                reviewer {
                  name
                }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      expect(results.errors).toBeUndefined()
      expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "nodes": Array [
      Object {
        "frontmatter": Object {
          "reviewer": Object {
            "name": "Author 2",
          },
        },
      },
      Object {
        "frontmatter": Object {
          "reviewer": null,
        },
      },
    ],
  },
}
`)
    })

    it(`with defined field mappings`, async () => {
      const query = `
          {
            allMarkdown {
              nodes {
                frontmatter {
                  reviewerByEmail {
                    name
                  }
                }
              }
            }
          }
        `
      const results = await runQuery(query)
      expect(results.errors).toBeUndefined()
      expect(results.data).toMatchInlineSnapshot(`
Object {
  "allMarkdown": Object {
    "nodes": Array [
      Object {
        "frontmatter": Object {
          "reviewerByEmail": Object {
            "name": "Author 2",
          },
        },
      },
      Object {
        "frontmatter": Object {
          "reviewerByEmail": null,
        },
      },
    ],
  },
}
`)
    })
  })

  describe(`with sorted results`, () => {
    it(`default sort on one field`, async () => {
      const query = `
        {
          allMarkdown(sort: { fields: [frontmatter___title]}) {
            nodes {
              frontmatter {
                title
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allMarkdown: {
          nodes: [
            {
              frontmatter: {
                title: `Markdown File 1`,
              },
            },
            {
              frontmatter: {
                title: `Markdown File 2`,
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`DESC sort on one field`, async () => {
      const query = `
        {
          allMarkdown(sort: { fields: [frontmatter___title], order: DESC}) {
            nodes {
              frontmatter {
                title
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allMarkdown: {
          nodes: [
            {
              frontmatter: {
                title: `Markdown File 2`,
              },
            },
            {
              frontmatter: {
                title: `Markdown File 1`,
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`sort on parent field`, async () => {
      const query = `
        {
          allFirstChild(sort: { fields: [parent___internal___type], order: [DESC]}) {
            nodes {
              parent {
                internal {
                  type
                }
              }
              name
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allFirstChild: {
          nodes: [
            {
              parent: {
                internal: {
                  type: `SecondParent`,
                },
              },
              name: `Child 2`,
            },
            {
              parent: {
                internal: {
                  type: `FirstParent`,
                },
              },
              name: `Child 1`,
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`sort on children field`, async () => {
      const query = `
        {
          allFirstParent(sort: { fields: [children___internal___type], order: [ASC]}) {
            nodes {
              children {
                internal {
                  type
                }
              }
              name
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allFirstParent: {
          nodes: [
            {
              children: [
                {
                  internal: {
                    type: `Child`,
                  },
                },
              ],
              name: `Parent 3`,
            },
            {
              children: [
                {
                  internal: {
                    type: `FirstChild`,
                  },
                },
              ],
              name: `Parent 1`,
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`sort on resolved field`, async () => {
      const query = `
        {
          allMarkdown(sort: { fields: [frontmatter___authors___name], order: [DESC]}) {
            nodes {
              frontmatter {
                title
                authors {
                  name
                }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allMarkdown: {
          nodes: [
            {
              frontmatter: {
                title: `Markdown File 1`,
                authors: [
                  {
                    name: `Author 1`,
                  },
                  {
                    name: `Author 2`,
                  },
                ],
              },
            },
            {
              frontmatter: {
                title: `Markdown File 2`,
                authors: [
                  {
                    name: `Author 1`,
                  },
                ],
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })

    it(`sort on ___NODE field`, async () => {
      const query = `
        {
          allMarkdown(sort: { fields: [frontmatter___reviewer___name], order: [DESC]}) {
            nodes {
              frontmatter {
                title
                reviewer {
                  name
                }
              }
            }
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        allMarkdown: {
          nodes: [
            {
              frontmatter: {
                title: `Markdown File 2`,
                reviewer: null,
              },
            },
            {
              frontmatter: {
                title: `Markdown File 1`,
                reviewer: {
                  name: `Author 2`,
                },
              },
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
    })
  })
})
