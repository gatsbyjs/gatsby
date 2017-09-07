# gatsby-source-lever

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from [Lever.co]](https://www.lever.co/).

## Wish list

- [x] gatsby source plugin for Lever.co
- [ ] tests
- [ ] example site

## Install

`npm install --save gatsby-source-lever`

## How to use

```javascript
// In your gatsby-config.js
  plugins: [
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins. Here the site sources its data from Wordpress.
     */
    {
      resolve: 'gatsby-source-lever',
      options: {

        // Set verboseOutput to true to display a verbose output on `npm run develop` or `npm run build`
        // It can help you debug specific API Endpoints problems
        verboseOutput: false,
      },
    },
  ]
```

### Query posts
```    graphql
  allWordpressPost {
    edges {
      node {
        id
        slug
        title
        content
        excerpt
        date
        date_gmt
        modified
        modified_gmt
        status
        author
        featured_media
        comment_status
        ping_status
        sticky
        template
        format
        categories
        tags
      }
    }
  }
```

## Site's `gatsby-node.js` example

If you wish to create Gatsby Pages for Lever.co jobs, you can modify your  `gatsby-node.js`.

```javascript
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const slash = require(`slash`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programatically
// create pages.
// Will create pages for WordPress pages (route : /{slug})
// Will create pages for WordPress posts (route : /post/{slug})
exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    // The “graphql” function allows us to run arbitrary
    // queries against the local WordPress graphql schema. Think of
    // it like the site has a built-in database constructed
    // from the fetched data that you can run queries against.

    // ==== PAGES (WORDPRESS NATIVE) ====
    graphql(
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
      .then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create Page pages.
        const pageTemplate = path.resolve('./src/templates/page.js')
        // We want to create a detailed page for each
        // page node. We'll just use the WordPress Slug for the slug.
        // The Page ID is prefixed with 'PAGE_'
        _.each(result.data.allWordpressPage.edges, edge => {
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
        })
      })
      // ==== END PAGES ====

      // ==== POSTS (WORDPRESS NATIVE AND ACF) ====
      .then(() => {
        graphql(
          `{
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
        ).then(result => {
          if (result.errors) {
            console.log(result.errors)
            reject(result.errors)
          }
          const postTemplate = path.resolve('./src/templates/post.js')
        // We want to create a detailed page for each
        // post node. We'll just use the WordPress Slug for the slug.
        // The Post ID is prefixed with 'POST_'
          _.each(result.data.allWordpressPost.edges, edge => {
            createPage({
              path: `/post/${edge.node.slug}/`,
              component: slash(postTemplate),
              context: {
                id: edge.node.id,
              },
            })
          })
          resolve()
        })
      })
    // ==== END POSTS ====

  })
}
```
