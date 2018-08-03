# gatsby-source-wordpress

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from
WordPress sites using the
[WordPress REST API](https://developer.wordpress.org/rest-api/reference/).

An example site for this plugin is available.

- [Demo](https://using-wordpress.gatsbyjs.org/)
- [Example site source code](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress)

## Features

- Pulls data from self-hosted WordPress sites, hosted on wordpress.com or
  wordpress.org
- Should work with any number of article and post (tested on a site with 900
  posts)
- Can authenticate to wordpress.com's API using OAuth 2 so media can be queried
- Easily create responsive images in Gatsby from WordPress images. See [image
  processing](#image-processing) section.

## WordPress and custom entities

This module currently pulls from WordPress the following entities:

- [x] All entities are supported (posts, pages, tags, categories, media, types,
      users, statuses, taxonomies, ...)
- [x] Any new entity should be pulled as long the IDs are correct.
- [x] [ACF Entities (Advanced Custom Fields)](https://www.advancedcustomfields.com/)
- [x] Custom post types (any type you could have declared using WordPress'
      `functions.php`)

We welcome PRs adding support for data from other plugins.

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
    resolve: "gatsby-source-wordpress",
    options: {
      /*
       * The base URL of the Wordpress site without the trailingslash and the protocol. This is required.
       * Example : 'gatsbyjsexamplewordpress.wordpress.com' or 'www.example-site.com'
       */
      baseUrl: "gatsbyjsexamplewordpress.wordpress.com",
      // The protocol. This can be http or https.
      protocol: "http",
      // Indicates whether the site is hosted on wordpress.com.
      // If false, then the assumption is made that the site is self hosted.
      // If true, then the plugin will source its content on wordpress.com using the JSON REST API V2.
      // If your site is hosted on wordpress.org, then set this to false.
      hostingWPCOM: false,
      // If useACF is true, then the source plugin will try to import the Wordpress ACF Plugin contents.
      // This feature is untested for sites hosted on Wordpress.com.
      // Defaults to true.
      useACF: true,
      // Include specific ACF Option Pages that have a set post ID
      // Regardless if an ID is set, the default options route will still be retrieved
      // Must be using V3 of ACF to REST to include these routes     
      // Example: `["option_page_1", "option_page_2"]` will include the proper ACF option
      // routes with the ID option_page_1 and option_page_2
      // Dashes in IDs will be converted to underscores for use in GraphQL
      acfOptionPageIds = [],
      auth: {
        // If auth.user and auth.pass are filled, then the source plugin will be allowed
        // to access endpoints that are protected with .htaccess.
        htaccess_user: "your-htaccess-username",
        htaccess_pass: "your-htaccess-password",
        htaccess_sendImmediately: false,

        // If hostingWPCOM is true then you will need to communicate with wordpress.com API
        // in order to do that you need to create an app (of type Web) at https://developer.wordpress.com/apps/
        // then add your clientId, clientSecret, username, and password here
        wpcom_app_clientSecret:
          "NMPnXYFtj2gKas7V1kZyMxr7oLry9V5ZxIyBQGu2txjVHg0GhFz6RYcKopkHICYg",
        wpcom_app_clientId: "54793",
        wpcom_user: "gatsbyjswpexample@gmail.com",
        wpcom_pass: "very-secured-password",
      },
      // Set verboseOutput to true to display a verbose output on `npm run develop` or `npm run build`
      // It can help you debug specific API Endpoints problems.
      verboseOutput: false,
      // Set how many pages are retrieved per API request.
      perPage: 100,
      // Search and Replace Urls across WordPress content.
      searchAndReplaceContentUrls: {
        sourceUrl: "https://source-url.com",
        replacementUrl: "https://replacement-url.com",
      },
      // Set how many simultaneous requests are sent at once.
      concurrentRequests: 10,
      // Exclude specific routes using glob parameters
      // See: https://github.com/isaacs/minimatch
      // Example:  `["/*/*/comments", "/yoast/**"]` will exclude routes ending in `comments` and
      // all routes that begin with `yoast` from fetch.
      excludedRoutes: ["/*/*/comments", "/yoast/**"],
      // use a custom normalizer which is applied after the built-in ones.
      normalizer: function({ entities }) {
        return entities
      },
    },
  },
]
```

## WordPress Plugins

These plugins were tested. We welcome PRs adding support for data from other
plugins.

- [x] Custom Post Types : it will work seamlessly, no further option needs to be
      activated. ("Show in REST API" setting needs to be set to true on the
      custom post in the plugin settings for this to work. It's set to "false"
      by default.)

- [x] [ACF](https://www.advancedcustomfields.com/) The option `useACF: true`
      must be activated in your site's `gatsby-config.js`.

  - You must have the plugin
    [acf-to-rest-api](https://github.com/airesvsg/acf-to-rest-api) installed in
    WordPress.
  - Will pull the `acf: { ... }` fields's contents from any entity which has it
    attached (pages, posts, medias, ... you choose from in WordPress back-end
    while creating a Group of Fields).
  - [ACF Pro](https://www.advancedcustomfields.com/pro/) same as ACF :
  - Will work with
    [Flexible content](https://www.advancedcustomfields.com/resources/flexible-content/)
    and premium stuff like that (repeater, gallery, ...).
  - Will pull the content attached to the
    [options page](https://www.advancedcustomfields.com/add-ons/options-page/).

- [x] [WP-API-MENUS](https://wordpress.org/plugins/wp-api-menus/) which gives
      you the menus and menu locations endpoint.

- [x] [WPML-REST-API](https://github.com/shawnhooper/wpml-rest-api) which adds
      the current locale and available translations to all post types.

## How to use Gatsby with Wordpress.com hosting

Set `hostingWPCOM: true`.

You will need to provide an [API
Key](https://en.support.wordpress.com/api-keys/).

Note : you don't need this for Wordpress.org hosting in which your WordPress
will behave like a self-hosted instance.

## Test your WordPress API

Before you run your first query, ensure the WordPress JSON API is working correctly by visiting /wp-json at your WordPress install. The result should be similar to the [WordPress demo API](https://demo.wp-api.org/wp-json/).

If you see a page on your site, rather than the JSON output, check if your permalink settings are set to “Plain”. After changing this to any of the other settings, the JSON API should be accessible.

## How to query

You can query nodes created from Wordpress using GraphQL like the following:
Note : Learn to use the GraphQL tool and Ctrl+Spacebar at
<http://localhost:3000/___graphiql> to discover the types and properties of your
GraphQL model.

### Query posts

```graphql
{
  allWordpressPost {
    edges {
      node {
        id
        slug
        title
        content
        excerpt
        date
        modified
      }
    }
  }
}
```

### Query pages

```graphql
{
  allWordpressPage {
    edges {
      node {
        id
        title
        content
        excerpt
        date
        modified
        slug
        status
      }
    }
  }
}
```

Same thing for other type of entity (tag, media, categories, ...).

### Query any other entity

In the following example, `${Manufacturer}` will be replaced by the endpoint
prefix and `${Endpoint}` by the name of the endpoint.

To know what's what, check the URL of the endpoint. You can set `verboseOutput: true` in order to get more information of what's executed by the source plugin
behind the scene.

For example the following URL:
`http://my-blog.wordpress.com/wp-json/acf/v2/options`

- Manufacturer : `acf`
- Endpoint : `options`
- Final GraphQL Type : AllWordpressAcfOptions

For example the following URL:
`http://my-blog.wordpress.com/wp-api-menus/v2/menu-locations`

- Manufacturer : `wpapimenus`
- Endpoint : `menulocations`
- Final GraphQL Type : AllWordpressWpApiMenusMenuLocations

```graphql
{
  allWordpress${Manufacturer}${Endpoint} {
    edges {
      node {
        id
       type
        // Put your fields here
      }
    }
  }
}
```

### Query ACF Options

Whether you are using V2 or V3 of ACF to REST, the query below will return `options` as the default ACF Options page data.

If you have specified `acfOptionPageIds` in your site's `gatsby-config.js` (ex: `option_page_1`), then they will be accessible by their ID:

```
{
  allWordpressAcfOptions {
    edges {
      node{
        option_page_1 {
          test_acf
        }
        options {
          test_acf
        }
      }
    }
  }
}
```

### Query posts with the child ACF Fields Node

Mention the apparition of `childWordpressAcfField` in the query below :

```graphql
{
  allWordpressPost {
    edges {
      node {
        id
        slug
        title
        content
        excerpt
        date
        modified
        author
        featured_media
        template
        categories
        tags
        acf {
         // use ___GraphiQL debugger and Ctrl+Spacebar to describe your model.
        }
      }
    }
  }
}
```

### Query pages with the child ACF Fields Node

Mention the apparition of `childWordpressAcfField` in the query below :

```graphql
{
  allWordpressPage {
    edges {
      node {
        id
        title
        content
        excerpt
        date
        modified
        slug
        author
        featured_media
        template
        acf {
         // use ___GraphiQL debugger and Ctrl+Spacebar to describe your model.
        }
      }
    }
  }
}
```

### Query with ACF Flexible Content

ACF Flexible Content returns an array of objects with different types and are
handled differently than other fields.

To access those fields, instead of using their field name, you need to use
`[field_name]_[post_type]` (if you have field named `page_builder` in
your WordPress pages you would need to use `page_builder_page`).

To access data stored in these fields, you need to use GraphQL
[inline fragments](http://graphql.org/learn/queries/#inline-fragments). This
require you to know types of nodes. The easiest way to get the types of nodes is to use
`___GraphiQL` debugger and run the below query (adjust post type and field name):

```graphQL
{
  allWordpressPage {
    edges {
      node {
        title
        acf {
          page_builder_page {
            __typename
          }
        }
      }
    }
  }
}
```

When you have node type names, you can use them to create inline fragments.

Full example:

```graphQL
{
  allWordpressPage {
    edges {
      node {
        title
        acf {
          page_builder_page {
            __typename
            ... on WordPressAcf_hero {
              title
              subtitle
            }
            ... on WordpressAcf_text {
              text
            }
            ... on WordpressAcf_image {
              image {
                localFile {
                  childImageSharp {
                    fluid(maxWidth: 800) {
                      ...GatsbyImageSharpFluid_withWebp
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Query posts with the WPML Fields Node

```graphql
{
  allWordpressPost {
    edges {
      node {
        id
        slug
        title
        content
        excerpt
        date
        modified
        author
        featured_media
        template
        categories
        tags
        wpml_current_locale
        wpml_translations {
          locale
          wordpress_id
          post_title
          href
        }
      }
    }
  }
}
```

### Query pages with the WPML Fields Node

```graphql
{
  allWordpressPage {
    edges {
      node {
        id
        title
        content
        excerpt
        date
        modified
        slug
        author
        featured_media
        template
        wpml_current_locale
        wpml_translations {
          locale
          wordpress_id
          post_title
          href
        }
      }
    }
  }
}
```

## Image processing

To use image processing you need `gatsby-transformer-sharp`, `gatsby-plugin-sharp` and their
dependencies `gatsby-image` and `gatsby-source-filesystem` in your `gatsby-config.js`.

You can apply image processing to:

- featured images (also known as post thumbnails),
- ACF fields:
  - Image field type (return value must be set to `Image Object` or `Image URL` or field name must be `featured_media`),
  - Gallery field type.

Image processing of inline images added in wordpress WYSIWIG editor is
currently not supported.

To access image processing in your queries you need to use this pattern:

```
{
  imageFieldName {
    localFile {
      childImageSharp {
        ...ImageFragment
      }
    }
  }
}
```

Full example:

```graphql
{
  allWordpressPost {
    edges {
      node {
        title
        featured_media {
          localFile {
            childImageSharp {
              fixed(width: 500, height: 300) {
                ...GatsbyImageSharpFixed_withWebp
              }
            }
          }
        }
        acf {
          image {
            localFile {
              childImageSharp {
                fluid(maxWidth: 500) {
                  ...GatsbyImageSharpFluid_withWebp
                }
              }
            }
          }
          gallery {
            localFile {
              childImageSharp {
                resize(width: 180, height: 180) {
                  src
                }
              }
            }
          }
        }
      }
    }
  }
}
```

To learn more about image processing check

- documentation of [gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/),
- source code of [image processing example
  site](https://github.com/gatsbyjs/gatsby/tree/master/examples/image-processing).

## Using a custom normalizer

The plugin uses the concept of normalizers to transform the json data from WordPress into
GraphQL nodes. You can extend the normalizers by passing a custom function to your `gatsby-config.js`.

### Example:

You have a custom post type `movie` and a related custom taxonomy `genre` in your WordPress site. Since
`gatsby-source-wordpress` doesn't know about the relation of the two, we can build an additional normalizer function to map the movie GraphQL nodes to the genre nodes:

```javascript
function mapMoviesToGenres({ entities }) {
  const genres = entities.filter(e => e.__type === `wordpress__wp_genre`)

  return entities.map(e => {
    if (e.__type === `wordpress__wp_movie`) {
      let hasGenres = e.genres && Array.isArray(e.genres) && e.categories.length
      // Replace genres with links to their nodes.
      if (hasGenres) {
        e.genres___NODE = e.genres.map(
          c => genres.find(gObj => c === gObj.wordpress_id).id
        )
        delete e.genres
      }
    }
    return e
  })

  return entities
}
```

In your `gatsby-config.js` you can then pass the function to the plugin options:

```javascript
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-wordpress",
      options: {
        // ...
        normalizer: mapMoviesToGenres,
      },
    },
  ],
}
```

Next to the entities, the object passed to the custom normalizer function also contains other helpful Gatsby functions
and also your `wordpress-source-plugin` options from `gatsby-config.js`. To learn more about the passed object see the [source code](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-wordpress/src/gatsby-node.js).

## Site's `gatsby-node.js` example

```javascript
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const slash = require(`slash`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
// Will create pages for WordPress pages (route : /{slug})
// Will create pages for WordPress posts (route : /post/{slug})
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
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
        const pageTemplate = path.resolve("./src/templates/page.js")
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
        ).then(result => {
          if (result.errors) {
            console.log(result.errors)
            reject(result.errors)
          }
          const postTemplate = path.resolve("./src/templates/post.js")
          // We want to create a detailed page for each
          // post node. We'll just use the WordPress Slug for the slug.
          // The Post ID is prefixed with 'POST_'
          _.each(result.data.allWordpressPost.edges, edge => {
            createPage({
              path: `/${edge.node.slug}/`,
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

## Troubleshooting

### GraphQL Error - Unknown Field on ACF

ACF returns `false` in cases where there is no data to be returned. This can cause conflicting data types in GraphQL and often leads to the error: `GraphQL Error Unknown field {field} on type {type}`.

To solve this, you can use the [acf/format_value filter](https://www.advancedcustomfields.com/resources/acf-format_value/). There are 2 possible ways to use this:

- `acf/format_value` – filter for every field
- `acf/format_value/type={$field_type}` – filter for a specific field based on it’s type

Using the following function, you can check for an empty field and if it's empty return `null`.

```php
if (!function_exists('acf_nullify_empty')) {
    /**
     * Return `null` if an empty value is returned from ACF.
     *
     * @param mixed $value
     * @param mixed $post_id
     * @param array $field
     *
     * @return mixed
     */
    function acf_nullify_empty($value, $post_id, $field) {
        if (empty($value)) {
            return null;
        }
        return $value;
    }
}
```

You can then apply this function to all ACF fields using the following code snippet:

```php
add_filter('acf/format_value', 'acf_nullify_empty', 100, 3);
```

Or if you would prefer to target specific fields, you can use the `acf/format_value/type={$field_type}` filter. Here are some examples:

```php
add_filter('acf/format_value/type=image', 'acf_nullify_empty', 100, 3);
add_filter('acf/format_value/type=gallery', 'acf_nullify_empty', 100, 3);
add_filter('acf/format_value/type=repeater', 'acf_nullify_empty', 100, 3);
```

This code should be added as a plugin (recommended), or within the `functions.php` of a theme.

### GraphQL Error - Unknown field `localFile` on type `[image field]`

WordPress has a [known issue](https://core.trac.wordpress.org/ticket/41445) that can affect how media objects are returned through the REST API.

During the upload process to the WordPress media library, the `post_parent` value ([seen here in the wp_posts table](https://codex.wordpress.org/Database_Description#Table:_wp_posts)) is set to the ID of the post the image is attached to. This value is unable to be changed by any WordPress administration actions.

When the post an image is attached to becomes inaccessible (e.g. from changing visibility settings, or deleting the post), the image itself is restricted in the REST API:
```
   {  
      "code":"rest_forbidden",
      "message":"You don't have permission to do this.",
      "data":{  
         "status":403
      }
   }
```
which prevents Gatsby from retrieving it.

In order to resolve this, you can manually change the `post_parent` value of the image record to `0` in the database. The only side effect of this change is that the image will no longer appear in the "Uploaded to this post" filter in the Add Media dialog in the WordPress administration area.

### Self-signed certificates

When running locally, or in other situations that may involve self-signed certificates, you may run into the error: `The request failed with error code "DEPTH_ZERO_SELF_SIGNED_CERT"`.

To solve this, you can disable Node.js' rejection of unauthorized certificates by adding the following to `gatsby-node.js`:

```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
```
