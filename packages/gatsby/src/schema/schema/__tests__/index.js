const { GraphQLSchema, GraphQLBoolean, GraphQLInt } = require(`graphql`)

const { buildSchema, updateSchema } = require(`..`)

jest.mock(`../../db`, () => {
  const nodes = [
    {
      id: 1,
      parent: 2,
      children: [],
      internal: { type: `Markdown` },
      frontmatter: { important: true, authors: [`Foo`] },
    },
    {
      id: 2,
      parent: null,
      children: [],
      internal: { type: `File` },
    },
    {
      id: 3,
      parent: null,
      children: [],
      internal: { type: `Author` },
      lastname: `Foo`,
      firstname: `Bar`,
    },
  ]
  return {
    getById: id => nodes.find(node => node.id === id),
    getNodes: () => nodes,
    getNodesByType: type => nodes.filter(node => node.internal.type === type),
  }
})

jest.mock(`../../../utils/api-runner-node`, () => (api, options) => {
  /* eslint-disable no-case-declarations */
  switch (api) {
    case `addTypeDefs`:
      const typeDefs = [
        `
      type Frontmatter {
        title: String!
        date: Date!
        authors: [Author] @link(by: "lastname")
        tags: [String]
        published: Boolean
      }
      type Markdown implements Node {
        html: String
        htmlAst: JSON
        frontmatter: Frontmatter
      }
    `,
        `
      type Author implements Node {
        lastname: String
        firstname: String
        email: String
        posts: [Markdown]
      }`,
      ]
      typeDefs.forEach(options.addTypeDefs)
      break

    case `addResolvers`:
      const resolvers = {
        Author: {
          posts: ({ source, context, info }) => {
            // FIXME:
            const { schemaComposer } = context
            // const type = info.returnType.ofType.name
            const type = `Markdown`
            const findMany = schemaComposer.getTC(type).getResolver(`findMany`)
              .resolve
            const { firstname, lastname } = source
            const args = {
              filter: {
                frontmatter: {
                  authors: {
                    firstname: { eq: firstname },
                    lastname: { eq: lastname },
                  },
                },
              },
            }
            return findMany({ source, args, context, info })
          },
        },
      }
      options.addResolvers(resolvers)
      break

    case `setFieldsOnGraphQLNodeType`:
      // FIXME:
      // const { schemaComposer } = options
      return (
        options.type.name === `Markdown` && {
          archived: `Boolean`,
          [`frontmatter.viral`]: `Boolean`,
        }
      )

    default:
    //noop
  }
  return null
})

describe(`Schema builder`, () => {
  it(`builds schema`, async () => {
    const schema = await buildSchema()

    expect(schema).toBeInstanceOf(GraphQLSchema)
    expect(Object.keys(schema.getQueryType().getFields())).toEqual(
      expect.arrayContaining([
        `markdown`,
        `allMarkdown`,
        `pageMarkdown`,
        `author`,
        `allAuthor`,
        `pageAuthor`,
      ])
    )

    const args = schema
      .getQueryType()
      .getFields()
      .allMarkdown.args.map(({ type, name }) => ({ type, name }))
    expect(args).toEqual(
      expect.arrayContaining([
        { name: `filter`, type: schema.getType(`MarkdownInput`) },
        { name: `sort`, type: schema.getType(`MarkdownSortInput`) },
        { name: `skip`, type: GraphQLInt },
        { name: `limit`, type: GraphQLInt },
      ])
    )

    // TODO: children fields
    // const childrenFields = schema.getType(`File`).getFields()
    // expect(childrenFields).toBeUndefined()

    expect(schema.getDirectives().map(directive => directive.name)).toEqual([
      `deprecated`,
      `include`,
      `skip`,
      `dateformat`,
      `link`,
    ])

    expect(schema.getType(`Frontmatter`).getFields().important.type).toBe(
      GraphQLBoolean
    )
    // TODO: Should also check that inferred `File` type is created

    expect(schema.getType(`Markdown`).getFields().archived.type).toBe(
      GraphQLBoolean
    )
    expect(schema.getType(`Frontmatter`).getFields().viral.type).toBe(
      GraphQLBoolean
    )

    expect(
      schema.getType(`Frontmatter`).getFields().authors.resolve
    ).toBeInstanceOf(Function)
    expect(schema.getType(`Author`).getFields().posts.resolve).toBeInstanceOf(
      Function
    )

    const authorType = schema.getType(`Author`)
    const result = authorType
      .getFields()
      .posts.resolve(
        { lastname: `Foo`, firstname: `Bar` },
        {},
        {},
        { fieldName: `posts`, returnType: authorType.getFields().posts.type }
      )
    expect(result.id).toBe(1)
  })

  it.skip(`updates schema`, () => {
    // TODO:
  })
})
