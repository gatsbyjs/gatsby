# gatsby-source-wordpress

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from
WordPress sites using the
[WordPress REST API](https://developer.wordpress.org/rest-api/reference/).

An example site for this plugin is available.

- [Demo](https://using-wordpress.gatsbyjs.org/)
- [Example site source code](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress)

## Features

- Pulls data from self-hosted WordPress sites, or sites hosted on [WordPress.com](https://wordpress.com)
- Should work with any number of posts (tested on a site with 900 posts)
- Can authenticate to wordpress.com's API using OAuth 2 so media can be queried
- Easily create responsive images in Gatsby from WordPress images. See [image
  processing](#image-processing) section.

## WordPress and custom entities

This module currently pulls the following entities from WordPress:

- [x] All entities are supported (posts, pages, tags, categories, media, types,
      users, statuses, taxonomies, site metadata, ...)
- [x] Any new entity should be pulled as long as the IDs are correct.
- [x] [ACF Entities (Advanced Custom Fields)](https://www.advancedcustomfields.com/)
- [x] Custom Post Types (any type you could have registered and enabled in the REST API)
- [x] Post Meta (any meta fields you could have registered and enabled in the REST API)

We welcome PRs adding support for data from other plugins.

Note : If some fields are missing, check [troubleshooting missing fields](#missing-fields) section.

## Install

`npm install --save gatsby-source-wordpress`

## How to use

First, you need a way to pass environment variables to the build process, so secrets and other secured data aren't committed to source control. We recommend using [`dotenv`][dotenv] which will then expose environment variables. [Read more about dotenv and using environment variables here][envvars]. Then we can _use_ these environment variables and configure our plugin.

```javascript
// In your gatsby-config.js
module.exports = {
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
        // This feature is untested for sites hosted on wordpress.com.
        // Defaults to true.
        useACF: true,
        // Include specific ACF Option Pages that have a set post ID
        // Regardless if an ID is set, the default options route will still be retrieved
        // Must be using V3 of ACF to REST to include these routes
        // Example: `["option_page_1", "option_page_2"]` will include the proper ACF option
        // routes with the ID option_page_1 and option_page_2
        // The IDs provided to this array should correspond to the `post_id` value when defining your
        // options page using the provided `acf_add_options_page` method, in your WordPress setup
        // Dashes in IDs will be converted to underscores for use in GraphQL
        acfOptionPageIds: [],
        auth: {
          // If auth.user and auth.pass are filled, then the source plugin will be allowed
          // to access endpoints that are protected with .htaccess.
          htaccess_user: "your-htaccess-username",
          htaccess_pass: "your-htaccess-password",
          htaccess_sendImmediately: false,

          // If hostingWPCOM is true then you will need to communicate with wordpress.com API
          // in order to do that you need to create an app (of type Web) at https://developer.wordpress.com/apps/
          // then add your clientId, clientSecret, username, and password here
          // Learn about environment variables: https://www.gatsbyjs.org/docs/environment-variables
          // If two-factor authentication is enabled then you need to create an Application-Specific Password,
          // see https://en.support.wordpress.com/security/two-step-authentication/#application-specific-passwords
          wpcom_app_clientSecret: process.env.WORDPRESS_CLIENT_SECRET,
          wpcom_app_clientId: "54793",
          wpcom_user: "gatsbyjswpexample@gmail.com",
          wpcom_pass: process.env.WORDPRESS_PASSWORD,

          // If you use "JWT Authentication for WP REST API" (https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
          // or (https://github.com/jonathan-dejong/simple-jwt-authentication) requires jwt_base_path, path can be found in wordpress wp-api.
          // plugin, you can specify user and password to obtain access token and use authenticated requests against wordpress REST API.
          jwt_user: process.env.JWT_USER,
          jwt_pass: process.env.JWT_PASSWORD,
          jwt_base_path: "/jwt-auth/v1/token", // Default - can skip if you are using https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/
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
        // Set WP REST API routes whitelists
        // and blacklists using glob patterns.
        // Defaults to whitelist the routes shown
        // in the example below.
        // See: https://github.com/isaacs/minimatch
        // Example:  `["/*/*/comments", "/yoast/**"]`
        // ` will either include or exclude routes ending in `comments` and
        // all routes that begin with `yoast` from fetch.
        // Whitelisted routes using glob patterns
        includedRoutes: [
          "**/categories",
          "**/posts",
          "**/pages",
          "**/media",
          "**/tags",
          "**/taxonomies",
          "**/users",
        ],
        // Blacklisted routes using glob patterns
        excludedRoutes: ["**/posts/1456"],
        // use a custom normalizer which is applied after the built-in ones.
        normalizer: function({ entities }) {
          return entities
        },
      },
    },
  ],
}
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
    attached (pages, posts, medias, ... you choose from in WordPress backend
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
      the current locale and available translations to all post types translated with WPML.

- [x] [wp-rest-polylang](https://github.com/maru3l/wp-rest-polylang) which adds
      the current locale and available translations to all post types translated with Polylang.

- [x] [Yoast](https://yoast.com/wordpress/plugins/seo/)
  - You must have the plugin [wp-api-yoast-meta](https://github.com/maru3l/wp-api-yoast-meta) installed in wordpress.
  - Will pull the `yoast_meta: { ... }` field's contents in entity.
  - Work with Yoast premium :
    - Will create Yoast redirects model base on Yoast redirect

## How to use Gatsby with Wordpress.com hosting

Set `hostingWPCOM: true`.

You will need to provide an [API Key](https://en.support.wordpress.com/api-keys/).

Note : you don't need this for Wordpress.org hosting in which your WordPress
will behave like a self-hosted instance.

## Test your WordPress API

Before you run your first query, ensure the WordPress JSON API is working correctly by visiting /wp-json at your WordPress install. The result should be similar to the [WordPress demo API](https://demo.wp-api.org/wp-json/).

If you see a page on your site, rather than the JSON output, check if your permalink settings are set to “Plain”. After changing this to any of the other settings, the JSON API should be accessible.

## Fetching Data: WordPress REST API Route Selection

By default `gatsby-source-wordpress` plugin will fetch data from all endpoints provided by introspection `/wp-json` response. To customize the routes fetched, two configuration options are available: `includeRoutes` for whitelisting and `excludeRoutes` for blacklisting. Both options expect an array of glob patterns. Glob matching is done by [minimatch](https://github.com/isaacs/minimatch). To test your glob patterns, [use this tool](http://pthrasher.github.io/minimatch-test/). You can inspect discovered routes by using `verboseOutput: true` configuration option.

If an endpoint is whitelisted and not blacklisted, it will be fetched. Otherwise, it will be ignored.

### Example:

```javascript
includedRoutes: [
  "**/posts",
  "**/pages",
  "**/media",
  "**/categories",
  "**/tags",
  "**/taxonomies",
  "**/users",
],
```

Which would include most commonly used endpoints:

- Posts
- Pages
- Media
- Categories
- Tags
- Taxonomies
- Users

and would skip pulling Comments.

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

### Query posts with the Polylang Fields Node

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
        polylang_current_lang
        polylang_translations {
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
          polylang_current_lang
        }
      }
    }
  }
}
```

### Query pages with the Polylang Fields Node

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
        polylang_current_lang
        polylang_translations {
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
          polylang_current_lang
        }
      }
    }
  }
}
```

### Query pages with the Yoast Fields Node

```graphql
{
  allWordpressPage {
    edges {
      node {
        yoast_meta {
          yoast_wpseo_title
          yoast_wpseo_metadesc
          yoast_wpseo_canonical
          yoast_wpseo_facebook_title
          yoast_wpseo_facebook_description
          yoast_wpseo_facebook_type
          yoast_wpseo_facebook_image
          yoast_wpseo_twitter_title
          yoast_wpseo_twitter_description
          yoast_wpseo_twitter_image
          yoast_wpseo_social_url
          yoast_wpseo_company_or_person
          yoast_wpseo_person_name
          yoast_wpseo_company_name
          yoast_wpseo_company_logo
          yoast_wpseo_website_name
        }
      }
    }
  }
}
```

### Query Yoast Redirects

**_only work with Yoast Premium_**

```graphql
{
  allWordpressYoastRedirects {
    edges {
      node {
        origin
        url
        type
        format
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
      let hasGenres = e.genres && Array.isArray(e.genres) && e.genres.length
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
const path = require(`path`)
const slash = require(`slash`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
// Will create pages for WordPress pages (route : /{slug})
// Will create pages for WordPress posts (route : /post/{slug})
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // The “graphql” function allows us to run arbitrary
  // queries against the local Gatsby GraphQL schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.
  const result = await graphql(`
    {
      allWordpressPage {
        edges {
          node {
            id
            path
            status
            template
          }
        }
      }
      allWordpressPost {
        edges {
          node {
            id
            path
            status
            template
            format
          }
        }
      }
    }
  `)

  // Check for any errors
  if (result.errors) {
    throw new Error(result.errors)
  }

  // Access query results via object destructuring
  const { allWordpressPage, allWordpressPost } = result.data

  // Create Page pages.
  const pageTemplate = path.resolve(`./src/templates/page.js`)
  // We want to create a detailed page for each page node.
  // The path field contains the relative original WordPress link
  // and we use it for the slug to preserve url structure.
  // The Page ID is prefixed with 'PAGE_'
  allWordpressPage.edges.forEach(edge => {
    // Gatsby uses Redux to manage its internal state.
    // Plugins and sites can use functions like "createPage"
    // to interact with Gatsby.
    createPage({
      // Each page is required to have a `path` as well
      // as a template component. The `context` is
      // optional but is often necessary so the template
      // can query data specific to each page.
      path: edge.node.path,
      component: slash(pageTemplate),
      context: {
        id: edge.node.id,
      },
    })
  })

  const postTemplate = path.resolve(`./src/templates/post.js`)
  // We want to create a detailed page for each post node.
  // The path field stems from the original WordPress link
  // and we use it for the slug to preserve url structure.
  // The Post ID is prefixed with 'POST_'
  allWordpressPost.edges.forEach(edge => {
    createPage({
      path: edge.node.path,
      component: slash(postTemplate),
      context: {
        id: edge.node.id,
      },
    })
  })
}
```

## Troubleshooting

### Missing Fields

If you have custom post types or metadata that are not showing up within the schema, make sure that they are enabled within the REST API.

- **Custom Meta**

  To retrieve custom post meta in your queries, they first must be registered using WordPress' `register_meta()` function with `show_in_rest` set as `true`. You will then see your registered post meta in your Gatsby GraphQL Schema nested within the `meta` field for associated entities. For more details, see https://developer.wordpress.org/reference/functions/register_meta/.

- **Custom Post Types**

  If you are programmatically registering post types with `register_post_type()` and would like to use them in your queries, make sure to have `show_in_rest` set as `true`. Otherwise if you are using a plugin such as CPT UI to register your custom post types, check your configurations to make sure that the post types you want to query are enabled to show in REST API.

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

### ACF Option Pages - Option page data not showing or not updating

This issue occurs when you are trying to pull in data from your ACF Option pages. On certain occasions (initial setup or rebuilding) the data will not appear or won't update to the latest data.

To resolve this issue, make sure that your ids in the `acfOptionPageIds` array, in the plugin config, corresponds to the `post_id` value when defining your Options page with the `acf_add_options_page` method provided by ACF.

### Self-signed certificates

When running locally, or in other situations that may involve self-signed certificates, you may run into the error: `The request failed with error code "DEPTH_ZERO_SELF_SIGNED_CERT"`.

To solve this, you can disable Node.js' rejection of unauthorized certificates by adding the following to `.env.development`:

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Please note that you need to add `dotenv`, as mentioned earlier, to expose environment variables in your gatsby-config.js or gatsby-node.js files.

**CAUTION:** This should never be set in production. Always ensure that you disable `NODE_TLS_REJECT_UNAUTHORIZED` in development with `gatsby develop` only.

[dotenv]: https://github.com/motdotla/dotenv
[envvars]: https://www.gatsbyjs.org/docs/environment-variables
