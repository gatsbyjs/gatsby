<p align="center">
  <a href="https://www.gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  The Gatsby Blog theme
</h1>

A Gatsby theme for creating a blog.

## Installation

### Use the blog theme starter

This will generate a new site that pre-configures use of the blog theme.

```shell
gatsby new my-themed-blog https://github.com/gatsbyjs/gatsby-starter-blog-theme
```

### Manually add to your site

```shell
npm install --save gatsby-theme-blog
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
      resolve: `gatsby-theme-blog`,
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

### Blog Post Fields

The following are the defined blog post fields based on the node interface in the schema

| Field    | Type     |
| -------- | -------- |
| id       | String   |
| title    | String   |
| body     | String   |
| slug     | String   |
| date     | Date     |
| tags     | String[] |
| keywords | String[] |
| excerpt  | String   |
