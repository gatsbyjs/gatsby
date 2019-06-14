---
title: Sourcing from Headless CMSs
overview: true
---

A core feature of Gatsby is its ability to **load data from anywhere**. This is what makes Gatsby more powerful than many other static site generators that are limited to only loading content from Markdown files.

A core benefit of this “data from anywhere” approach is that it allows teams to manage their content in nearly any backend they prefer.

Many content management systems (CMS) now support a “headless” mode, which is perfect for Gatsby sites. A headless CMS allows content creators to manage their content through a familiar admin interface, but allows developers to access the content via API endpoints, allowing for a fully customized frontend experience.

Through use of [source plugins](/plugins/?=source), Gatsby has support for dozens of headless CMS options, allowing your content team the comfort and familiarity of its preferred admin interface, and your development team the improved developer experience and performance gains of using Gatsby, GraphQL, and React to build the frontend.

The guides in this section will walk through the process of setting up content sourcing from some of the most popular headless CMSes in use today.

<!--
  Ordering in this section is driven by Gatsby plugin downloads (/plugins/?=gatsby-source-) & CMS vendor size/adoption.
-->

Other CMS systems you can connect to include:

| CMS                                           | Guides                                                                                                       | Plugin Docs                                   | Starter                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------- |
| [Contentful](https://www.contentful.com/)     | [guide](/docs/sourcing-from-contentful/)                                                                     | [docs](/packages/gatsby-source-contentful)    | [starter](/starters/contentful-userland/gatsby-contentful-starter/) |
| [Drupal](https://www.drupal.com/)             | [guide](/docs/sourcing-from-drupal/)                                                                         | [docs](/packages/gatsby-source-drupal)        |                                                                     |
| [Prismic](https://www.prismic.io/)            | [guide](/docs/sourcing-from-prismic/)                                                                        | [docs](/packages/gatsby-source-prismic)       |                                                                     |
| [NetlifyCMS](https://www.netlifycms.com/)     | [guide](/docs/sourcing-from-netlify-cms/)                                                                    | [docs](/packages/gatsby-source-netlifycms)    | [starter](/starters/netlify-templates/gatsby-starter-netlify-cms/)  |
| [WordPress](https://www.wordpress.com/)       | [guide](/docs/sourcing-from-wordpress/)                                                                      | [docs](/packages/gatsby-source-wordpress)     |                                                                     |
| [Shopify](https://www.shopify.com/)           |                                                                                                              | [docs](/packages/gatsby-source-shopify)       |                                                                     |
| [Strapi](https://strapi.io/)                  |                                                                                                              | [docs](/packages/gatsby-source-strapi)        |
| [DatoCMS](https://www.datocms.com/)           | [guide](https://www.gatsbyjs.com/guides/datocms/)                                                            | [docs](/packages/gatsby-source-datocms)       | [starter](/starters/datocms/gatsby-portfolio/)                      |
| [Sanity](https://www.sanity.io/)              | [guide](/docs/sourcing-from-sanity)                                                                          | [docs](/packages/gatsby-source-sanity/)       |
| [Contentstack](https://www.contentstack.com/) | [guide](https://www.contentstack.com/docs/example-apps/build-a-sample-website-using-gatsby-and-contentstack) | [docs](/packages/gatsby-source-contentstack)  | [starter](/starters/contentstack/gatsby-starter-contentstack/)      |
| [ButterCMS](https://buttercms.com/)           | [guide](/docs/sourcing-from-buttercms/)                                                                      | [docs](/packages/gatsby-source-buttercms)     | [starter](/starters/ButterCMS/gatsby-starter-buttercms/)            |
| [Ghost](https://ghost.org/)                   | [guide](/docs/sourcing-from-ghost/)                                                                          | [docs](/packages/gatsby-source-ghost/)        | [starter](/starters/TryGhost/gatsby-starter-ghost/)                 |
| [Kentico Cloud](https://kenticocloud.com/)    | [guide](/docs/sourcing-from-kentico-cloud)                                                                   | [docs](/packages/gatsby-source-kentico-cloud) | [starter](/starters/Kentico/gatsby-starter-kentico-cloud/)          |
| [Directus](https://directus.io/)              |                                                                                                              | [docs](/packages/gatsby-source-directus)      |
| [GraphCMS](https://graphcms.com/)             | [guide](/docs/sourcing-from-graphcms)                                                                        | [docs](/packages/gatsby-source-graphql)       | [starter](/starters/GraphCMS/gatsby-graphcms-tailwindcss-example/)  |
| [CosmicJS](https://cosmicjs.com/)             | [guide](/blog/2018-06-07-build-a-gatsby-blog-using-the-cosmic-js-source-plugin/)                             | [docs](/packages/gatsby-source-cosmicjs)      | [starters](/starters/?s=cosmicjs&v=2)                               |
| [Cockpit](https://getcockpit.com/)            |                                                                                                              | [docs](/packages/gatsby-plugin-cockpit)       |
| [Storyblok](https://www.storyblok.com/)       |                                                                                                              | [docs](/packages/gatsby-source-storyblok)     |
| [CraftCMS](https://craftcms.com/)             |                                                                                                              | [docs](/packages/gatsby-source-craftcms)      |

## How to add new guides to this section

If you don’t see your preferred CMS in this list, you can [write a new guide yourself](/contributing/how-to-contribute/) or [open an issue to request it](https://github.com/gatsbyjs/gatsby/issues/new/choose).
