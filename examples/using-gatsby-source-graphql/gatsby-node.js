const path = require(`path`)
const remark = require(`remark`)
const html = require(`remark-html`)
const dateformat = require(`dateformat`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const { makeBlogPath } = require(`./src/utils`)

exports.createPages = async ({ actions, graphql }) => {
  const { data } = await graphql(`
    query {
      cms {
        blogPosts(where: { status: PUBLISHED }) {
          id
          createdAt
          slug
        }
      }
    }
  `)

  data.cms.blogPosts.forEach(blog => {
    actions.createPage({
      path: makeBlogPath(blog),
      component: path.resolve(`./src/components/blog-post.js`),
      context: {
        blogId: blog.id,
      },
    })
  })
}

exports.createResolvers = ({
  actions,
  cache,
  createNodeId,
  createResolvers,
  store,
  reporter,
}) => {
  const { createNode } = actions
  createResolvers({
    GraphCMS_BlogPost: {
      createdAt: {
        type: `String`,
        resolve(source, args, context, info) {
          return dateformat(source.date, `fullDate`)
        },
      },
      post: {
        resolve(source, args, context, info) {
          return remark().use(html).processSync(source.post).contents
        },
      },
    },
    GraphCMS_Asset: {
      imageFile: {
        type: `File`,
        // projection: { url: true },
        resolve(source, args, context, info) {
          return createRemoteFileNode({
            url: source.url,
            cache,
            createNode,
            createNodeId,
          })
        },
      },
    },
  })
}
