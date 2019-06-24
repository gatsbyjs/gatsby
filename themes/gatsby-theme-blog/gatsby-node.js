const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Debug = require(`debug`)

// @TODO document theme options:
// - takes an option `contentDir` for where the post content will live. Defaults to `posts`
// - takes an option `assetDir` for where required assets will live. Defaults to `assets`

const debug = Debug(`gatsby-theme-blog`)

// These are customizable theme options we only need to check once
let basePath
let contentDir
let assetDir

// These templates are simply data-fetching wrappers that import components
const PostTemplate = require.resolve(`./src/templates/post`)
const PostsTemplate = require.resolve(`./src/templates/posts`)

// Ensure that content directories exist at site-level
exports.onPreBootstrap = ({ store }, themeOptions) => {
  const { program } = store.getState()

  basePath = themeOptions.basePath || `/`
  contentDir = themeOptions.contentDir || `posts`
  assetDir = themeOptions.assetDir || `assets`

  const dirs = [
    path.join(program.directory, contentDir),
    path.join(program.directory, assetDir),
  ]

  dirs.forEach(dir => {
    debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      site {
        siteMetadata {
          title
        }
      }
      mdxPages: allMdx(
        sort: { fields: [frontmatter___date, frontmatter___title], order: DESC }
        filter: { fields: { source: { in: ["posts"] } } }
        limit: 1000
      ) {
        edges {
          node {
            id
            excerpt
            fields {
              source
              slug
            }
            frontmatter {
              title
              date(formatString: "MMMM DD, YYYY")
            }
            body
            parent {
              ... on File {
                name
                base
                relativePath
                sourceInstanceName
              }
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  // Create Posts and Post pages.
  const {
    mdxPages,
    site: { siteMetadata },
  } = result.data
  const posts = mdxPages.edges
  const siteTitle = siteMetadata.title

  // Create a page for each Post
  posts.forEach(({ node: post }, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1]
    const next = index === 0 ? null : posts[index - 1]
    const { slug } = post.fields
    createPage({
      path: slug,
      component: PostTemplate,
      context: {
        ...post,
        siteTitle,
        previous,
        next,
      },
    })
  })

  // // Create the Posts page
  createPage({
    path: basePath,
    component: PostsTemplate,
    context: {
      posts,
      siteTitle,
    },
  })
}

// Create fields for post slugs and source
// This will change with schema customization with work
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  const toPostPath = node => {
    const { dir } = path.parse(node.relativePath)
    return path.join(basePath, dir, node.name)
  }

  // Make sure it's an MDX node
  if (node.internal.type !== `Mdx`) {
    return
  }

  // Create source field (according to contentDir)
  const fileNode = getNode(node.parent)
  const source = fileNode.sourceInstanceName

  createNodeField({
    node,
    name: `source`,
    value: source,
  })

  if (source === contentDir) {
    const slug = toPostPath(fileNode)

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}
