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

### For a new site

If you're creating a new site and want to use the blog theme, you can use the blog theme starter. This will generate a new site that pre-configures use of the blog theme.

```shell
gatsby new my-themed-blog https://github.com/gatsbyjs/gatsby-starter-blog-theme
```

### For an existing site

If you already have a site you'd like to add the blog theme to, you can manually configure it.

1. Install the blog theme

```shell
npm install gatsby-theme-blog
```

2. Add the configuration to your `gatsby-config.js` file

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

3. Add blog posts to your site by creating `md` or `mdx` files inside `/content/posts`.

   > Note that if you've changed the default `contentPath` in the configuration, you'll want to add your markdown files in the directory specified by that path.

4. Add an image with the file name `avatar` (can be jpg or png) inside the `/assets` directory to include a small image next to the footer on every post page.

> Note that if you've changed the default `assetPath` in the configuration, you'll want to add your asset files in the directory specified by that path.

5. Run your site using `gatsby develop` and navigate to your blog posts. If you used the above configuration, your URL will be `http://localhost:8000/blog`

## Usage

### Theme options

| Key                      | Default value    | Description                                                                                                                                                        |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `basePath`               | `/`              | Root url for all blog posts                                                                                                                                        |
| `contentPath`            | `content/posts`  | Location of blog posts                                                                                                                                             |
| `assetPath`              | `content/assets` | Location of assets                                                                                                                                                 |
| `mdxOtherwiseConfigured` | `false`          | Set this flag `true` if `gatsby-plugin-mdx` is already configured for your site.                                                                                   |
| `disableThemeUiStyling`  | `false`          | Set this flag `true` if you want to use the blog theme without `gatsby-plugin-theme-ui` styles. Note that styles within the components you can shadow still exist. |
| `excerptLength`          | `140`            | Length of the auto-generated excerpt of a blog post                                                                                                                |
| `webfontURL`             | `''`             | URL for the webfont you'd like to include. Be sure that your local theme does not override it.                                                                     |

#### Example configuration

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
    siteUrl: `https://example.com`,
    // Used for resolving images in social cards
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

| Field       | Type     |
| ----------- | -------- |
| id          | String   |
| title       | String   |
| body        | String   |
| slug        | String   |
| date        | Date     |
| tags        | String[] |
| keywords    | String[] |
| excerpt     | String   |
| image       | String   |
| imageAlt    | String   |
| socialImage | String   |

### Image Behavior

Blog posts can include references to images inside frontmatter. Note that this works for a relative path as shown below, or an external URL.

```md
---
title: Hello World (example)
date: 2019-04-15
image: ./some-image.jpg
---
```

`image` refers to the featured image at the top of a post and is not required. It will also appear as the preview image inside a social card. Note that this requires you to set `siteURL` in your `gatsby-config.js` file metadata to your site's domain.

When adding an `image`, `imageAlt` is available to provide alt text for the featured image within the post. If this is not included, it defaults to the post excerpt.

You may want to use a different image for your social card than the one that appears in your blog post. You can do so by setting `socialImage` in frontmatter.
