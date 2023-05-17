# gatsby-source-drupal

Source plugin for pulling data (including images) into Gatsby from Drupal sites.

It pulls data from Drupal 8/9 sites with the
[Drupal JSONAPI module](https://www.drupal.org/project/jsonapi) installed.

An example site built with the headless Drupal distro
[ContentaCMS](https://twitter.com/contentacms) is at
https://using-drupal.gatsbyjs.org/

The `apiBase` option allows changing the API entry point depending on the version of
jsonapi used by your Drupal instance. The default value is `jsonapi`, which has
been used since jsonapi version `8.x-1.0-alpha4`.

## Install

`npm install gatsby-source-drupal`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`, // optional, defaults to `jsonapi`
      },
    },
  ],
}
```

On the Drupal side, we highly recommend installing [JSON:API
Extras](https://www.drupal.org/project/jsonapi_extras) and enabling "Include
count in collection queries" `/admin/config/services/jsonapi/extras` as that
[speeds up fetching data from Drupal by around
4x](https://github.com/gatsbyjs/gatsby/pull/32883).

### Gatsby Image CDN

Gatsby has an Image CDN feature which speeds up your build times as well as your frontend performance.

Previously Gatsby would fetch all image files during the Gatsby build process, transform them for frontend performance, and then serve them as static files on the frontend.
With Image CDN images are lazily processed when users visit the frontend of your site. The first front-end visitor of any image will transform that image and cache it for all other users. Image CDN works on all hosting platforms like Gatsby Cloud or Netlify.

- [Image CDN blog post](https://www.gatsbyjs.com/blog/image-cdn-lightning-fast-image-processing-for-gatsby-cloud/)
- [What is Image CDN?](https://support.gatsbyjs.com/hc/en-us/articles/4426379634835-What-is-Image-CDN-)
- [How to enable Image CDN on Gatsby Cloud](https://support.gatsbyjs.com/hc/en-us/articles/4426393233171-How-to-Enable-Image-CDN)

#### Querying for Gatsby Image CDN fields

Follow [this guide](https://support.gatsbyjs.com/hc/en-us/articles/4426393233171-How-to-Enable-Image-CDN) to understand how to use the new `gatsbyImage` GraphQL field.

#### Turning off file downloads

When you're using Gatsby Image CDN you no longer need Gatsby to fetch all of the files in your Drupal instance. Turn that off with the following plugin option. This is required for Image CDN to work.

```js
  {
    resolve: `gatsby-source-drupal`,
    options: {
      skipFileDownloads: true,
      // other plugin options go here
    },
  },
```

Note that this option will cause this plugin to fetch extra image metadata for Image CDN. If you need to use the `skipFileDownloads` option but don't want to use Image CDN and fetch extra metadata, you can disable it by explicitly turning Image CDN off:

```js
  {
    resolve: `gatsby-source-drupal`,
    options: {
      imageCDN: false,
      // other plugin options go here
    },
  },
```

#### Local dev improvements

Using Image CDN also speeds up your local development startup times when running `gatsby develop`. Instead of fetching all files locally, `gatsby develop` has a local Image CDN emulator.
This means Gatsby will only fetch and process the minimal amount of images required to render any page when you visit your Gatsby site at `http://localhost:8000`.

#### Configuring placeholders for Gatsby Images

By default full size images are fetched and scaled down to be used for low quality image placeholders (for lazy loading images on the frontend).
This can make your builds slower than necessary so follow these steps to configure a new smaller placeholder image size in Drupal. This will speed up your builds when using Gatsby Image CDN.

1. Install the [Consumer image styles module](https://www.drupal.org/project/consumer_image_styles)
2. Navigate to "Extend->Web Services" and turn on "Consumer Image Styles" by checking the box and hitting save.
3. Navigate to "Configuration->Image Styles". and add an image style called "Placeholder".
4. Create a new scale effect and set its width and height to 20.
5. If you already have a placeholder style you want to use, you can set the `gatsby-source-drupal` plugin option `placeholderStyleName` as the machine name of your style. \*\* See example option below
6. For each entity that has an image field, navigate into "Configuration->Web Services->JSON:API->JSON:API Resource Overrides->Entity Type->(overwrite/edit)".
7. Click on "advanced" for each image field you have, select "Image Styles (Image Field)" in the dropdown, then select the placeholder image style and save.
8. Go to "Configuration->Web Services->Consumers" and add a default consumer if it doesn't already exist.
9. Edit your default consumer and add the "Placeholder" image style by checking the box in the bottom section and saving.
10. You may need to clear Drupal's cache under "Config->development->clear all caches".

\*\* Example placeholder style plugin option

```js
{
  resolve: `gatsby-source-drupal`,
  options: {
    placeholderStyleName: `custom_placeholder` // default is `placeholder`
  }
}
```

### Filters

You can use the `filters` option to limit the data that is retrieved from Drupal. Filters are applied per JSON API collection. You can use any [valid JSON API filter query](https://www.drupal.org/docs/8/modules/jsonapi/filtering). For large data sets this can reduce the build time of your application by allowing Gatsby to skip content you'll never use.

As an example, if your JSON API endpoint (https://live-contentacms.pantheonsite.io/api) returns the following collections list, then `articles` and `recipes` are both collections that can have a filters applied:

```json
{
  ...
  links: {
    articles: "https://live-contentacms.pantheonsite.io/api/articles",
    recipes: "https://live-contentacms.pantheonsite.io/api/recipes",
    ...
  }
}
```

To retrieve only recipes with a specific tag you could do something like the following where the key (recipe) is the collection from above, and the value is the filter you want to apply.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`,
        filters: {
          // collection : filter
          recipe: "filter[tags.name][value]=British",
        },
      },
    },
  ],
}
```

Which would result in Gatsby using the filtered collection https://live-contentacms.pantheonsite.io/api/recipes?filter[tags.name][value]=British to retrieve data.

### Basic Auth

You can use `basicAuth` option if your site is protected by basicauth.
First, you need a way to pass environment variables to the build process, so secrets and other secured data aren't committed to source control. We recommend using [`dotenv`][dotenv] which will then expose environment variables. [Read more about dotenv and using environment variables here][envvars]. Then we can _use_ these environment variables and configure our plugin.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`, // optional, defaults to `jsonapi`
        basicAuth: {
          username: process.env.BASIC_AUTH_USERNAME,
          password: process.env.BASIC_AUTH_PASSWORD,
        },
      },
    },
  ],
}
```

### Fastbuilds

You can use the `fastBuilds` option to enable fastbuilds. This requires the
Gatsby Drupal module (called gatsby_fastbuilds) to be enabled. This will speed
up your development and build process by only downloading content that has
changed since you last ran `gatsby build` or `gatsby develop`.

This will require authentication to your Drupal site and a Drupal user with the
Drupal permission to `sync gatsby fastbuild log entities`.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`, // optional, defaults to `jsonapi`
        basicAuth: {
          username: process.env.BASIC_AUTH_USERNAME,
          password: process.env.BASIC_AUTH_PASSWORD,
        },
        fastBuilds: true,
      },
    },
  ],
}
```

## Request Headers

You can add optional request headers to the request using `headers` param.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`, // optional, defaults to `jsonapi`
        headers: {
          Host: "https://example.com", // any valid request header here
        },
      },
    },
  ],
}
```

One case where custom headers can be useful is if your webserver returns a `406 Not Acceptable` response.
This happens when it requires narrow conformance with the JSON:API MIME type (e.g. Apache2 with security
module enabled).

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        // ...
        headers: {
          accept: "application/vnd.api+json",
        },
      },
    },
  ],
}
```

## CDN

You can add an optional CDN or API gateway URL `proxyUrl` param. The URL can be a simple proxy of the Drupal
`baseUrl`, or another URL (even containing a path) where the Drupal JSON API resources can be retrieved.

This option is required as Drupal doesn't know about the CDN so it returns URLs pointing to the `baseUrl`. With `proxyUrl` set, the plugin will rewrite URLs returned from Drupal to keep pointing at the `proxyUrl`

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        proxyUrl: `https://xyz.cloudfront.net/`, // optional, defaults to the value of baseUrl
        apiBase: `api`, // optional, defaults to `jsonapi`
      },
    },
  ],
}
```

## GET Search Params

You can append optional GET request params to the request url using `params` option.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`, // optional, defaults to `jsonapi`
        params: {
          "api-key": "your-api-key-header-here", // any valid key value pair here
        },
      },
    },
  ],
}
```

### File Downloads

You can use the `skipFileDownloads` option if you do not want Gatsby to download
files from your Drupal website. This is useful if you are using another option
for processing/serving images.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`, // optional, defaults to `jsonapi`
        skipFileDownloads: true,
      },
    },
  ],
}
```

You can also filter out temporary files. This will help to avoid Gatsby throwing an error when a 404 is returned from a file that does not exist:

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`,
        filters: {
          // collection : filter
          "file--file": "filter[status][value]=1",
        },
      },
    },
  ],
}
```

## Concurrent File Requests

You can use the `concurrentFileRequests` option to change how many simultaneous file requests are made to the server/service. This benefits build speed, however too many concurrent file request could cause memory exhaustion depending on the server's memory size so change with caution.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`, // optional, defaults to `jsonapi`
        concurrentFileRequests: 60, // optional, defaults to `20`
      },
    },
  ],
}
```

## Concurrent API Requests

You can use the `concurrentAPIRequests` option to change how many simultaneous API requests are made to the server/service. 20 is the default and seems to be the fastest for most sites.

## API Request Timeout

You can use the `requestTimeoutMS` option to set the request timeout for API requests. API requests sometimes stall and we want to retry these instead of endlessly waiting.

The default is 30000ms. Very large sites might need to increase this.

## Disallowed Link Types

You can use the `disallowedLinkTypes` option to skip link types found in JSON:API documents. By default it skips the `self`, `describedby`, `contact_message--feedback`, and `contact_message--pesonal` links, which do not provide data that can be sourced. You may override the setting to add additional link types to be skipped.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        // skip the action--action resource type.
        disallowedLinkTypes: [
          `self`,
          `describedby`,
          `contact_message--feedback`,
          `contact_message--personal`,
        ],
      },
    },
  ],
}
```

_NOTES_:

When using [includes](https://www.drupal.org/docs/8/modules/jsonapi/includes) in your JSON:API calls the included data will automatically become available to query, even if the link types are skipped using `disallowedLinkTypes`.

This enables you to fetch only the data you need at build time, instead of all data of a certain entity type or bundle.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        // Skip the node--page resource type and paragraph components.
        disallowedLinkTypes: [
          `self`,
          `describedby`,
          `node--page`,
          `paragraph--text`,
          `paragraph--image`,
        ],
        filters: {
          // Use includes so only the news content paragraph components are fetched.
          "node--news": "include=field_content",
        },
      },
    },
  ],
}
```

## Entity Reference revisions and relationships

By default `gatsby-source-drupal` resolves Entity Reference relationships using just ID. If you are
using the contrib module [Entity reference revisions](https://drupal.org/project/entity_reference_revisions) and [Paragraphs](https://drupal.org/project/paragraphs),
you may have advanced use-cases such as fetching drafts where you want to resolve these relationships using both ID and
revision ID. You can nominate entity-type IDs where you wish to resolve relationships using the revision ID by adding
them to the `entityReferenceRevisions` configuration option. Please note that `gatsby-source-drupal` only ever fetches
the default (published) revision, so this functionality is only needed in advanced cases where you have custom code
Drupal side that is applying additional logic.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`,
        entityReferenceRevisions: ["paragraph"], // optional, defaults to `[]`
      },
    },
  ],
}
```

## Translations

If you have translations or multilingual enabled on your Drupal site, you can opt-in to sourcing translations of entities. To do this, enable in your plugin's configuration the languages and entity types you'd like to source. E.g.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        languageConfig: {
          defaultLanguage: `en`,
          enabledLanguages: [
            `en`,
            `fil`,
            // add an object here if you've renamed a langcode in Drupal
            {
              langCode: `en-gb`,
              as: `uk`,
            },
          ],
          filterByLanguages: false
          // add a boolean `true` here if you'd like to filter the Drupal API response by the current language
          translatableEntities: [`node--article`],
          nonTranslatableEntities: [`file--file`],
        },
      },
    },
  ],
}
```

Some entities are not translatable like Drupal files and will return null result when language code from parent entity doesn't match up. These items can be specified as nonTranslatableEntities and receive the defaultLanguage as fallback.

## Type prefix

By default, types are created with names that match the types in Drupal. However you can use the `typePrefix` option to add a prefix to all types. This is useful if you have multiple Drupal sources and want to differentiate between them, or if you have Drupal types that conflict with other types in your site.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        typePrefix: `Drupal`,
      },
    },
  ],
}
```

You would then query for `allDrupalArticle` instead of `allArticle`.

```graphql
{
  allDrupalArticle {
    nodes {
      title
    }
  }
}
```

## Gatsby Preview (experimental)

You will need to have the Drupal module installed, more information on that here: https://www.drupal.org/project/gatsby

In your Drupal module configuration, set the update URL to your Gatsby Preview instance URL.

_NOTES_:

- This is experimental feature in active development. APIs used for this feature are not yet stable - it can break while we iterate on API design (particularly when versions of `gatsby-source-drupal` and `Gatsby Live Preview` Drupal module are incompatible).

### Preview Secret

While you don't need to pass any additional options for preview to work, you can pass a `secret` for added security between your Drupal instance and Gatsby preview. Ensure this secret matches the one set in your Drupal Gatsby Preview settings.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        secret: process.env.PREVIEW_SECRET, // optional, must match Drupal instance preview secret
      },
    },
  ],
}
```

## How to query

You can query nodes created from Drupal like the following:

```graphql
{
  allArticle {
    edges {
      node {
        title
        internalId
        created(formatString: "DD-MMM-YYYY")
      }
    }
  }
}
```

[dotenv]: https://github.com/motdotla/dotenv
[envvars]: https://www.gatsbyjs.com/docs/environment-variables
