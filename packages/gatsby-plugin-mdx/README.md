# gatsby-plugin-mdx

`gatsby-plugin-mdx` is the official integration for using [MDX](https://mdxjs.com) with [Gatsby](https://www.gatsbyjs.com).

MDX is markdown for the component era. It lets you write JSX embedded inside markdown. It’s a great combination because it allows you to use markdown’s often terse syntax (such as `# heading`) for the little things and JSX for more advanced components.

<details>
<summary><strong>Table of contents</strong></summary>

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Extensions](#extensions)
  - [`gatsby-remark-*` plugins](#gatsby-remark--plugins)
  - [mdxOptions](#mdxoptions)
- [Imports](#imports)
- [Layouts](#layouts)
- [Programmatically create MDX pages](#programmatically-create-mdx-pages)
- [GraphQL MDX Node structure](#graphql-mdx-node-structure)
- [Extending the GraphQL MDX nodes](#extending-the-graphql-mdx-nodes)
- [Components](#components)
  - [MDXProvider](#mdxprovider)
  - [Shortcodes](#shortcodes)
- [Migrating from v3 to v4](#migrating-from-v3-to-v4)
- [Why MDX?](#why-mdx)
- [Related](#related)

</details>

## Installation

```shell
npm install gatsby-plugin-mdx gatsby-source-filesystem @mdx-js/react
```

## Usage

> This README assumes you're using `gatsby@5.3.0` or later. If you're using an older Gatsby version or don't want to use ESM for your Gatsby files, refer to [this older version of the README](https://www.npmjs.com/package/gatsby-plugin-mdx/v/5.8.0).

After installing `gatsby-plugin-mdx` you can add it to your plugins list in your `gatsby-config`.

We highly **recommend** using [ES Modules (ESM)](https://www.gatsbyjs.com/docs/how-to/custom-configuration/es-modules/) syntax for your `gatsby-config` file as it'll enable you to use the latest packages from the `unified` ecosystem.

You'll also want to configure `gatsby-source-filesystem` to point at your `src/pages` directory.

```js:title=gatsby-config.mjs
import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = {
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

export default config
```

By default, this configuration will allow you to automatically create pages with `.mdx` files in `src/pages`.

If you have MDX files in another location than `src/pages` you'll need to add another instance of `gatsby-source-filesystem` and configure the `path` to point at this folder. This is necessary for MDX files that you want to import into React components or for files you want to query via GraphQL.

**Please Note:**

- `gatsby-plugin-mdx` requires `gatsby-source-filesystem` to be present and configured to process local MDX files in order to generate the resulting Gatsby nodes (`gatsby-source-filesystem` needs to discover all MDX files in order to create MDX nodes and allow the processing for each of them).
- MDX syntax differs from Markdown as it only supports [CommonMark](https://commonmark.org/) by default. Nonstandard markdown features like [GitHub flavored markdown (GFM)](https://mdxjs.com/guides/gfm/) can be enabled with plugins (see [`mdxOptions` instructions](#mdxoptions)). GFM includes features like tables or footnotes.
- Certain features like HTML syntax doesn't work in MDX. Read the ["What is MDX?" guide](https://mdxjs.com/docs/what-is-mdx/#markdown) to learn more.

To automatically create pages from MDX files outside of `src/pages` you'll need to configure `gatsby-plugin-page-creator` and `gatsby-source-filesystem` to point to this folder of files.

```js:title=gatsby-config.mjs
import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = {
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

export default config
```

Also check out the guide [Adding MDX Pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx/) for more details.

## Configuration

`gatsby-plugin-mdx` exposes a configuration API that can be used similarly to any other Gatsby plugin. You can define MDX extensions, layouts, global scope, and more.

| Key                                              | Default    | Description                                                         |
| ------------------------------------------------ | ---------- | ------------------------------------------------------------------- |
| [`extensions`](#extensions)                      | `[".mdx"]` | Configure the file extensions that `gatsby-plugin-mdx` will process |
| [`gatsbyRemarkPlugins`](#gatsby-remark--plugins) | `[]`       | Use Gatsby-specific remark plugins                                  |
| [`mdxOptions`](#mdxOptions)                      | `{}`       | Options directly passed to `compile()` of `@mdx-js/mdx`             |

### Extensions

By default, only files with the `.mdx` file extension are treated as MDX when
using `gatsby-source-filesystem`. To use `.md` or other file extensions, you can
define an array of file extensions in the `gatsby-plugin-mdx` section of your
`gatsby-config.js`.

```js:title=gatsby-config.mjs
const config = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
      },
    },
  ],
}

export default config
```

### `gatsby-remark-*` plugins

This config option is used for compatibility with a set of plugins many people [use with remark](https://www.gatsbyjs.com/plugins/?=gatsby-remark-) that require the Gatsby environment to function properly. In some cases, like [gatsby-remark-prismjs](https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs/), it makes more sense to use a library like [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) to render codeblocks using a [React component](/api-reference/mdx-provider). In other cases, like [gatsby-remark-images](https://www.gatsbyjs.com/plugins/gatsby-remark-images/), the interaction with the Gatsby APIs is well deserved because the images can be optimized by Gatsby and you should continue using it.

When using these `gatsby-remark-*` plugins, be sure to also install their required peer dependencies. You can find that information in their respective README.

```js:title=gatsby-config.mjs
const config = {
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

export default config
```

Using a string reference is also supported for `gatsbyRemarkPlugins`.

```js
gatsbyRemarkPlugins: [`gatsby-remark-images`]
```

### mdxOptions

These configuration options are directly passed into the MDX compiler.

See all available options in [the official documentation of `@mdx-js/mdx`](https://mdxjs.com/packages/mdx/#compilefile-options).

```js:title=gatsby-config.mjs
import remarkGfm from "remark-gfm"
import remarkExternalLinks from "remark-external-links"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

const config = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        mdxOptions: {
          remarkPlugins: [
            // Add GitHub Flavored Markdown (GFM) support
            remarkGfm,
            // To pass options, use a 2-element array with the
            // configuration in an object in the second element
            [remarkExternalLinks, { target: false }],
          ],
          rehypePlugins: [
            // Generate heading ids for rehype-autolink-headings
            rehypeSlug,
            // To pass options, use a 2-element array with the
            // configuration in an object in the second element
            [rehypeAutolinkHeadings, { behavior: `wrap` }],
          ],
        },
      },
    },
  ],
}

export default config
```

**Please Note:** Most of the remark/rehype/unified ecosystem is published as ESM which means that you have to use [ES Modules (ESM) and Gatsby](https://www.gatsbyjs.com/docs/how-to/custom-configuration/es-modules/).

## Imports

When importing a React component into your MDX, you can import it using the `import` statement like in JavaScript.

```mdx
import { SketchPicker } from "react-color"

# Hello, world!

Here's a color picker!

<SketchPicker />
```

**Note:** You should restart `gatsby develop` to update imports in MDX files. Otherwise, you'll get a `ReferenceError` for new imports. You can use the [shortcodes](#shortcodes) approach if that is an issue for you.

## Layouts

You can use regular [layout components](https://www.gatsbyjs.com/docs/how-to/routing/layout-components/) to apply layout to your sub pages.

To inject them, you have several options:

1. Use the [`wrapPageElement` API](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#wrapPageElement) including its [SSR counterpart](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/#wrapPageElement).
1. Add an `export default Layout` statement to your MDX file, see [MDX documentation on Layout](https://mdxjs.com/docs/using-mdx/#layout).
1. When using the [`createPage` action](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createPage) to programatically create pages, you should use the following URI pattern for your page component: `your-layout-component.js?__contentFilePath=absolute-path-to-your-mdx-file.mdx`. To learn more about this, head to the [programmatically creating pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx#programmatically-creating-pages) guide.

## Programmatically create MDX pages

Read the MDX documentation on [programmatically creating pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx#programmatically-creating-pages) to learn more.

## GraphQL MDX Node structure

In your GraphQL schema, you will discover several additional data related to your MDX content. While your local [GraphiQL](http://localhost:8000/___graphql) will give you the most recent data, here are the most relevant properties of the `Mdx` entities:

| Property                   | Description                                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontmatter`              | Sub-entity with all frontmatter data. Regular Gatsby transformations apply, like you can format dates directly within the query.                                             |
| `excerpt`                  | A pruned variant of your content. By default trimmed to 140 characters. Based on [rehype-infer-description-meta](https://github.com/rehypejs/rehype-infer-description-meta). |
| `tableOfContents`          | Generates a recursive object structure to reflect a table of contents. Based on [mdast-util-toc](https://github.com/syntax-tree/mdast-util-toc).                             |
| `body`                     | The raw MDX body (so the MDX file without frontmatter)                                                                                                                       |
| `internal.contentFilePath` | The absolute path to the MDX file (useful for passing it to `?__contentFilePath` query param for layouts). Equivalent to the `absolutePath` on File nodes.                   |

## Extending the GraphQL MDX nodes

Use the [`createNodeField`](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNodeField) action to extend MDX nodes. All new items will be placed under the `fields` key. You can [alias your `fields`](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#aliasing-fields) to have them at the root of the GraphQL node.

### timeToRead

1. Install `reading-time` into your project:
   ```shell
   npm install reading-time
   ```
1. In your `gatsby-node` add a new field:

   ```js:title=gatsby-node.mjs
   import readingTime from "reading-time"

   export const onCreateNode = ({ node, actions }) => {
     const { createNodeField } = actions
     if (node.internal.type === `Mdx`) {
       createNodeField({
         node,
         name: `timeToRead`,
         value: readingTime(node.body)
       })
     }
   }
   ```

1. You're now able to query the information on the MDX node:
   ```graphql
   query {
     mdx {
       fields {
         timeToRead {
           minutes
           text
           time
           words
         }
       }
     }
   }
   ```

### wordCount

See [timeToRead](#timeToRead). It returns `timeToRead.words`.

### slug

This largely comes down to your own preference and how you want to wire things up. This here is one of many possible solutions to this:

1. Install `@sindresorhus/slugify` into your project:
   ```shell
   npm install @sindresorhus/slugify
   ```
1. In your `gatsby-node` add a new field:

   ```js:title=gatsby-node.mjs
   import slugify from "@sindresorhus/slugify"

   export const onCreateNode = ({ node, actions }) => {
     const { createNodeField } = actions
     if (node.internal.type === `Mdx`) {
       createNodeField({
         node,
         name: `slug`,
         value: `/${slugify(node.frontmatter.title)}`
       })
     }
   }
   ```

1. You're now able to query the information on the MDX node:
   ```graphql
   query {
     mdx {
       fields {
         slug
       }
     }
   }
   ```

If you don't want to use the `frontmatter.title`, adjust what you input to `slugify()`. For example, if you want information from the `File` node, you could use `getNode(node.parent)`.

### headings

1. Install necessary dependencies into your project:
   ```shell
   npm install mdast-util-to-string unist-util-visit
   ```
1. Create a new file called `remark-headings-plugin.mjs` at the site root:

   ```js:title=remark-headings-plugin.mjs
   import { visit } from "unist-util-visit"
   import { toString } from "mdast-util-to-string"

   const transformer = (tree, file) => {
     let headings = []

     visit(tree, `heading`, heading => {
       headings.push({
         value: toString(heading),
         depth: heading.depth,
       })
     })

     const mdxFile = file
     if (!mdxFile.data.meta) {
       mdxFile.data.meta = {}
     }

     mdxFile.data.meta.headings = headings
   }

   const remarkHeadingsPlugin = () => transformer

   export default remarkHeadingsPlugin
   ```

1. Add a new `headings` field resolver to your `Mdx` nodes through `createSchemaCustomization` API:

   ```js:title=gatsby-node.mjs
   import { compileMDXWithCustomOptions } from "gatsby-plugin-mdx"
   import remarkHeadingsPlugin from "./remark-headings-plugin.mjs"

   export const createSchemaCustomization = async ({ getNode, getNodesByType, pathPrefix, reporter, cache, actions, schema, store }) => {
     const { createTypes } = actions

     const headingsResolver = schema.buildObjectType({
       name: `Mdx`,
       fields: {
         headings: {
           type: `[MdxHeading]`,
           async resolve(mdxNode) {
             const fileNode = getNode(mdxNode.parent)

             if (!fileNode) {
               return null
             }

             const result = await compileMDXWithCustomOptions(
               {
                 source: mdxNode.body,
                 absolutePath: fileNode.absolutePath,
               },
               {
                 pluginOptions: {},
                 customOptions: {
                   mdxOptions: {
                     remarkPlugins: [remarkHeadingsPlugin],
                   },
                 },
                 getNode,
                 getNodesByType,
                 pathPrefix,
                 reporter,
                 cache,
                 store,
               }
             )

             if (!result) {
               return null
             }

             return result.metadata.headings
           }
         }
       }
     })

     createTypes([
       `
         type MdxHeading {
           value: String
           depth: Int
         }
       `,
       headingsResolver,
     ])
   }
   ```

1. You're now able to query the information on the MDX node:
   ```graphql
   query {
     mdx {
       headings {
         value
         depth
       }
     }
   }
   ```

## Components

MDX and `gatsby-plugin-mdx` use components for different things like rendering and component mappings.

### MDXProvider

`MDXProvider` is a React component that allows you to replace the
rendering of tags in MDX content. It does this by providing a list of
components via context to the internal `MDXTag` component that handles
rendering of base tags like `p` and `h1`.

```jsx
import { MDXProvider } from "@mdx-js/react"

const MyH1 = props => <h1 style={{ color: `tomato` }} {...props} />
const MyParagraph = props => (
  <p style={{ fontSize: "18px", lineHeight: 1.6 }} {...props} />
)

const components = {
  h1: MyH1,
  p: MyParagraph,
}

export const ComponentsWrapper = ({ children }) => (
  <MDXProvider components={components}>{children}</MDXProvider>
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
| `hr`            | [Break](https://github.com/syntax-tree/mdast#break)                  | `---`                                               |
| `a`             | [Link](https://github.com/syntax-tree/mdast#link)                    | `<https://mdxjs.com>` or `[MDX](https://mdxjs.com)` |
| `img`           | [Image](https://github.com/syntax-tree/mdast#image)                  | `![alt](https://mdx-logo.now.sh)`                   |
<!-- prettier-ignore-end -->

It's important to define the `components` you pass in a stable way
so that the references don't change if you want to be able to navigate
to a hash. That's why we defined `components` outside of any render
functions in these examples.

### Shortcodes

If you want to allow usage of a component from anywhere (often referred to as a shortcode), you can pass it to the [MDXProvider](https://www.gatsbyjs.com/docs/how-to/routing/mdx#make-components-available-globally-as-shortcodes).

```jsx:title=src/components/layout.jsx
import React from "react"
import { MDXProvider } from "@mdx-js/react"
import { Link } from "gatsby"
import { YouTube, Twitter, TomatoBox } from "./ui"

const shortcodes = { Link, YouTube, Twitter, TomatoBox }

export const Layout = ({ children }) => (
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

Read more about injecting your own components in the [official MDX provider guide](https://mdxjs.com/docs/using-mdx/#mdx-provider).

## Migrating from v3 to v4

`gatsby-plugin-mdx@^4.0.0` is a complete rewrite of the original plugin with the goal of making the plugin faster, compatible with [MDX v2](https://mdxjs.com/blog/v2/), leaner, and more maintainable. While doing this rewrite we took the opportunity to fix long-standing issues and remove some functionalities that we now think should be handled by the user, not the plugin. In doing so there will be of course breaking changes you'll have to handle – but with the help of this migration guide and the codemods you'll be on the new version in no time!

### Updating dependencies

```shell
npm remove @mdx-js/mdx
npm install gatsby-plugin-mdx@latest @mdx-js/react@latest
```

If you used any related plugins like `gatsby-remark-images`, also update them to their `@latest` version.

### New options in `gatsby-config`

- Move your `remarkPlugins` and `rehypePlugins` keys into the new `mdxOptions` config option:

  ```diff
  const config = {
    plugins: [
      {
        resolve: `gatsby-plugin-mdx`,
        options: {
  -       remarkPlugins: [],
  -       rehypePlugins: [],
  +       mdxOptions: {
  +         remarkPlugins: [],
  +         rehypePlugins: [],
  +       },
        },
      },
    ],
  }

  export default config
  ```

- There's a new option called `mdxOptions` which is passed directly to the MDX compiler. See all available options in [the official documentation of `@mdx-js/mdx`](https://mdxjs.com/packages/mdx/#compilefile-options).
- Only `extensions`, `gatsbyRemarkPlugins`, and `mdxOptions` exist as options now. Every other option got removed, including `defaultLayouts`. See the [layouts guide](#layouts) to learn how to use layouts with `gatsby-plugin-mdx@^4.0.0`.
- Make sure that any `gatsby-remark-*` plugins are only listed inside the `gatsbyRemarkPlugins` array of `gatsby-plugin-mdx`, not inside the `plugins` array of `gatsby-config` or in any other place.

### GFM & ESM-only packages

- [GitHub flavored markdown (GFM)](https://mdxjs.com/guides/gfm/) support was removed from MDX v2. You can re-enable it with [`mdxOptions`](#mdxoptions) (you have to install `remark-gfm`)
- Most of the remark ecosystem is ESM so just using the latest package version of `remark-*`/`rehype-*` most probably won't work. Check out the workarounds mentioned in [`mdxOptions`](#mdxoptions)

### Updating `createPage` action in `gatsby-node`

In most cases the changes necessary here are related to the removal of `defaultLayouts` option and the new way how layouts are done. See the [layouts guide](#layouts) to learn how to use layouts with `gatsby-plugin-mdx@^4.0.0`.

You'll need to do two things to continue using your old layout file:

1. You need to query the absolute path to the MDX file
1. You have to attach this MDX file via the `__contentFilePath` query param to your layout file

```diff
const postTemplate = path.resolve(`./src/templates/post.jsx`)

actions.createPage({
-  component: postTemplate,
+  component: `${postTemplate}?__contentFilePath=/path/to/content.mdx`,
})
```

Or a more complete example:

```js
const postTemplate = path.resolve(`./src/templates/post.jsx`)

// Rest of createPages API...

const { data } = await graphql(`
  {
    allMdx {
      nodes {
        id
        frontmatter {
          slug
        }
// highlight-start
        internal {
          contentFilePath
        }
// highlight-end
      }
    }
  }
`)

data.allMdx.nodes.forEach(node => {
  actions.createPage({
    path: node.frontmatter.slug,
    component: `${postTemplate}?__contentFilePath=${node.internal.contentFilePath}`, // highlight-line
    context: {
      id: node.id,
    },
  })
})
```

You'll also need to update your template file itself, see the next section [Updating page templates](#updating-page-templates).

Note: You could also directly pass the MDX file to the `component` like this:

```js
actions.createPage({
  component: `/path/to/content.mdx`,
  // If you don't want to construct it yourself, use internal.contentFilePath
  // component: node.internal.contentFilePath
})
```

However, we'd recommend placing such files into the `src/pages` directory and `gatsby-plugin-mdx` will handle the page creation itself.

### Updating page templates

1. Instead of querying for the `body` on the MDX node, the page template now receives the transformed MDX as `children` property.
1. You no longer need to use `<MDXRenderer>` as you can use `{children}` directly.

```diff
import React from "react"
import { graphql } from "gatsby"
- import { MDXRenderer } from "gatsby-plugin-mdx"

- function PostTemplate({ data: { mdx } }) {
+ function PostTemplate({ data: { mdx }, children }) {

  return (
    <main>
      <h1>{mdx.frontmatter.title}</h1>
-     <MDXRenderer>
-       {mdx.body}
-     </MDXRenderer>
+     {children}
    </main>
  )
}

 export const pageQuery = graphql`
  query PostTemplate($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
      }
-     body
    }
  }
`

export default PostTemplate
```

### Updating MDX content

As MDX v2 changed the way it handles content you might need to update your MDX files to be valid MDX now. See their [Update MDX content guide](https://mdxjs.com/migrating/v2/#update-mdx-content) for all details. In [What is MDX?](https://mdxjs.com/docs/what-is-mdx/#markdown) it is also laid out which features don't work. Most importantly for this migration:

- HTML syntax doesn’t work in MDX as it’s replaced by JSX (`<img>` to `<img />`). Instead of HTML comments, you can use JavaScript comments in braces: `{/* comment! */}`
- Unescaped left angle bracket / less than (`<`) and left curly brace (`{`) have to be escaped: `\<` or `\{` (or use expressions: `{'<'}`, `{'{'}`)
  - If you're using the `enableCustomId` option from `gatsby-remark-autolink-headers` you'll run into problems due to the above. You need to disable this option and use [`rehype-slug-custom-id`](https://github.com/unicorn-utterances/rehype-slug-custom-id) instead.

In our testing, most of the time the issue were curly brackets that needed to be escaped with backticks:

```diff
- You can upload this to Git{Hub,Lab}
+ You can upload this to `Git{Hub,Lab}`
```

You can also use [`eslint-mdx`](https://github.com/mdx-js/eslint-mdx) to find all culprits and in some cases automatically fix them through ESLint.

### Updating MDX nodes

Since most MDX nodes are moved to userland you'll have to [extend the GraphQL MDX nodes](#extending-the-graphql-mdx-nodes) and update your queries accordingly. However, you can [alias your `fields`](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#aliasing-fields) to have them at the root of the GraphQL node.

Here's an example of an updated query (if you re-implemented most features):

```diff
 {
-  timeToRead
-  rawBody
-  slug
   headings
-  html
-  mdxAST
-  wordCount
-  fileAbsolutePath
+  body
+  fields {
+    timeToRead
+    slug
+  }
+  internal {
+    contentFilePath
+  }
 }
```

Here's an example on how you'd alias your `fields` to keep the shape of the MDX node the same:

```js:title=gatsby-node.mjs
import readingTime from "reading-time"

export const onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    createNodeField({
      node,
      name: `timeToRead`,
      value: readingTime(node.body)
    })
  }
}

export const createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`#graphql
    type Mdx implements Node {
      # You can also use other keys from fields.timeToRead if you don't want "minutes"
      timeToRead: Float @proxy(from: "fields.timeToRead.minutes")
      wordCount: Int @proxy(from: "fields.timeToRead.words")
    }
  `)
}
```

### v3 to v4: Breaking Changes

- Removed plugin options: `defaultLayouts`, `mediaTypes`, `lessBabel`, `shouldBlockNodeFromTransformation`, `commonmark`
- Moved plugin options `remarkPlugins` and `rehypePlugins` into `mdxOptions`
- Removed `timeToRead`, `rawBody`, `slug`, `headings`, `html`, `mdxAST`, `wordCount`, `fileAbsolutePath` from the query result. You can check [Extending the GraphQL MDX nodes](#extending-the-graphql-mdx-nodes) to learn how to re-implement some of them on your own. Also check [Updating MDX nodes](#updating-mdx-nodes) for guidance on changing your queries
- `gatsby-plugin-mdx` only applies to local files (that are sourced with `gatsby-source-filesystem`)
- Removed the ability to use `js` and `json` in frontmatter
- Loading MDX from other sources as the filesystem is not supported. If you have a need for that, please comment in the [GitHub Discussion](https://github.com/gatsbyjs/gatsby/discussions/25068)
- All [MDX v2 migration](https://mdxjs.com/migrating/v2/) notes apply

As mentioned above the `html` field was removed from the GraphQL node. We know that some of you used this for e.g. `gatsby-plugin-feed`. Unfortunately, for compatibility and performance reasons we had to remove it. We recommend using the `excerpt` field in the meantime until we find a feasible solution to provide MDX rendered as HTML. If you have any suggestions, please comment on the [GitHub Discussion](https://github.com/gatsbyjs/gatsby/discussions/25068).

## Why MDX?

Before MDX, some of the benefits of writing Markdown were lost when integrating with JSX. Implementations were often template string-based which required lots of escaping and cumbersome syntax.

MDX seeks to make writing with Markdown and JSX simpler while being more expressive. Writing is fun again when you combine components, that can even be dynamic or load data, with the simplicity of Markdown for long-form content.

## Related

- [What is MDX](https://mdxjs.com/docs/what-is-mdx/)
- [Using MDX](https://mdxjs.com/docs/using-mdx/)
- [Troubleshooting MDX](https://mdxjs.com/docs/troubleshooting-mdx/)
- [Adding MDX Pages](https://www.gatsbyjs.com/docs/how-to/routing/mdx/)
