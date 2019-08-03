---
title: Getting Started with MDX
---

## Add MDX to a Gatsby site

[MDX](https://mdxjs.com/) is a format that allows you include and write JSX components inside your markdown documents. Assuming you already [have a Gatsby site created](/docs/quick-start/), you can add the ability to write `.mdx` files in `src/pages` to create new pages by following these steps for configuring the [gatsby-plugin-mdx](/packages/gatsby-plugin-mdx/) plugin:

1. **Add `gatsby-plugin-mdx`** and MDX as dependencies

   ```sh
   npm install gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react
   ```

   > **Note:** If you're upgrading from v0, additionally [check out the MDX migration guide](https://mdxjs.com/migrating/v1).

1. **Update your `gatsby-config.js`** to use `gatsby-plugin-mdx`

   ```javascript:title=gatsby-config.js
   module.exports = {
     plugins: [
       // ....
       `gatsby-plugin-mdx`,
     ],
   }
   ```

1. **Restart `gatsby develop`** and add an `.mdx` page to `src/pages

> **Note:** If you want to query for frontmatter, exports, or other fields like
> `tableOfContents` and you haven't previously added a `gatsby-source-filesystem`
> pointing at `src/pages` in your project, you'll want to add one now.

## What's next?

Go check out the [writing MDX guide](/docs/mdx/writing-pages) to find out what else you can do
with Gatsby and MDX.
