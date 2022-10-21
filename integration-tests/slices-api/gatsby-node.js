const path = require(`path`)
const { authors, blogs } = require(`./shared-data`)

exports.sourceNodes = ({
  actions: { createNode },
  createNodeId,
  createContentDigest,
}) => {
  authors.map(author =>
    createNode({
      ...author,
      id: createNodeId(author.authorId),
      internal: {
        type: `Author`,
        contentDigest: createContentDigest(author),
      },
    })
  )

  blogs.map(blog =>
    createNode({
      ...blog,
      id: createNodeId(blog.id),
      internal: {
        type: `Blog`,
        contentDigest: createContentDigest(blog),
      },
    })
  )
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage, createSlice } = actions

  /**
   * Create general slices
   */
  createSlice({
    id: `header`,
    component: require.resolve(`./src/components/header.js`),
  })

  createSlice({
    id: `footer`,
    component: require.resolve(`./src/components/footer.js`),
  })

  /**
   * Create slices for each author bio
   */

  // Define a component for author bio
  const authorBio = path.resolve(`./src/components/bio.js`)

  const authorResults = await graphql(
    `
      {
        allAuthor {
          nodes {
            authorId
          }
        }
      }
    `
  )

  if (authorResults.errors) {
    reporter.panicOnBuild(
      `There was an error loading your authors`,
      authorResults.errors
    )
    return
  }

  const authors = authorResults.data.allAuthor.nodes

  if (authors.length > 0) {
    authors.forEach(author => {
      console.log({ author })
      // create slice for author
      createSlice({
        id: `bio--${author.authorId}`,
        component: authorBio,
        context: {
          id: author.authorId,
        },
      })
    })
  }

  /**
   * Create blog posts
   */

  // Define a template for blog post
  const blogTemplate = path.resolve(`./src/templates/blog-post.js`)

  // Get all markdown blog posts sorted by date
  const blogResults = await graphql(
    `
      {
        allBlog {
          nodes {
            id
            slug
            authorId
          }
        }
      }
    `
  )

  if (blogResults.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      blogResults.errors
    )
    return
  }

  const posts = blogResults.data.allBlog.nodes

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.slug,
        component: blogTemplate,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
        slices: {
          // Instruct this blog page to use the matching bio slice
          // Any time the "bio" alias is seen, it'll use the "bio--${authorId}" slice
          bio: `bio--${post.authorId}`,
        },
      })
    })
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
    }

    type Blog implements Node {
      id: String
      title: String
      authorId: String
      content: String
      slug: String
    }

    type Author implements Node {
      id: String
      authorId: String
      name: String
      summary: String
      twitter: String
    }
  `)
}
