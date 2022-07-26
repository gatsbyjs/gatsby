---
title: MDX Plugins
---

## Gatsby remark plugins

`gatsby-plugin-mdx` is compatible with all of the [gatsby-remark
plugins](/plugins/gatsby-remark-images/?=gatsby-remark),
including
[`gatsby-remark-images`](/plugins/gatsby-remark-images/?=gatsby-remark).

To enable `gatsby-remark-images`, you first need to install the relevant
image plugins:

```shell
yarn add gatsby-plugin-sharp gatsby-remark-images
```

If you don't have `gatsby-source-filesystem` installed, also install that.

Then configure the plugins. `gatsby-source-filesystem` needs to be
pointed at wherever you have your images on disk, `gatsby-remark-images`
needs to be both a sub-plugin of `gatsby-plugin-mdx`and a string entry in
the plugins array, and `gatsby-plugin-sharp` can be included on its own.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    `gatsby-remark-images`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1035,
              sizeByPixelDensity: true,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}
```

Then, any image in your MDX file will be automatically handled
by Gatsby image processing.

```markdown
![my image](./my-awesome-image.png)
```

By default, the text `my image` will be used as the alt attribute of the
generated `img` tag. If an empty alt attribute like `alt=""` is wished,
a reserved keyword `GATSBY_EMPTY_ALT` can be used.

```markdown
![GATSBY_EMPTY_ALT](./my-awesome-image.png)
```

## Remark plugins

You can use [remark plugins](https://github.com/remarkjs/remark/blob/master/doc/plugins.md)
directly if there are transformations you'd like to make on your
MDX documents. This can do anything from adding emoji support to
enforcing a particular title capitalization format.

```javascript:title=gatsby-config.js
const capitalize = require(`remark-capitalize`)
const emoji = require(`remark-emoji`)

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        remarkPlugins: [capitalize, emoji],
      },
    },
  ],
}
```
