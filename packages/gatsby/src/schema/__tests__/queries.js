const { graphql } = require(`graphql`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { build } = require(`..`)
const withResolverContext = require(`../context`)

jest.mock(`../../utils/api-runner-node`)
const apiRunnerNode = require(`../../utils/api-runner-node`)

const nodes = require(`./fixtures/queries`)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
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

  const runQuery = (query, variables) =>
    graphql(
      schema,
      query,
      undefined,
      withResolverContext({
        schema,
        schemaComposer,
      }),
      variables
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
                  const { entries } = await context.nodeModel.findAll({
                    type: `Author`,
                    query: { filter: { email: { in: source.authors } } },
                  })
                  return entries.map(author => author.name)
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
                async resolve(source, args, context, info) {
                  const { entries } = await context.nodeModel.findAll({
                    type: `Markdown`,
                    query: {
                      filter: {
                        frontmatter: {
                          // authors: { email: { eq: source.email } },
                          authors: {
                            elemMatch: { email: { eq: source.email } },
                          },
                        },
                      },
                    },
                  })
                  return entries
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
                childrenMarkdown { frontmatter { title } }
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
                childrenMarkdown: [
                  { frontmatter: { title: `Markdown File 1` } },
                ],
              },
            },
            {
              node: {
                childMarkdown: { frontmatter: { title: `Markdown File 2` } },
                childrenMarkdown: [
                  { frontmatter: { title: `Markdown File 2` } },
                ],
              },
            },
            {
              node: {
                childMarkdown: null,
                childrenMarkdown: [],
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
                childAuthor { name }
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
                childAuthor: null,
                childrenAuthor: [],
              },
            },
            {
              node: {
                childAuthor: null,
                childrenAuthor: [],
              },
            },
            {
              node: {
                childAuthor: { name: `Author 2` },
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

      it(`recursively groups query results`, async () => {
        const query = `
          {
            allMarkdown {
              group(field: frontmatter___title) {
                fieldValue
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
        const expected = {
          allMarkdown: {
            group: [
              {
                fieldValue: `Markdown File 1`,
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
              {
                fieldValue: `Markdown File 2`,
                group: [
                  {
                    fieldValue: `Author 1`,
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

      it(`groups using reserved keywords`, async () => {
        const query = `
          {
            allMarkdown {
              group(field: frontmatter___tags) {
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
              "group": Array [
                Object {
                  "field": "frontmatter.tags",
                  "fieldValue": "constructor",
                },
              ],
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
    describe(`aggregation fields`, () => {
      it(`calculates max value of numeric field`, async () => {
        const query = `
          {
            allMarkdown {
              max(field: frontmatter___views)
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data.allMarkdown.max).toEqual(200)
      })

      it(`calculates max value of numeric string field`, async () => {
        const query = `
          {
            allMarkdown {
              max(field: frontmatter___price)
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data.allMarkdown.max).toEqual(3.99)
      })

      it(`calculates min value of numeric field`, async () => {
        const query = `
          {
            allMarkdown {
              min(field: frontmatter___views)
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data.allMarkdown.min).toEqual(100)
      })

      it(`calculates min value of numeric string field`, async () => {
        const query = `
          {
            allMarkdown {
              min(field: frontmatter___price)
            }
          }
        `
        const results = await runQuery(query)
        expect(results.errors).toBeUndefined()
        expect(results.data.allMarkdown.min).toEqual(1.99)
      })
    })

    it(`calculates sum of numeric field`, async () => {
      const query = `
        {
          allMarkdown {
            sum(field: frontmatter___views)
          }
        }
      `
      const results = await runQuery(query)
      expect(results.errors).toBeUndefined()
      expect(results.data.allMarkdown.sum).toEqual(300)
    })

    it(`calculates sum of numeric string field`, async () => {
      const query = `
        {
          allMarkdown {
            sum(field: frontmatter___price)
          }
        }
      `
      const results = await runQuery(query)
      expect(results.errors).toBeUndefined()
      expect(results.data.allMarkdown.sum).toEqual(5.98)
    })

    it(`returns null for min of non-numeric fields`, async () => {
      const query = `
        {
          allMarkdown {
            min(field: frontmatter___title)
          }
        }
      `
      const results = await runQuery(query)
      expect(results.errors).toBeUndefined()
      expect(results.data.allMarkdown.min).toBeNull()
    })

    it(`returns null for max of non-numeric fields`, async () => {
      const query = `
        {
          allMarkdown {
            max(field: frontmatter___title)
          }
        }
      `
      const results = await runQuery(query)
      expect(results.errors).toBeUndefined()
      expect(results.data.allMarkdown.max).toBeNull()
    })

    it(`returns null for sum of non-numeric fields`, async () => {
      const query = `
        {
          allMarkdown {
            sum(field: frontmatter___title)
          }
        }
      `
      const results = await runQuery(query)
      expect(results.errors).toBeUndefined()
      expect(results.data.allMarkdown.sum).toBeNull()
    })

    it(`calculates aggregation in recursively grouped query results`, async () => {
      const query = `
        {
          allMarkdown {
            group(field: frontmatter___authors___name) {
              fieldValue
              group(field: frontmatter___title) {
                fieldValue
                max(field: frontmatter___price)
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
              group: [
                {
                  fieldValue: `Markdown File 1`,
                  max: 1.99,
                },
                {
                  fieldValue: `Markdown File 2`,
                  max: 3.99,
                },
              ],
            },
            {
              fieldValue: `Author 2`,
              group: [
                {
                  fieldValue: `Markdown File 1`,
                  max: 1.99,
                },
              ],
            },
          ],
        },
      }
      expect(results.errors).toBeUndefined()
      expect(results.data).toEqual(expected)
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

  describe(`with regex filter`, () => {
    /**
     * double-escape character escape sequences when written inline (test only)
     * (see also the test src/utils/__tests__/prepare-regex.ts)
     */
    it(`escape sequences work when correctly escaped`, async () => {
      const query = `
        {
          allMarkdown(filter: { frontmatter: { authors: { elemMatch: { email: { regex: "/^\\\\w{6}\\\\d@\\\\w{7}\\\\.COM$/i" } } } } }) {
            nodes {
              frontmatter {
                authors {
                  email
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
                authors: [
                  {
                    email: `author1@example.com`,
                  },
                  {
                    email: `author2@example.com`,
                  },
                ],
              },
            },
            {
              frontmatter: {
                authors: [
                  {
                    email: `author1@example.com`,
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

    /**
     * queries are read from file and parsed with babel
     */
    it(`escape sequences work when correctly escaped`, async () => {
      const fs = require(`fs`)
      const path = require(`path`)
      const babel = require(`@babel/parser`)
      const fileContent = fs.readFileSync(
        path.join(__dirname, `./fixtures/regex-query.js`),
        `utf-8`
      )
      const ast = babel.parse(fileContent)
      const query = ast.program.body[0].expression.right.quasis[0].value.raw

      const results = await runQuery(query)
      const expected = {
        allMarkdown: {
          nodes: [
            {
              frontmatter: {
                authors: [
                  {
                    email: `author1@example.com`,
                  },
                  {
                    email: `author2@example.com`,
                  },
                ],
              },
            },
            {
              frontmatter: {
                authors: [
                  {
                    email: `author1@example.com`,
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
  })

  describe(`with skip/limit`, () => {
    const query = `
        query ($limit: Int!, $skip: Int!) {
          allFile(limit: $limit, skip: $skip) {
            totalCount
            pageInfo {
              currentPage
              hasNextPage
              hasPreviousPage
              itemCount
              pageCount
              perPage
              totalCount
            }
          }
        }
      `
    it(`return correct pagination info for the first page`, async () => {
      const results = await runQuery(query, { limit: 1, skip: 0 })
      expect(results).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "allFile": Object {
              "pageInfo": Object {
                "currentPage": 1,
                "hasNextPage": true,
                "hasPreviousPage": false,
                "itemCount": 1,
                "pageCount": 3,
                "perPage": 1,
                "totalCount": 3,
              },
              "totalCount": 3,
            },
          },
        }
      `)
    })

    it(`return correct pagination info for the page in the middle`, async () => {
      const results = await runQuery(query, { limit: 1, skip: 1 })
      expect(results).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "allFile": Object {
              "pageInfo": Object {
                "currentPage": 2,
                "hasNextPage": true,
                "hasPreviousPage": true,
                "itemCount": 1,
                "pageCount": 3,
                "perPage": 1,
                "totalCount": 3,
              },
              "totalCount": 3,
            },
          },
        }
      `)
    })

    it(`return correct pagination info for the last page`, async () => {
      const results = await runQuery(query, { limit: 1, skip: 2 })
      expect(results).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "allFile": Object {
              "pageInfo": Object {
                "currentPage": 3,
                "hasNextPage": false,
                "hasPreviousPage": true,
                "itemCount": 1,
                "pageCount": 3,
                "perPage": 1,
                "totalCount": 3,
              },
              "totalCount": 3,
            },
          },
        }
      `)
    })
  })
})
