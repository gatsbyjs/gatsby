const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const kebab = require(`lodash.kebabcase`)
const Debug = require(`debug`)

const Posts = require.resolve(`./src/templates/posts`)
const Post = require.resolve(`./src/templates/post`)
const Tag = require.resolve(`./src/templates/tag`)

const debug = Debug(`gatsby-theme-blog-mdx`)

exports.createPages = async ({ graphql, actions }, pluginOptions) => {
  const { createPage, createRedirect } = actions

  const { postsPath = `/blog`, postsPerPage = 9999 } = pluginOptions

  const result = await graphql(`
    {
      mdxPages: allMdx(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: { frontmatter: { draft: { ne: true }, archived: { ne: true } } }
      ) {
        edges {
          node {
            id
            excerpt
            timeToRead
            tableOfContents
            headings {
              value
            }
            parent {
              ... on File {
                name
                sourceInstanceName
              }
            }
            frontmatter {
              path
              tags
              title
              redirects
              date(formatString: "MMMM DD, YYYY")
            }
            code {
              scope
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.log(result.errors)
    throw new Error(`Could not query posts`, result.errors)
  }

  const { mdxPages } = result.data

  // Collect tags
  const allTags = mdxPages.edges.reduce((acc, post) => {
    const {
      node: { frontmatter = {} },
    } = post
    return acc.concat(frontmatter.tags || [])
  }, [])
  const tags = [...new Set(allTags)]

  // Create post pages and redirects
  mdxPages.edges.forEach(({ node }) => {
    const fallbackPath = `/${node.parent.sourceInstanceName}/${
      node.parent.name
    }`
    const path = node.frontmatter.path || fallbackPath

    if (node.frontmatter.redirects) {
      node.frontmatter.redirects.forEach(fromPath => {
        createRedirect({
          fromPath,
          toPath: path,
          redirectInBrowser: true,
          isPermanent: true,
        })
      })
    }

    createPage({
      path,
      context: node,
      component: Post,
    })
  })

  // Create post list pages
  const posts = mdxPages.edges
  const numPages = Math.ceil(posts.length / postsPerPage)
  Array.from({ length: numPages }).forEach((_, i) => {
    const limit = postsPerPage
    const skip = i * postsPerPage
    const currentPage = i + 1

    const isFirst = currentPage === 1
    const isLast = currentPage === numPages

    const nextPage = isLast ? null : `${postsPath}/${currentPage + 1}`
    const prevPage = isFirst
      ? null
      : `${postsPath}/${currentPage - 1 === 1 ? `` : currentPage - 1}`

    createPage({
      path: isFirst ? postsPath : `${postsPath}/${currentPage}`,
      component: Posts,
      context: {
        limit,
        skip,
        currentPage,
        isFirst,
        isLast,
        nextPage,
        prevPage,
      },
    })
  })

  tags.forEach(tag => {
    const path = `/tags/${kebab(tag)}`

    createPage({
      path,
      component: Tag,
      context: {
        tag,
      },
    })
  })
}

exports.onPreBootstrap = ({ store }) => {
  const { program } = store.getState()

  const dirs = [
    path.join(program.directory, `posts`),
    path.join(program.directory, `src/pages`),
    path.join(program.directory, `src/data`),
  ]

  dirs.forEach(dir => {
    debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}
