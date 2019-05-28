const fs = require(`fs`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onPreBootstrap = ({ reporter }) => {
  const dirs = [`content`, `content/posts`, `content/assets`]

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      reporter.log(`creating the ${dir} directory`)
      fs.mkdirSync(dir)
    }
  })
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const postPage = require.resolve(`./src/templates/blog-post.js`)
    resolve(
      graphql(
        `
          {
            allMdx(
              sort: {
                fields: [frontmatter___date, frontmatter___title]
                order: DESC
              }
              filter: {
                fields: {
                  source: { in: ["blog-default-posts", "blog-posts"] }
                  slug: { ne: null }
                }
              }
              limit: 1000
            ) {
              edges {
                node {
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog post pages.
        const posts = result.data.allMdx.edges
        _.each(posts, (post, index) => {
          const previous =
            index === posts.length - 1 ? null : posts[index + 1].node
          const next = index === 0 ? null : posts[index - 1].node

          createPage({
            path: post.node.fields.slug,
            component: postPage,
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
            },
          })
        })
      })
    )
  })
}

let userCreatedOwnPosts = false

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Mdx`) {
    // create source field
    const fileNode = getNode(node.parent)
    const source = fileNode.sourceInstanceName

    createNodeField({
      node,
      name: `source`,
      value: source,
    })

    const eligiblePostSources = [`blog-default-posts`, `blog-posts`]

    if (eligiblePostSources.includes(source)) {
      if (source === `blog-posts`) {
        userCreatedOwnPosts = true
      }

      if (userCreatedOwnPosts && source === `blog-default-posts`) {
        return
      }

      // create slug for blog posts
      const value = createFilePath({ node, getNode })
      createNodeField({
        name: `slug`,
        node,
        value,
      })
    }
  }
}
