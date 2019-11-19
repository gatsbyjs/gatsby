<p align="center">
  <a href="https://www.gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  The Gatsby blog core theme
</h1>

A Gatsby theme for creating a blog child theme. It includes all of the data structures you need to get up and running building a blog and includes no additional theming or style opinions.

## Installation

### Use the blog core theme starter

This will generate a new site that pre-configures use of the blog core theme.

```shell
gatsby new my-themed-blog https://github.com/gatsbyjs/gatsby-starter-blog-theme-core
```

### Manually add to your site

```shell
npm install --save gatsby-theme-blog-core
```

## Usage

### Theme options

| Key           | Default value    | Description                                                                                               |
| ------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `basePath`    | `/`              | Root url for all blog posts                                                                               |
| `contentPath` | `content/posts`  | Location of blog posts                                                                                    |
| `assetPath`   | `content/assets` | Location of assets                                                                                        |
| `mdx`         | `true`           | Configure `gatsby-plugin-mdx` (if your website already is using the plugin pass `false` to turn this off) |

#### Example usage

```js
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog-core`,
      options: {
        // basePath defaults to `/`
        basePath: `/blog`,
      },
    },
  ],
}
```

### Additional configuration

In addition to the theme options, there are a handful of items you can customize via the `siteMetadata` object in your site's `gatsby-config.js`

```js
// gatsby-config.js
module.exports = {
  siteMetadata: {
    // Used for the site title and SEO
    title: `My Blog Title`,
    // Used to provide alt text for your avatar
    author: `My Name`,
    // Used for SEO
    description: `My site description...`,
    // Used for social links in the root footer
    social: [
      {
        name: `Twitter`,
        url: `https://twitter.com/gatsbyjs`,
      },
      {
        name: `GitHub`,
        url: `https://github.com/gatsbyjs`,
      },
    ],
  },
}
```
