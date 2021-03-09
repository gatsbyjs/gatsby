---
title: Recipes
tableOfContentsDepth: 2
---

<!-- Basic template for a Gatsby recipe:

## Task to accomplish.
1-2 sentences about it. The more concise and focused, the better!

### Prerequisites
- System/version requirements
- Everything necessary to set up the task
- Including setting up accounts at other sites, like Netlify
- See [docs templates](/docs/docs-templates/) for formatting tips

### Directions
Step-by-step directions. Each step should be repeatable and to-the-point. Anything not critical to the task should be omitted.

#### Live example (optional)
A live example may not be possible depending on the nature of the recipe, in which case it is fine to omit.

### Additional resources
- Tutorials
- Docs pages
- Plugin READMEs
- etc.

See [docs templates](/docs/docs-templates/) in the contributing docs for more help.
-->

## New automated recipes available!

Looking for information on Gatsby CLI recipes? [Read the press release](/blog/2020-04-15-announcing-gatsby-recipes/) and [see the umbrella issue](https://github.com/gatsbyjs/gatsby/issues/22991) to learn more about automating your development workflows with `gatsby recipes`. Note that they are experimental.

## What are recipes?

Craving a happy medium between [full-length tutorials](/docs/tutorial/) and crawling the [docs](/docs/)? Here's a cookbook of guiding recipes on how to build things, Gatsby style.

## [1. Pages and layouts](/docs/recipes/pages-layouts/)

Add pages to your Gatsby site, and use layouts to manage common page elements.

- [Project structure](/docs/recipes/pages-layouts#project-structure)
- [Creating pages automatically](/docs/recipes/pages-layouts#creating-pages-automatically)
- [Linking between pages](/docs/recipes/pages-layouts#linking-between-pages)
- [Creating a layout component](/docs/recipes/pages-layouts#creating-a-layout-component)
- [Creating pages programmatically with createPage](/docs/recipes/pages-layouts#creating-pages-programmatically-with-createpage)

## [2. Styling with CSS](/docs/recipes/styling-css/)

There are so many ways to add styles to your website; Gatsby supports almost every possible option, through official and community plugins.

- [Using global CSS files without a Layout component](/docs/recipes/styling-css#using-global-css-files-without-a-layout-component)
- [Using global styles in a layout component](/docs/recipes/styling-css#using-global-styles-in-a-layout-component)
- [Using Styled Components](/docs/recipes/styling-css#using-styled-components)
- [Using CSS Modules](/docs/recipes/styling-css#using-css-modules)
- [Using Sass/SCSS](/docs/recipes/styling-css#using-sassscss)
- [Adding a Local Font](/docs/recipes/styling-css#adding-a-local-font)
- [Using Emotion](/docs/recipes/styling-css#using-emotion)
- [Using Google Fonts](/docs/recipes/styling-css#using-google-fonts)
- [Using Font Awesome](/docs/recipes/styling-css#using-fontawesome)

## [3. Working with plugins](/docs/recipes/working-with-plugins/)

[Plugins](/docs/plugins/) are Node.js packages that implement Gatsby APIs that are maintained officially, or by the community.

- [Using a plugin](/docs/recipes/working-with-plugins#using-a-plugin)
- [Creating a new plugin using a plugin starter](/docs/recipes/working-with-plugins#creating-a-new-plugin-using-a-plugin-starter)

## [4. Working with starters](/docs/how-to/local-development/starters/)

[Starters](/docs/starters/) are boilerplate Gatsby sites maintained officially, or by the community.

- [Using a starter](/docs/how-to/local-development/starters#using-a-starter)

## [5. Working with themes](/docs/recipes/working-with-themes/)

A Gatsby theme lets you centralize the look-and-feel of your site. You can seamlessly update a theme, compose themes together, and even swap out one compatible theme for another.

- [Creating a new site using a theme](/docs/recipes/working-with-themes#creating-a-new-site-using-a-theme)
- [Creating a new site using a theme starter](/docs/recipes/working-with-themes#creating-a-new-site-using-a-theme-starter)
- [Building a new theme](/docs/recipes/working-with-themes#building-a-new-theme)

## [6. Sourcing data](/docs/recipes/sourcing-data/)

Pull data from multiple locations, like the filesystem or database, into your Gatsby site.

- [Adding data to GraphQL](/docs/recipes/sourcing-data#adding-data-to-graphql)
- [Sourcing Markdown data for blog posts and pages with GraphQL](/docs/recipes/sourcing-data#sourcing-markdown-data-for-blog-posts-and-pages-with-graphql)
- [Sourcing from WordPress](/docs/recipes/sourcing-data#sourcing-from-wordpress)
- [Sourcing data from Contentful](/docs/recipes/sourcing-data#sourcing-data-from-contentful)
- [Pulling data from an external source and creating pages without GraphQL](/docs/recipes/sourcing-data#pulling-data-from-an-external-source-and-creating-pages-without-graphql)
- [Sourcing content from Drupal](/docs/recipes/sourcing-data#sourcing-content-from-drupal)

## [7. Querying data](/docs/recipes/querying-data/)

Gatsby lets you access your data across all sources using a single GraphQL interface.

- [Querying data with a Page Query](/docs/recipes/querying-data#querying-data-with-a-page-query)
- [Querying data with the StaticQuery Component](/docs/recipes/querying-data#querying-data-with-the-staticquery-component)
- [Querying data with the useStaticQuery hook](/docs/recipes/querying-data/#querying-data-with-the-usestaticquery-hook)
- [Limiting with GraphQL](/docs/recipes/querying-data#limiting-with-graphql)
- [Sorting with GraphQL](/docs/recipes/querying-data#sorting-with-graphql)
- [Filtering with GraphQL](/docs/recipes/querying-data#filtering-with-graphql)
- [GraphQL Query Aliases](/docs/recipes/querying-data#graphql-query-aliases)
- [GraphQL Query Fragments](/docs/recipes/querying-data#graphql-query-fragments)
- [Querying data client-side with fetch](/docs/recipes/querying-data#querying-data-client-side-with-fetch)

## [8. Working with images](/docs/recipes/working-with-images/)

Access images as static resources, or automate the process of optimizing them through powerful plugins.

- [Import an image into a component with webpack](/docs/recipes/working-with-images#import-an-image-into-a-component-with-webpack)
- [Reference an image from the static folder](/docs/recipes/working-with-images#reference-an-image-from-the-static-folder)
- [Optimizing and querying local images with gatsby-image](/docs/recipes/working-with-images#optimizing-and-querying-local-images-with-gatsby-image)
- [Optimizing and querying images in post frontmatter with gatsby-image](/docs/recipes/working-with-images#optimizing-and-querying-images-in-post-frontmatter-with-gatsby-image)

## [9. Transforming data](/docs/recipes/transforming-data/)

Transforming data in Gatsby is plugin-driven. Transformer plugins take data fetched using source plugins, and process it into something more usable (e.g. JSON into JavaScript objects, and more).

- [Transforming Markdown into HTML](/docs/recipes/transforming-data#transforming-markdown-into-html)
- [Transforming images into grayscale using GraphQL](/docs/recipes/transforming-data#transforming-images-into-grayscale-using-graphql)

## [10. Deploying your site](/docs/recipes/deploying-your-site/)

Showtime. Once you are happy with your site, you are ready to go live with it!

- [Preparing for deployment](/docs/recipes/deploying-your-site#preparing-for-deployment)
- [Deploying to Netlify](/docs/recipes/deploying-your-site#deploying-to-netlify)
- [Deploying to Vercel](/docs/recipes/deploying-your-site#deploying-to-vercel)
- [Deploying to Cloudflare Workers](/docs/recipes/deploying-your-site#deploying-to-cloudflare-workers)
- [Setting up Google Analytics](/docs/recipes/deploying-your-site#setting-up-google-analytics)
