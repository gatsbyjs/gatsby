---
title: Getting Started with MDX
---

## 🚀 Quick start

Use `npm init gatsby` to create a new site. At the question "Would you like to install additional features with other plugins?" choose the option "Add Markdown and MDX support".

## Add MDX to an existing Gatsby site

If you already have a Gatsby site that you'd like to add MDX to, you
can follow these steps for configuring the [gatsby-plugin-mdx](/plugins/gatsby-plugin-mdx/) plugin.

1. **Add `gatsby-plugin-mdx`** and MDX as dependencies

   ```shell
   npm install gatsby-plugin-mdx gatsby-plugin-filesystem @mdx-js/react
   ```

2. **Update your `gatsby-config.js`** to use `gatsby-plugin-mdx`

   ```javascript:title=gatsby-config.js
    module.exports = {
      plugins: [
        // ....
        `gatsby-plugin-mdx`,
        {
          resolve: "gatsby-source-filesystem:pages",
          options: {
            name: "pages",
            path: `${__dirname}/src/pages/`,
          },
        },
      ],
    };
   ```

3. **Restart `gatsby develop`** and add an `.mdx` page to `src/pages`

## What's next?

Go check out the [writing MDX guide](/docs/mdx/writing-pages/) to find out what else you can do
with Gatsby and MDX.
