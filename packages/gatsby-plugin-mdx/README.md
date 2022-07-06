# gatsby-plugin-mdx

`gatsby-plugin-mdx` is the official integration for using [MDX](https://mdxjs.com) with [Gatsby](https://www.gatsbyjs.com).

MDX is markdown for the component era. It lets you write JSX embedded inside markdown. It’s a great combination because it allows you to use markdown’s often terse syntax (such as `# heading`) for the little things and JSX for more advanced components.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Configuration](#configuration)
    - [Extensions](#extensions)
    - [Gatsby remark plugins](#gatsby-remark-plugins)
    - [mdxOptions](#mdxoptions)
  - [Imports](#imports)
  - [Layouts](#layouts)
  - [Programmatically create MDX pages](#programmatically-create-mdx-pages)
  - [GraphQL MDX Node structure](#graphql-mdx-node-structure)
  - [Extending the GraphQL Mdx nodes](#extending-the-graphql-mdx-nodes)
  - [Components](#components)
    - [MDXProvider](#mdxprovider)
    - [Shortcodes](#shortcodes)
- [Migrating from v3 to v4](#migrating-from-v3-to-v4)
- [Why MDX?](#why-mdx)
- [Related](#related)

## Installation

```shell
npm install gatsby-plugin-mdx @mdx-js/react gatsby-source-filesystem
```

## Usage

After installing `gatsby-plugin-mdx` you can add it to your plugins list in your
`gatsby-config.js`. You'll also want to configure `gatsby-source-filesytem` to point at your `src/pages` directory (even if you don't want to create MDX pages from `src/pages`).

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-mdx`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}
```

By default, this configuration will allow you to automatically create pages with `.mdx` files in `src/pages` and will process any Gatsby nodes with Markdown media types into MDX content.

Note that `gatsby-plugin-mdx` requires `gatsby-source-filesystem` to be present and configured to process local markdown files in order to generate the resulting Gatsby nodes.

To automatically create pages with `.mdx` from other sources, you also need to configure `gatsby-plugin-page-creator`.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-mdx`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/src/posts`,
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/posts`,
      },
    },
  ],
}
```

Also check out the guide [Adding MDX Pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx/) for more details.

### Configuration

`gatsby-plugin-mdx` exposes a configuration API that can be used similarly to any other Gatsby plugin. You can define MDX extensions, layouts, global scope, and more.

| Key                                             | Default    | Description                                                         |
| ----------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| [`extensions`](#extensions)                     | `[".mdx"]` | Configure the file extensions that `gatsby-plugin-mdx` will process |
| [`gatsbyRemarkPlugins`](#gatsby-remark-plugins) | `[]`       | Use Gatsby-specific remark plugins                                  |
| [`mdxOptions`](#mdxOptions)                     | `[]`       | Options directly passed to `compile()` of `@mdx-js/mdx`             |

#### Extensions

By default, only files with the `.mdx` file extension are treated as MDX when
using `gatsby-source-filesystem`. To use `.md` or other file extensions, you can
define an array of file extensions in the `gatsby-plugin-mdx` section of your
`gatsby-config.js`.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
      },
    },
  ],
}
```

#### `gatsby-remark-*` plugins

This config option is used for compatibility with a set of plugins many people [use with remark](https://www.gatsbyjs.com/plugins/?=gatsby-remark-) that require the gatsby environment to function properly. In some cases, like [gatsby-remark-prismjs](https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs/), it makes more sense to use a library like [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) to render codeblocks using a [React component](/api-reference/mdx-provider). In other cases, like [gatsby-remark-images](https://www.gatsbyjs.com/plugins/gatsby-remark-images/), the interaction with the Gatsby APIs is well deserved because the images can be optimized by Gatsby and you should continue using it.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
        ],
      },
    },
  ],
}
```

Using a string reference is also supported for `gatsbyRemarkPlugins`.

```js
gatsbyRemarkPlugins: [`gatsby-remark-images`]
```

#### mdxOptions

These configuration options are directly passed into the MDX compiler.

See all available options in [the official documentation of `@mdx-js/mdx`](https://mdxjs.com/packages/mdx/#compilefile-options).

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        mdxOptions: {
          remarkPlugins: [
            require("remark-abbr"),
            // To pass options, use a 2-element array with the
            // configuration in an object in the second element
            [require("remark-external-links"), { target: false }],
          ],
          rehypePlugins: [
            // Generate heading ids for rehype-autolink-headings
            require("rehype-slug"),
            // To pass options, use a 2-element array with the
            // configuration in an object in the second element
            [require("rehype-autolink-headings"), { behavior: "wrap" }],
          ],
        },
      },
    },
  ],
}
```

### Imports

When importing a React component into your MDX, you can import it using the `import` statement like in JavaScript.

```mdx
import { SketchPicker } from "react-color"

# Hello, world!

Here's a color picker!

<SketchPicker />
```

**Note:** You should restart `gatsby develop` to update imports in MDX files. Otherwise, you'll get a `ReferenceError` for new imports. You can use the [shortcodes](#shortcodes) approach if that is an issue for you.

### Layouts

You can use regular [layout components](https://www.gatsbyjs.com/docs/how-to/routing/layout-components/) to apply layout to your sub pages.

To inject them, you have several options:

1. Use the [`wrapPageElement` API](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#wrapPageElement) including its [SSR counterpart](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/#wrapPageElement).
1. Add an `export default Layout` statement to your MDX file, see [MDX documentation on Layout](https://mdxjs.com/docs/using-mdx/#layout).
1. When using the [`createPage` action](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createPage) to programatically create pages, you should use the following URI pattern for your page component: `your-layout-component.js?__contentFilePath=absolute-path-to-your-mdx-file.mdx`. To learn more about this, head to the [programmatically creating pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx#programmatically-creating-pages) guide.

### Programmatically create MDX pages

Read the MDX documentation on [programmatically creating pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx#programmatically-creating-pages) to learn more.

### GraphQL MDX Node structure

In your GraphQL schema, you will discover several additional data related to your MDX content. While your local [GraphiQL](http://localhost:8000/___graphql) will give you the most recent data, here are the most relevant properties of the `Mdx` entities:

| Property        | Description                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| body            | Your MDX file content without frontmatter                                                                                                                                   |
| rawBody         | Your untouched MDX file content                                                                                                                                             |
| title           | Either your title from frontmatter or the file name in sentence case                                                                                                        |
| slug            | Either your slug from frontmatter or the relative file path + file name. (While `index` in the file name will be replaced with ``)                                          |
| frontmatter     | Sub-entity with all frontmatter data. Regular Gatsby transformations apply, like you can format dates directly within the query.                                            |
| excerpt         | A pruned variant of your content. By default trimmed to 140 characters. Based on [rehype-infer-description-meta](https://github.com/rehypejs/rehype-infer-description-meta) |
| tableOfContents | Generates a recursive object structure to reflect a table of contents. Based on [mdast-util-toc](https://github.com/syntax-tree/mdast-util-toc)                             |

### Extending the GraphQL Mdx nodes

TODO: Explain how to reimplement the timeToRead from v3 of the plugin.

### Components

MDX and `gatsby-plugin-mdx` use components for different things like rendering and component mappings.

#### MDXProvider

`MDXProvider` is a React component that allows you to replace the
rendering of tags in MDX content. It does this by providing a list of
components via context to the internal `MDXTag` component that handles
rendering of base tags like `p` and `h1`. There are two special tags
that can be replaced too: `inlineCode` and `wrapper`. `inlineCode` is
for inline `<code>` and `wrapper` is the special element that wraps
all of the MDX content.

```jsx
import { MDXProvider } from "@mdx-js/react"

const MyH1 = props => <h1 style={{ color: "tomato" }} {...props} />
const MyParagraph = props => (
  <p style={{ fontSize: "18px", lineHeight: 1.6 }} {...props} />
)

const components = {
  h1: MyH1,
  p: MyParagraph,
}

export const wrapRootElement = ({ element }) => (
  <MDXProvider components={components}>{element}</MDXProvider>
)
```

The following components can be customized with the `MDXProvider`:

<!-- prettier-ignore-start -->

| Tag             | Name                                                                 | Syntax                                              |
| --------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `p`             | [Paragraph](https://github.com/syntax-tree/mdast#paragraph)          |                                                     |
| `h1`            | [Heading 1](https://github.com/syntax-tree/mdast#heading)            | `#`                                                 |
| `h2`            | [Heading 2](https://github.com/syntax-tree/mdast#heading)            | `##`                                                |
| `h3`            | [Heading 3](https://github.com/syntax-tree/mdast#heading)            | `###`                                               |
| `h4`            | [Heading 4](https://github.com/syntax-tree/mdast#heading)            | `####`                                              |
| `h5`            | [Heading 5](https://github.com/syntax-tree/mdast#heading)            | `#####`                                             |
| `h6`            | [Heading 6](https://github.com/syntax-tree/mdast#heading)            | `######`                                            |
| `thematicBreak` | [Thematic break](https://github.com/syntax-tree/mdast#thematicbreak) | `***`                                               |
| `blockquote`    | [Blockquote](https://github.com/syntax-tree/mdast#blockquote)        | `>`                                                 |
| `ul`            | [List](https://github.com/syntax-tree/mdast#list)                    | `-`                                                 |
| `ol`            | [Ordered list](https://github.com/syntax-tree/mdast#list)            | `1.`                                                |
| `li`            | [List item](https://github.com/syntax-tree/mdast#listitem)           |                                                     |
| `table`         | [Table](https://github.com/syntax-tree/mdast#table)                  | `--- | --- | ---`                                   |
| `tr`            | [Table row](https://github.com/syntax-tree/mdast#tablerow)           | `This | is | a | table row`                         |
| `td`/`th`       | [Table cell](https://github.com/syntax-tree/mdast#tablecell)         |                                                     |
| `pre`           | [Pre](https://github.com/syntax-tree/mdast#code)                     |                                                     |
| `code`          | [Code](https://github.com/syntax-tree/mdast#code)                    |                                                     |
| `em`            | [Emphasis](https://github.com/syntax-tree/mdast#emphasis)            | `_emphasis_`                                        |
| `strong`        | [Strong](https://github.com/syntax-tree/mdast#strong)                | `**strong**`                                        |
| `delete`        | [Delete](https://github.com/syntax-tree/mdast#delete)                | `~~strikethrough~~`                                 |
| `inlineCode`    | [InlineCode](https://github.com/syntax-tree/mdast#inlinecode)        |                                                     |
| `hr`            | [Break](https://github.com/syntax-tree/mdast#break)                  | `---`                                               |
| `a`             | [Link](https://github.com/syntax-tree/mdast#link)                    | `<https://mdxjs.com>` or `[MDX](https://mdxjs.com)` |
| `img`           | [Image](https://github.com/syntax-tree/mdast#image)                  | `![alt](https://mdx-logo.now.sh)`                   |
<!-- prettier-ignore-end -->

It's important to define the `components` you pass in a stable way
so that the references don't change if you want to be able to navigate
to a hash. That's why we defined `components` outside of any render
functions in these examples.

#### Shortcodes

If you want to allow usage of a component from anywhere (often referred to as a
shortcode), you can pass it to the
[MDXProvider](https://www.gatsbyjs.com/docs/mdx/customizing-components/).

```js
// src/components/layout.js
import React from "react"
import { MDXProvider } from "@mdx-js/react"
import { Link } from "gatsby"
import { YouTube, Twitter, TomatoBox } from "./ui"

const shortcodes = { Link, YouTube, Twitter, TomatoBox }

export default ({ children }) => (
  <MDXProvider components={shortcodes}>{children}</MDXProvider>
)
```

Then, in any MDX file, you can navigate using `Link` and render `YouTube`, `Twitter`, and `TomatoBox` components without
an import.

```mdx
# Hello, world!

Here's a YouTube embed

<TomatoBox>
  <YouTube id="123abc" />
</TomatoBox>
```

Read more about injecting your own components: https://mdxjs.com/docs/using-mdx/#mdx-provider

## Migrating from v3 to v4

TODO

## Why MDX?

Before MDX, some of the benefits of writing Markdown were lost when integrating with JSX. Implementations were often template string-based which required lots of escaping and cumbersome syntax.

MDX seeks to make writing with Markdown and JSX simpler while being more expressive. Writing is fun again when you combine components, that can even be dynamic or load data, with the simplicity of Markdown for long-form content.

## Related

- [What is MDX](https://mdxjs.com/docs/what-is-mdx/)
- [Using MDX](https://mdxjs.com/docs/using-mdx/)
- [Troubleshooting MDX](https://mdxjs.com/docs/troubleshooting-mdx/)
- [Adding MDX Pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx/)
