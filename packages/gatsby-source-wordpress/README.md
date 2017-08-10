# gatsby-source-wordpress

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from WordPress sites using the [WordPress JSON REST API](https://developer.wordpress.org/rest-api/reference/).

An [example site](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress) for using this plugin is available.

## Wish list

- [x] gatsby source plugin for WordPress
- [x] pull data from self-hosted WordPress even behind HTAccess
- [x] pull data from site hosted on wordpress.com, wordpress.org
- [x] retrive any number of article and posts (tested on 900 posts)
- [ ] authentify to wordpress.com API using OAuth 2 so medias can be queried. [[WIP](https://github.com/gatsbyjs/gatsby/pull/1657)]
- [ ] pull images to local file system [WIP]
- [ ] responsive images using sharp [WIP]
- [ ] add testing for `npm run test`

## Status

This module is at prototype-level. It currently pulls from WordPress the following entities : 
- [x] posts
- [x] pages
- [x] tags
- [x] categories
- [x] medias
- [x] types
- [x] users
- [x] statuses
- [x] taxonomies
- [x] and entities exposed by other plugins

It will pull any endpoint provided by WordPress Plugins as long as it appears in the list of endpoints.
  * `//your-site.com/wp-json/` for a self-hosted WordPress or hosted on wordpress.org
  * `https://public-api.wordpress.com/wp/v2/sites/your-site.com` for a site hosted on wordpress.com

## Install

`npm install --save gatsby-source-wordpress`

## How to use

```javascript
// In your gatsby-config.js
  plugins: [
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins. Here the site sources its data from Wordpress.
     */
    {
      resolve: 'gatsby-source-wordpress',
      options: {
         /*
        * The base URL of the Wordpress site without the trailingslash and the protocol. This is required.
        * Example : 'gatsbyjsexamplewordpress.wordpress.com' or 'www.example-site.com' 
        */
        baseUrl: 'gatsbyjsexamplewordpress.wordpress.com',
        // The protocol. This can be http or https.
        protocol: 'http',
        // Indicates whether the site is hosted on wordpress.com. 
        // If false, then the asumption is made that the site is self hosted.
        // If true, then the plugin will source its content on wordpress.com using the JSON REST API V2.
        // If your site is hosted on wordpress.org, then set this to false.
        hostingWPCOM: true,
        // If useACF is true, then the source plugin will try to import the Wordpress ACF Plugin contents. 
        // This feature is untested for sites hosted on Wordpress.com
        useACF: false,
        // If auth.user and auth.pass are filled, then the source plugin will be allowed to access endpoints that are protected with .htaccess. 
        auth: {
          user: 'your-htaccess-username',
          pass: 'your-htaccess-password',
          sendImmediately: false
        },
        // Set verboseOutput to true to display a verbose output on `npm run develop` or `npm run build` 
        // It can help you debug specific API Endpoints problems 
        verboseOutput: false,
      },
    },
  ]
```

## WordPress Plugins 

These plugins were tested but it should work with any plugin that extends the REST API content.

- [x] Custom Post Types : it will work seemlessly, no further option needs to be activated.

- [x] [ACF](https://www.advancedcustomfields.com/) The option `useACF: true` must be activated in your site's `gatsby-config.js`.
    *  You must have the plugin [acf-to-rest-api](https://github.com/airesvsg/acf-to-rest-api) installed in WordPress.
    *  Will pull the `acf: { ... }` fields's contents from any entity which has it attached (pages, posts, medias, ... you choose from in WordPress back-end while creating a Group of Fields). Every node below `acf` is [Stringify'd](https://www.w3schools.com/js/js_json_stringify.asp), then put in a childNode, which means that you will have to call `JSON.parse()` to get an `Object`. (ex. ```const fields = JSON.parse(childWordpressAcfField.internal.content)```)
    *  You will also have to include the children ACF Field Node in your GraphQL query. (See `Query posts with the child ACF Fields Node` below)

- [x] [ACF Pro](https://www.advancedcustomfields.com/pro/)
    *  Will work with [Flexible content](https://www.advancedcustomfields.com/resources/flexible-content/) and premium stuff like that (repeater, gallery, ...).  
    *  Will pull the content attached to the [options page](https://www.advancedcustomfields.com/add-ons/options-page/).

- [x] [WP-API-MENUS](https://wordpress.org/plugins/wp-api-menus/) which gives you the menus and menu locations endpoint.

- [ ] Please PR on this Readme file to report plugin that works but not listed here.


## Wordpress.com hosting [WIP]

This is [WIP](https://github.com/gatsbyjs/gatsby/pull/1657). At the moment, one cannot query on medias so only images inserted using the WYSIWYG editor will work.

You will need to provide an (API Key)[https://en.support.wordpress.com/api-keys/].

Note : you don't need this for Wordpress.org hosting in which your WordPress will behave like a self-hosted instance.

## How to query : GraphQL

You can query nodes created from Wordpress using GraphQL like the following:

  * Note 1: if you use ACF, then add the `acf` field to the queries that has field groups attached.
  * Note 2: to know more about GraphQL and Gatsby, visit this issue in branch [1.0]: https://github.com/gatsbyjs/gatsby/issues/420
  * Note 3: A complete example of site's `gatsby-config.js` to create pages for Wordpress Pages and Posts is provided at the end of this section.

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

### Query pages
```    graphql
  allWordpressPage {
    edges {
      node {
        id
        title
        content
        excerpt
        date
        date_gmt
        modified
        modified_gmt
        slug
        status
        author
        featured_media
        menu_order
        comment_status
        ping_status
        template
      }
    }
  }
```

### Query tags
```    graphql
  allWordpressTag {
    edges {
      node {
        id
        slug
        description
        name
        taxonomy
      }
    }
  }
```

### Query categories
```    graphql
  allWordpressCategory {
    edges {
      node {
        id
        description
        name
        slug
        taxonomy
      }
    }
  }
```

### Query medias
```    graphql
  allWordpressMedia {
    edges {
      node {
        id
        date
        date_gmt
        modified
        modified_gmt
        slug
        status
        author
        comment_status
        ping_status
        template
        title {
          rendered
        }
        caption {
          rendered
        }
        alt_text
        media_type
        mime_type
        media_details {
          width
          height
          file
        }
        post
        source_url
      }
    }
  }
```

### Query types
Note : If you add a new type (like with custom post types plugins) then you will have to add it at the same level than `post`.
```    graphql
  allWordpressTypes {
    edges {
      node {
        id
        post {
          description
          hierarchical
          name
          slug
          rest_base
        }
        page {
          description
          hierarchical
          name
          slug
          rest_base
        }
        attachment {
          description
          hierarchical
          name
          slug
          rest_base
        }
      }
    }
  }
```

### Query users
```    graphql
  allWordpressUsers {
    edges {
      node {
        id
        name
        description
        slug
        avatar_urls {
          _24
          _48
          _96
        }
      }
    }
  }
```

### Query statuses
```    graphql
  allWordpressStatuses {
    edges {
      node {
        id
        publish {
          name
          public
          queryable
          slug
        }
      }
    }
  }
```

### Query taxonomies
```    graphql
  allWordpressTaxonomies {
    edges {
      node {
        id
        category {
          name
          slug
          description
          hierarchical
          rest_base
        }
        post_tag {
          name
          slug
          description
          hierarchical
          rest_base
        }
      }
    }
  }
```
### Query ACF Options
Note : you will have to populate the acf node with your config. Put this in the ___GraphiQL debugger to discover your site's options data model.
```    graphql
  allWordpressAcfOptions {
    edges {
      node {
        id
        acf {
          // put your field group name here
        }
      }
    }
  }
```
### Query WP-API-Menus
```    graphql
  allWordpressWpApiMenusMenus {
    edges {
      node {
        id
        term_id
        name
        name
        slug
        term_group
        term_taxonomy_id
        taxonomy
        description
        count
        filter
        ID
        meta {
          links {
            collection
            self
          }
        }
      }
    }
  }
  allWordpressWpApiMenusMenuLocations {
    edges {
      node {
        id
        // Put your menus locations names here
      }
    }
  }
  allWordpressWpApiMenusMenusExtended {
    edges {
      node {
        name
        count
        items {
          order
          title
          url
        }
      }
    }
  }
```
### Query any other plugin
In the following example, `${Manufacturer}` will be replaced by the endpoint prefix and `${Endpoint}` by the name of the endpoint.

To know what's what, check the URL of the endpoint. 

For example the following URL: `http://my-blog.wordpress.com/wp-json/acf/v2/options`
  * Manufacturer : `acf`
  * Endpoint : `options`
  * Final GraphQL Type : AllWordpressAcfOptions

For example the following URL: `http://my-blog.wordpress.com/wp-api-menus/v2/menu-locations`
  * Manufacturer : `wpapimenus`
  * Endpoint : `menulocations`
  * Final GraphQL Type : AllWordpressWpApiMenusMenuLocations

```    graphql
  allWordpress${Manufacturer}${Endpoint} {
    edges {
      node {
        id
       type
        // Put your fields here
      }
    }
  }
```

### Query posts with the child ACF Fields Node
Mention the apparition of `childWordpressAcfField` in the query below :
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
        childWordpressAcfField {
          internal {
            content
          }
        }
      }
    }
  }
```

### Query pages with the child ACF Fields Node
Mention the apparition of `childWordpressAcfField` in the query below :
```    graphql
  allWordpressPage {
    edges {
      node {
        id
        title
        content
        excerpt
        date
        date_gmt
        modified
        modified_gmt
        slug
        status
        author
        featured_media
        menu_order
        comment_status
        ping_status
        template
        childWordpressAcfField {
          internal {
            content
          }
        }
      }
    }
  }
```

## Site's `gatsby-node.js` example

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
