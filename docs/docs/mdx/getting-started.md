---
title: Getting Started with MDX
---

## 🚀 Quick start

Use `npm init gatsby` to create a new site. At the question "Would you like to install additional features with other plugins?" choose the option "Add Markdown and MDX support".

## Add MDX to an existing Gatsby site

If you already have a Gatsby site that you'd like to add MDX to, you
can follow these steps for configuring the [gatsby-plugin-mdx](/plugins/gatsby-plugin-mdx/) plugin.

Alternatively, you may be looking to configure an existing blog site to use MDX. [This blog post](/blog/2019-11-21-how-to-convert-an-existing-gatsby-blog-to-use-mdx/) walks you through those steps in detail.

1. **Add `gatsby-plugin-mdx`** and MDX as dependencies

   ```shell
   npm install gatsby-plugin-mdx @mdx-js/react
   ```

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

Go check out the [writing MDX guide](/docs/mdx/writing-pages/) to find out what else you can do
with Gatsby and MDX.
