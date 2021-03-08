---
title: Getting Started with MDX
---

The fastest way to get started with Gatsby + MDX is to use the [MDX
starter](https://github.com/gatsbyjs/gatsby-starter-mdx-basic). This
allows you to write `.mdx` files in `src/pages` in order to create new pages on
your site.

## 🚀 Quick start

1. **Initialize the MDX starter** with the Gatsby CLI

   ```shell
   gatsby new my-mdx-starter https://github.com/gatsbyjs/gatsby-starter-mdx-basic
   ```

2. **Run the dev server** by changing directory to the scaffolded site and install dependencies

   ```shell
   cd my-mdx-starter/
   gatsby develop
   ```

3. **Open the site** running at `http://localhost:8000`

4. **Update the MDX content** by opening the `my-mdx-starter` directory
   in your code editor of choice and edit `src/pages/index.mdx`.
   Save your changes and the browser will update in real time!

## Add MDX to an existing Gatsby site

If you already have a Gatsby site that you'd like to add MDX to, you
can follow these steps for configuring the [gatsby-plugin-mdx](/plugins/gatsby-plugin-mdx/) plugin.

Alternatively, you may be looking to configure an existing blog site to use MDX. [This blog post](/blog/2019-11-21-how-to-convert-an-existing-gatsby-blog-to-use-mdx/) walks you through those steps in detail.

1. **Add `gatsby-plugin-mdx`** and MDX as dependencies

   ```shell
   npm install gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react
   ```

   > **Note:** If you're upgrading from v0, additionally [check out the MDX migration guide](https://mdxjs.com/migrating/v1).

2. **Update your `gatsby-config.js`** to use `gatsby-plugin-mdx`

   ```javascript:title=gatsby-config.js
   module.exports = {
     plugins: [
       // ....
       `gatsby-plugin-mdx`,
     ],
   }
   ```

3. **Restart `gatsby develop`** and add an `.mdx` page to `src/pages`

> **Note:** If you want to query for frontmatter, exports, or other fields like
> `tableOfContents` and you haven't previously added a `gatsby-source-filesystem`
> pointing at `src/pages` in your project, you'll want to add one now.

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-set-up-a-gatsby-site-to-use-mdx-with-gatsby-plugin-mdx-with-a-default-layout"
  lessonTitle="Set up a Gatsby site to use MDX with gatsby-plugin-mdx with a default layout"
/>

## What's next?

Go check out the [writing MDX guide](/docs/how-to/routing/mdx/writing-pages) to find out what else you can do
with Gatsby and MDX.
