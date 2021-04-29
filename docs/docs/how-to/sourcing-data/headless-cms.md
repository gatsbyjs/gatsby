---
title: What is a Headless CMS and How to Source Content from One
---

A _headless CMS_ is content management software that enables writers to produce and organize content, while providing developers with structured data that can be displayed using a separate system on the frontend of a website or app.

A traditional, monolithic CMS is responsible for both the backend management of content, and serving that content to end users. In contrast, a headless CMS is decoupled from frontend concerns, which frees developers to build rich experiences for end users, using the best technology available.

Many traditional content management systems (CMS), like WordPress and Drupal, now support a “headless” or “decoupled” mode, which is perfect for Gatsby sites. Through use of source plugins, Gatsby has support for dozens of headless CMS options, allowing your content team the comfort and familiarity of its preferred admin interface.

We've included setup guides, and links to the integration documentation as well as official starters (when these exist).

<CloudCallout>For integrating your site with a headless CMS:</CloudCallout>

<!--
  Ordering in this section is driven by Gatsby plugin downloads (/plugins/?=gatsby-source-) & CMS vendor size/adoption. The Gatsby team is responsible for deciding which CMSs are included in the "Main CMSs" section.
-->

## Main CMSs

The following CMSs have high popularity among Gatsby users and support key functionality like content previews and incremental builds. If you're choosing between CMSs, we recommend reading the [Choosing Your CMS(s)](https://www.gatsbyjs.com/docs/conceptual/choosing-a-cms/) documentation.

| CMS                                           | Guides                                                         | Plugin Docs                                 | Official Starter                                                   |
| --------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| [Contentful](https://www.contentful.com/)     | [guide](/docs/how-to/sourcing-data/sourcing-from-contentful/)  | [docs](/plugins/gatsby-source-contentful)   | [starter](/starters/contentful/starter-gatsby-blog/)               |
| [WordPress](https://www.wordpress.com/)       | [guide](/docs/how-to/sourcing-data/sourcing-from-wordpress/)   | [docs](/plugins/gatsby-source-wordpress)    |                                                                    |
| [Shopify](https://www.shopify.com/)           |                                                                | [docs](/plugins/gatsby-source-shopify)      |                                                                    |
| [Sanity](https://www.sanity.io/)              | [guide](/docs/sourcing-from-sanity)                            | [docs](/plugins/gatsby-source-sanity/)      |                                                                    |
| [Strapi](https://strapi.io/)                  | [guide](/blog/2018-1-18-strapi-and-gatsby/)                    | [docs](/plugins/gatsby-source-strapi)       | [starter](/starters/strapi/strapi-starter-gatsby-blog/)            |
| [Contentstack](https://www.contentstack.com/) | [guide](/docs/sourcing-from-contentstack)                      | [docs](/plugins/gatsby-source-contentstack) | [starter](/starters/contentstack/gatsby-starter-contentstack/)     |
| [DatoCMS](https://www.datocms.com/)           | [guide](https://www.gatsbyjs.com/guides/datocms/)              | [docs](/plugins/gatsby-source-datocms)      | [starter](/starters/datocms/gatsby-portfolio/)                     |
| [Drupal](https://www.drupal.com/)             | [guide](/docs/how-to/sourcing-data/sourcing-from-drupal/)      | [docs](/plugins/gatsby-source-drupal)       |                                                                    |
| [Prismic](https://www.prismic.io/)            | [guide](/docs/how-to/sourcing-data/sourcing-from-prismic/)     | [docs](/plugins/gatsby-source-prismic)      |                                                                    |
| [NetlifyCMS](https://www.netlifycms.org/)     | [guide](/docs/how-to/sourcing-data/sourcing-from-netlify-cms/) | [docs](/plugins/gatsby-plugin-netlify-cms)  | [starter](/starters/netlify-templates/gatsby-starter-netlify-cms/) |

## Other CMSs

| CMS                                     | Guides                                                                           | Plugin Docs                                         | Official Starter                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| [Cosmic](https://cosmicjs.com/)         | [guide](/blog/2018-06-07-build-a-gatsby-blog-using-the-cosmic-js-source-plugin/) | [docs](/plugins/gatsby-source-cosmicjs)             | [starters](/starters/?s=cosmic&v=2)                                  |
| [ButterCMS](https://buttercms.com/)     | [guide](/docs/sourcing-from-buttercms/)                                          | [docs](/plugins/gatsby-source-buttercms)            | [starter](/starters/ButterCMS/gatsby-starter-buttercms/)             |
| [Ghost](https://ghost.org/)             | [guide](/docs/sourcing-from-ghost/)                                              | [docs](/plugins/gatsby-source-ghost/)               | [starter](/starters/TryGhost/gatsby-starter-ghost/)                  |
| [Kentico Kontent](https://kontent.ai/)  | [guide](/docs/sourcing-from-kentico-kontent)                                     | [docs](/plugins/@kentico/gatsby-source-kontent)     | [starter](/starters/Kentico/gatsby-starter-kontent-lumen/)           |
| [Directus](https://directus.io/)        |                                                                                  | [docs](/plugins/@directus/gatsby-source-directus/)  |                                                                      |
| [GraphCMS](https://graphcms.com/)       | [guide](/docs/sourcing-from-graphcms)                                            | [docs](/plugins/gatsby-source-graphql)              | [starter](/starters/GraphCMS/gatsby-graphcms-tailwindcss-example/)   |
| [Storyblok](https://www.storyblok.com/) | [guide](https://www.storyblok.com/tp/gatsby-multilanguage-website-tutorial)      | [docs](/plugins/gatsby-source-storyblok)            | [starter](https://github.com/storyblok/gatsby-storyblok-boilerplate) |
| [Cockpit](https://getcockpit.com/)      |                                                                                  | [docs](/plugins/gatsby-plugin-cockpit)              |                                                                      |
| [CraftCMS](https://craftcms.com/)       |                                                                                  | [docs](/plugins/gatsby-source-craftcms)             |                                                                      |
| [Agility CMS](https://agilitycms.com/)  | [guide](/docs/sourcing-from-agilitycms/)                                         | [docs](/plugins/@agility/gatsby-source-agilitycms/) | [starter](/starters/agility/agility-gatsby-starter/)                 |
| [Forestry](https://forestry.io/)        | [guide](/docs/sourcing-from-forestry/)                                           |                                                     |                                                                      |
| [Gentics Mesh](https://getmesh.io)      | [guide](/docs/sourcing-from-gentics-mesh)                                        |                                                     |                                                                      |
| [Seams-CMS](https://seams-cms.com/)     | [guide](/docs/sourcing-from-seams-cms)                                           |                                                     |                                                                      |
| [Builder.io](https://www.builder.io/)   | [guide](/docs/sourcing-from-builder-io/)                                         | [docs](/plugins/@builder.io/gatsby/)                | [starter](https://github.com/BuilderIO/gatsby-starter-builder)       |
| [Flotiq](https://flotiq.com/)           | [guide](/docs/sourcing-from-flotiq/)                                             | [docs](/plugins/gatsby-source-flotiq)               | [starter](https://github.com/flotiq/gatsby-starter-blog)             |
| [Tina](https://tina.io)                 | [guide](https://tina.io/guides/#gatsby)                                          | [docs](https://tina.io/docs/integrations/gatsby/)   |                                                                      |

## Integrating with other CMSs

Other CMSs not on the list above can be found on the [plugins directory](/plugins/?=source). If your preferred CMS is integrated with Gatsby but not on this list, you can [open a pull request to add it](/contributing/how-to-contribute/). If your preferred CMS is not yet integrated with Gatsby, you can [write your own source plugin](/docs/how-to/plugins-and-themes/creating-a-source-plugin/).
