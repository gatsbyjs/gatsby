exports.addTypeDefs = ({ addTypeDefs }) => {
  const typeDefs = `
    type AuthorJson implements Node {
      name: String!
      email: String!
      picture: File @link(by: "relativePath")
      posts: [BlogJson] @link(by: "authors.email", from: "email")
    }

    type BlogJson implements Node {
      title: String!
      authors: [AuthorJson] @link(by: "email")
      text: String
      date: Date @dateformat(formatString: "yyyy/MM/dd")
      tags: [String]
    }
  `
  addTypeDefs(typeDefs)
}

exports.addResolvers = ({
  addResolvers,
  actions,
  cache,
  store,
  createNodeId,
  // createContentDigest,
  // reporter,
  // getNode,
  // getNodeAndSavePathDependency,
  // pathPrefix,
}) => {
  const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
  const { createNode } = actions
  const resolvers = {
    GraphCMS_BlogPost: {
      // Wrap the resolver on an existing field by providing a function.
      // The original resolver is available on `info.resolver`.
      // This approach works fine if the returnType stays the same.
      post: async (source, args, context, info) => {
        const remark = require(`remark`)
        const html = require(`remark-html`)
        const result = await info.resolver(source, args, context, info)
        // return a Promise with the markdown string converted to html
        return remark()
          .use(html)
          .process(result)
      },
    },
    GraphCMS_Asset: {
      // Instead of a resolve function it is possible to provide a
      // field config for a *new* field.
      // This allows specifying a return type. The values of sibling fields
      // are available from `source` if they are in the selection set.
      // Be aware that without other fields in the selection set this will
      // throw if the parent is NonNull, even if this resolver returns a value.
      // This is because the delegated schema does not know about this field.
      imageFile: {
        type: `File`,
        // Projection fields will be included in the selection set without
        // having to be explicitly added to the query, i.e.
        // they will be accessible from `source`.
        projection: { url: true, fileName: true },
        resolve: async (source, args, context, info) => {
          const { fileName, url } = source
          const ext = `.` + fileName.match(/[^.]*$/)
          const node = await createRemoteFileNode({
            url,
            store,
            cache,
            createNode,
            createNodeId,
            ext,
            // name: fileName, // Needs #11054
          })
          return node
        },
      },
    },
  }
  addResolvers(resolvers)
}
