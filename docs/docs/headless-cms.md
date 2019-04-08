---
title: Headless CMS
overview: true
---

A core feature of Gatsby is its ability to **load data from anywhere**. This is what makes Gatsby more powerful than many other static site generators that are limited to only loading content from Markdown files.

A core benefit of this “data from anywhere” approach is that it allows teams to manage their content in nearly any backend they prefer.

Many content management systems (CMS) now support a “headless” mode, which is perfect for Gatsby sites. A headless CMS allows content creators to manage their content through a familiar admin interface, but allows developers to access the content via API endpoints, allowing for a fully customized frontend experience.

Through use of [source plugins](/plugins/?=source), Gatsby has support for dozens of headless CMS options, allowing your content team the comfort and familiarity of its preferred admin interface, and your development team the improved developer experience and performance gains of using Gatsby, GraphQL, and React to build the frontend.

The guides in this section will walk through the process of setting up content sourcing from some of the most popular headless CMSes in use today.

[[guidelist]]

<!--
  Ordering in this section is driven by Gatsby plugin downloads (/plugins/?=gatsby-source-) & CMS vendor size/adoption.
-->

Other CMS systems you can connect to include:

- [Shopify](/packages/gatsby-source-shopify)
- [Strapi](/packages/gatsby-source-strapi)
- [DatoCMS](https://www.datocms.com): [docs](/packages/gatsby-source-datocms), [business case](https://www.gatsbyjs.com/guides/datocms/)
- [Sanity](https://www.sanity.io/): [docs](/packages/gatsby-source-sanity/), [guide](/docs/sourcing-from-sanity)
- [Contentstack](https://www.contentstack.com): [docs](/packages/gatsby-source-contentstack), [guide](https://www.contentstack.com/docs/example-apps/build-a-sample-website-using-gatsby-and-contentstack), [starter](/starters/contentstack/gatsby-starter-contentstack/)
- [ButterCMS](https://buttercms.com): [docs](/packages/gatsby-source-buttercms), [guide](/docs/sourcing-from-buttercms/), [starter](/starters/ButterCMS/gatsby-starter-buttercms/)
- [Ghost](https://ghost.org): [docs](/docs/sourcing-from-ghost/), [guide](/blog/2019-01-14-modern-publications-with-gatsby-ghost/), [starter](/starters/TryGhost/gatsby-starter-ghost/)
- [Kentico Cloud](https://kenticocloud.com/): [docs](/packages/gatsby-source-kentico-cloud), [guide](/docs/sourcing-from-kentico-cloud), [launch post](/blog/2018-12-19-kentico-cloud-and-gatsby-take-you-beyond-static-websites/), [starter](/starters/Kentico/gatsby-starter-kentico-cloud/)
- [Directus](/packages/gatsby-source-directus)
- [GraphCMS](https://graphcms.com/?ref=gatsby-headless-cms-landing]): [docs](/packages/gatsby-source-graphql), [guide](/docs/sourcing-from-graphcms), [starter](/starters/GraphCMS/gatsby-graphcms-tailwindcss-example/)
- [CosmicJS](https://cosmicjs.com/): [docs](/packages/gatsby-source-cosmicjs), [guide](/blog/2018-06-07-build-a-gatsby-blog-using-the-cosmic-js-source-plugin/)
- [Cockpit](/packages/gatsby-plugin-cockpit)
- [Storyblok](/packages/gatsby-source-storyblok)
- [CraftCMS](/packages/gatsby-source-craftcms)

## How to add new guides to this section

If you don’t see your preferred CMS in this list, you can [write a new guide yourself](/contributing/how-to-contribute/) or [open an issue to request it](https://github.com/gatsbyjs/gatsby/issues/new/choose).
