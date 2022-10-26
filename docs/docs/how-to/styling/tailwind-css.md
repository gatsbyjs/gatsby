---
title: Tailwind CSS
---

Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces. This guide will show you how to get started with Gatsby and [Tailwind CSS](https://tailwindcss.com/).

## Installing and configuring Tailwind

Please follow the [official "Install Tailwind CSS with Gatsby" guide](https://tailwindcss.com/docs/guides/gatsby) to install and configure Tailwind CSS with Gatsby. Some important notes when configuring Tailwind with Gatsby:

- It is **not recommended** that you include Gatsby's output directories (`public` and `.cache`) in your `content` array in your `tailwind.config.js`. You should only include your source files to have Tailwind working as expected.
- If you use [GraphQL Typegen](/docs/how-to/local-development/graphql-typegen/) a file at `src/gatsby-types.d.ts` will be generated and with the default configuration for `content` in `tailwind.config.js` this will trigger an infinite loop. You have two options to fix this:
  1. Configure GraphQL Typegen's [`typesOutputPath` option](/docs/reference/config-files/gatsby-config/#graphqltypegen) to generate the file in another place
  2. Adapt the `content` array to not include the `src/gatsby-types.d.ts` file, for example:
     ```diff:title=tailwind.config.js
     module.exports = {
       content: [
     -   "./src/**/*.{js,jsx,ts,tsx}",
     +   "./src/pages/*.{js,jsx,ts,tsx}",
     +   "./src/components/**/*.{js,jsx,ts,tsx}"
       ],
     }
     ```

## Other resources

- [Tailwind Documentation](https://tailwindcss.com/)
- [Using Tailwind with CSS-in-JS](https://github.com/ben-rogerson/twin.macro)
