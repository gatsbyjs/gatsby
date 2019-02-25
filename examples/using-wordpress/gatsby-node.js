const path = require(`path`)
const slash = require(`slash`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
// Will create pages for Wordpress pages (route : /{slug})
// Will create pages for Wordpress posts (route : /post/{slug})
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  // The “graphql” function allows us to run arbitrary
  // queries against the local Wordpress graphql schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.

  // ==== PAGES (WORDPRESS NATIVE) ====
  const pages = await graphql(
    `
      {
        allWordpressPage {
          edges {
            node {
              id
              slug
              status
              template
            }
          }
        }
      }
    `
  )

  if (pages.errors) {
    throw new Error(pages.errors)
  }

  // Create Page pages.
  const pageTemplate = path.resolve(`./src/templates/page.js`)
  // We want to create a detailed page for each
  // page node. We'll just use the Wordpress Slug for the slug.
  // The Page ID is prefixed with 'PAGE_'
  await Promise.all(
    pages.data.allWordpressPage.edges.map(edge =>
      // Gatsby uses Redux to manage its internal state.
      // Plugins and sites can use functions like "createPage"
      // to interact with Gatsby.
      createPage({
        // Each page is required to have a `path` as well
        // as a template component. The `context` is
        // optional but is often necessary so the template
        // can query data specific to each page.
        path: `/${edge.node.slug}/`,
        component: slash(pageTemplate),
        context: {
          id: edge.node.id,
        },
      })
    )
  )
  // ==== END PAGES ====

  // ==== POSTS (WORDPRESS NATIVE AND ACF) ====
  const posts = await graphql(
    `
      {
        allWordpressPost {
          edges {
            node {
              id
              slug
              status
              template
              format
            }
          }
        }
      }
    `
  )

  if (posts.errors) {
    throw new Error(posts.errors)
  }

  const postTemplate = path.resolve(`./src/templates/post.js`)
  // We want to create a detailed page for each
  // post node. We'll just use the Wordpress Slug for the slug.
  // The Post ID is prefixed with 'POST_'
  return Promise.all(
    posts.data.allWordpressPost.edges.map(edge =>
      createPage({
        path: edge.node.slug,
        component: slash(postTemplate),
        context: {
          id: edge.node.id,
        },
      })
    )
  )
  // ==== END POSTS ====
}
