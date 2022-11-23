const fs = require("fs")
const path = require(`path`)

const blogPost = path.resolve(`./src/templates/blog-post.js`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
      allTexto {
        nodes {
          id
          slug
          title # used in prev/next
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const posts = result.data.allTexto.nodes

  posts.forEach(({ id, slug }, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1]
    const next = index === 0 ? null : posts[index - 1]

    createPage({
      path: slug,
      component: blogPost,
      context: {
        id,
        slug,
        previous,
        next,
      },
    })
  })
}

exports.shouldOnCreateNode = ({ node }) =>
  node.internal.type === "File"

exports.onCreateNode = ({ node, actions, createNodeId }) => {
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
  const description = html.slice(
    offset2 + "<blockquote>".length,
    html.indexOf("</blockquote>", offset2)
  )

  actions.createNode({
    id: createNodeId(slug),
    slug,
    date,
    title,
    description,
    html,
    internal: {
      type: "Texto",
      contentDigest: html,
    },
    parent: node.id, // Required otherwise the node is not cached and a warm build screws up. TODO: is touchNode faster?
  })
}
