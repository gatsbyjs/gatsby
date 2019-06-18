const fs = require(`fs`)
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

const BlogPost = require.resolve(`./src/templates/blog-post.js`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(
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
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panic(result.errors)
  }

  // Create blog post pages.
  const posts = result.data.allMdx.nodes

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1]
    const next = index === 0 ? null : posts[index - 1]

    createPage({
      path: post.fields.slug,
      component: postPage,
      context: {
        slug: post.fields.slug,
        previous,
        next,
      },
    })
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
