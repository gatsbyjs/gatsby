# gatsby-source-drupal

Source plugin for pulling data (including images) into Gatsby from Drupal sites.

Pulls data from Drupal 8 sites with the
[Drupal JSONAPI module](https://www.drupal.org/project/jsonapi) installed.

An example site built with the headless Drupal distro
[ContentaCMS](https://twitter.com/contentacms) is at
https://using-drupal.gatsbyjs.org/

`apiBase` Option allows changing the API entry point depending on the version of
jsonapi used by your Drupal instance. The default value is `jsonapi`, which has
been used since jsonapi version `8.x-1.0-alpha4`.

## Install

`npm install --save gatsby-source-drupal`

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

## GET Params

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

## Concurrent File Requests

You can use the `concurrentFileRequests` option to change how many simultaneous file requests are made to the server/service. This benefits build speed, however to many concurrent file request could cause memory exhaustion depending on the server's memory size so change with caution.

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

## Gatsby Preview (experimental)

You will need to have the Drupal module installed, more information on that here: https://www.drupal.org/project/gatsby

In your Drupal module configuration, set the update URL to your Gatsby Preview instance URL.

_NOTES_:

- This is experimental feature in active development. APIs used for this feature are not yet stable - it can break while we iterate on API design (particularly when versions of `gatsby-source-drupal` and `Gatsby Live Preview` drupal module are incompatible).
- It's not feature complete yet. There is no handling of deleting content yet.

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
[envvars]: https://www.gatsbyjs.org/docs/environment-variables
