const fs = require(`fs`)

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions

  // Type definitions can be provided in SDL
  const typeDefs = `
    type AuthorJson implements Node {
      name: String!
      firstName: String!
      email: String!
      picture: File
    }

    type BlogJson implements Node {
      title: String!
      authors: [AuthorJson]
      text: String
      date: Date
      tags: [String]
      meta: Metadata
    }
  `
  createTypes(typeDefs)

  // Alternatively, you can use type builders to construct types
  createTypes([
    schema.buildObjectType({
      name: `CommentJson`,
      fields: {
        text: `String!`,
        blog: {
          type: `BlogJson`,
          resolve(parent, args, context) {
            return context.nodeModel.getNodeById({
              id: parent.blog,
              type: `BlogJson`,
            })
          },
        },
        author: {
          type: `AuthorJson`,
          resolve(parent, args, context) {
            return context.nodeModel.getNodeById({
              id: parent.author,
              type: `AuthorJson`,
            })
          },
        },
      },
      interfaces: [`Node`],
    }),
  ])

  // It is of course also possible to read type definitions from a .gql file,
  // which will give you proper syntax highlighting
  const additionalTypeDefs = fs.readFileSync(`type-defs.gql`, {
    encoding: `utf-8`,
  })
  createTypes(additionalTypeDefs)
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Query: {
      // Create a new root query field.
      allAuthorFullNames: {
        type: [`String!`],
        resolve(source, args, context, info) {
          const authors = context.nodeModel.getAllNodes({
            type: `AuthorJson`,
          })
          return authors.map(author => `${author.name}, ${author.firstName}`)
        },
      },
      // Field resolvers can use all of Gatsby's querying capabilities
      allPostsTaggedWithBaz: {
        type: [`BlogJson`],
        resolve(source, args, context, info) {
          return context.nodeModel.runQuery({
            query: { filter: { tags: { eq: `baz` } } },
            type: `BlogJson`,
            firstOnly: false,
          })
        },
      },
    },
    AuthorJson: {
      // Add a field to an existing type by providing a field config.
      // Note that added fields will not be available in the input filter
      // when no type definitions are provided with `createTypes`.
      posts: {
        type: [`BlogJson`],
        resolve(source, args, context, info) {
          // We use an author's `email` as foreign key in `BlogJson.authors`
          const fieldValue = source.email

          const posts = context.nodeModel.getAllNodes({
            type: `BlogJson`,
          })
          return posts.filter(post =>
            (post.authors || []).some(author => author === fieldValue)
          )
        },
      },
    },
    BlogJson: {
      // Add a resolver to a field defined with `createTypes`.
      authors: {
        resolve(source, args, context, info) {
          const emails = source[info.fieldName]
          if (emails == null) return null

          const authors = context.nodeModel.getAllNodes({
            type: `AuthorJson`,
          })
          return authors.filter(author => emails.includes(author.email))
        },
      },
      comments: {
        type: `[CommentJson!]!`,
        resolve(source, args, context, info) {
          const result = context.nodeModel.getAllNodes({
            type: `CommentJson`,
          })
          return result.filter(({ blog }) => blog === source.id)
        },
      },
    },
  })
}
