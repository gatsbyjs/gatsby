const fs = require("fs")
const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allTexto(sort: { fields: date, order: ASC }) {
          edges {
            node {
              id
              slug
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allTexto.edges

  posts.forEach(({ node }, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: node.slug,
      component: blogPost,
      context: {
        id: node.id,
        slug: node.slug,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions }) => {
  if (node.internal.type === "File") {
    // Do minimal processing to get some key pieces. This could be gatsby-transformer-text or -html :p

    const html = fs.readFileSync(node.absolutePath, "utf8")

    const base = path.basename(node.absolutePath)
    const slug = base.slice(11, -5) // remove date prefix and `..txt` tail
    const date = base.slice(0, 10)

    const offset1 = html.indexOf("<h1>")
    const title = html.slice(
      offset1 + "<h1>".length,
      html.indexOf("</h1>", offset1)
    )

    const offset2 = html.indexOf("<blockquote>", offset1)
    const desc = html.slice(
      offset2 + "<blockquote>".length,
      html.indexOf("</blockquote>", offset2)
    )

    actions.createNode({
      id: slug,
      slug,
      date,
      title,
      desc,
      the_text: html,
      internal: {
        type: "Texto",
        contentDigest: html,
      },
      parent: node.id, // Required otherwise the node is not cached and a warm build screws up
    })
  }
}
