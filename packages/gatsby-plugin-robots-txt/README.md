# gatsby-plugin-robots-txt

Create `robots.txt` for your Gatsby site.

## Install

`npm install --save gatsby-plugin-robots-txt`

## How to Use

`gatsby-config.js`

```js
module.exports = {
  siteMetadata: {
    siteUrl: 'https://www.example.com'
  },
  plugins: ['gatsby-plugin-robots-txt']
};
```

## Options

This plugin uses [`generate-robotstxt`](https://github.com/itgalaxy/generate-robotstxt#usage) to generate content of `robots.txt` and it has the following options:

|   Name    |    Type    |                Default                |      Description       |
| :-------: | :--------: | :-----------------------------------: | :--------------------: |
|  `host`   |  `String`  |       `${siteMetadata.siteUrl}`       |   Host of your site    |
| `sitemap` |  `String`  | `${siteMetadata.siteUrl}/sitemap.xml` | Path to `sitemap.xml`  |
| `policy`  | `Policy[]` |                 `[]`                  | List of [`Policy`](https://github.com/itgalaxy/generate-robotstxt#usage) rules |
| `configFile` |  `String`  |              `undefined`              |                          Path to external config file                          |

`gatsby-config.js`

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://www.example.com',
        sitemap: 'https://www.example.com/sitemap.xml',
        policy: [{ userAgent: '*', allow: '/' }]
      }
    }
  ]
};
```

### `env`-option

You can use the `env` option to set specific options in specific environment:

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://www.example.com',
        sitemap: 'https://www.example.com/sitemap.xml',
        env: {
          development: {
            policy: [{ userAgent: '*', disallow: ['/'] }]
          },
          production: {
            policy: [{ userAgent: '*', allow: '/' }]
          }
        }
      }
    }
  ]
};
```

The `env` key will be taken from `process.env.NODE_ENV`, when this is not available then it defaults to `development`.

You can resolve the `env` key by using `resolveEnv` function:

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://www.example.com',
        sitemap: 'https://www.example.com/sitemap.xml',
        resolveEnv: () => process.env.GATSBY_ENV,
        env: {
          development: {
            policy: [{ userAgent: '*', disallow: ['/'] }]
          },
          production: {
            policy: [{ userAgent: '*', allow: '/' }]
          }
        }
      }
    }
  ]
};
```

### `configFile`-option

You can use the `configFile` option to set specific external configuration:

`gatsby-config.js`

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://www.example.com',
        sitemap: 'https://www.example.com/sitemap.xml',
        configFile: 'robots-txt.config.js'
      }
    }
  ]
};
```

`robots-txt.config.js`

```js
module.exports = {
  policy: [{ userAgent: '*' }]
};
```

#### Netlify

If you would like to disable crawlers for [deploy-previews](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/) you can use the following snippet:

`gatsby-config.js`

```js
const {
  NODE_ENV,
  URL: NETLIFY_SITE_URL = 'https://www.example.com',
  DEPLOY_PRIME_URL: NETLIFY_DEPLOY_URL = NETLIFY_SITE_URL,
  CONTEXT: NETLIFY_ENV = NODE_ENV
} = process.env;
const isNetlifyProduction = NETLIFY_ENV === 'production';
const siteUrl = isNetlifyProduction ? NETLIFY_SITE_URL : NETLIFY_DEPLOY_URL;

module.exports = {
  siteMetadata: {
    siteUrl
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        resolveEnv: () => NETLIFY_ENV,
        env: {
          production: {
            policy: [{ userAgent: '*' }]
          },
          'branch-deploy': {
            policy: [{ userAgent: '*', disallow: ['/'] }],
            sitemap: null,
            host: null
          },
          'deploy-preview': {
            policy: [{ userAgent: '*', disallow: ['/'] }],
            sitemap: null,
            host: null
          }
        }
      }
    }
  ]
};
```
