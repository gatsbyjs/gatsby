---
title: Choosing Your CMS(s)
---

At their core, most medium-sized and large Gatsby websites are backed by a so-called "headless CMS". Headless CMSes excel at allowing content editors to flexibly create a content schema of inter-related content models.

One of the key questions people ask when building a Gatsby site is "which CMS should I use?"

## Choosing a Headless CMS

If you're looking for a primary CMS (general-purpose, flexible content modelling) to power your website, there are several ways you could make your decision:

**First**, focus on **top-flight general-purpose CMSs** with **first-class Gatsby integrations** and **high popularity** among Gatsby users. A ["first-class integration"](https://support.gatsbyjs.com/hc/en-us/articles/360052503494-Developing-a-first-class-CMS-integration-for-Gatsby-Cloud#:~:text=A%20first%2Dclass%20integration%20with%20Gatsby%20Cloud%20means%20that%20there's,more%20users%20and%20satisfied%20customers.) means it supports the main Cloud functionality of Gatsby -- previews and incremental builds.

In terms of popularity, you can see [top integrations listed by monthly downloads here](https://www.gatsbyjs.com/plugins?=gatsby-source). There are currently (January 2021) eight CMSs used by over 1% of Gatsby users. These are:

- **five general-purpose headless CMSs:** Contentful, Sanity, DatoCMS, Strapi, and Prismic

- **two general-purpose full-stack CMSs** running in "headless" mode: Wordpress and Drupal

- **one specialized CMS** (Shopify).

**Second**, consider the price point:

- If you're working on a personal project or prototype, a few of these have a generous free tier (Contentful, Sanity, DatoCMS, Strapi, Prismic).

- If you're looking more at "Team", "Pro", or "Business" price points (eg $29, $99, or $299 per month), the above CMSs are all good options, plus Wordpress and Drupal .

- If you're looking more at an "enterprise" project in the four digits per month and up, Contentful is the leader, with others using Contentstack, Sanity, and Strapi.

**Third,** consider project requirements.

**Contentful** is the most common CMS used with Gatsby, accounting for roughly half of all CMS usage with Gatsby. It's the most mature headless CMS as measured by revenue, number of customers, and venture funding. In some ways, it's become the "default" to use with Gatsby.

Users choosing other CMSs typically have a specific reason for their choice. While every user has different reasons for their choice, some trends we see users choosing **Sanity** or **Strapi** for the developer-friendliness or if they need something on-premise; **DatoCMS** if they will run into Contentful's model limits and want a lower-priced alternative, **Prismic** if they like the content editing UI; **Contentstack** if they like the editing UI and have an enterprise budget; **Wordpress** when the client or content team is already familiar with the Wordpress UI. **Drupal** if open-source, configurability / custom code are important.

## Using multiple CMS systems together

Another approach is, rather than using one CMS, use different CMSs for different parts of the website. Known as a ["content mesh" approach](https://www.gatsbyjs.com/blog/2018-10-04-journey-to-the-content-mesh/), the typical rationale here is that one CMS provides must-have specialized functionality but is less good for the rest of the site. Typically the decision is to use a specialized CMS for part of the website, and a general-purpose CMS for most of the website.

Typically there are two reasons to intentionally take this approach:

### Using Shopify as an e-commerce system

Shopify has best-in-class e-commerce functionality, but the rest of their interface (for example, their blogs feature) is often seen as subpar compared to other systems. As a result, it's very standard to use Shopify as the backend for the store, but a general purpose CMS like Contentful as the backend for the rest of the site.

### Using Wordpress as a blogging tool

Because Wordpress is so familiar to content authors, and has a best-in-class content composition experience, it's quite common to move the blog portion of the website with Gatsby, and use a flexible content modelling CMS for the rest of the website.

Apollo does this [for their blog](https://twitter.com/apollographql/status/1250479066605662210), as we do for the blog at [gatsbyjs.com/blog](gatsbyjs.com/blog).

### Considerations when using multiple CMSs

One of the key considerations when using content in multiple systems is that at some point one  content often needs to "know about" another system. For example, a landing page with content in Contentful may need to embed information about a specific product SKU (which lives in Shopify).

The easiest way to create relationship references across CMSs is through one CMS storing unique IDs of content living in another CMS. In this case, you'd store an array of Shopify product IDs as a field of the relevant model in Contentful, then pull in the correct data via the appropriate queries in gatsby-node.js.

## Other non-CMS options

Finally, there are several options for content composition and management that work well as non-CMS choices.

- Markdown and MDX are common choices for documentation and small developer sites, since they are natural composition formats for developers and allow embedding components within your content. There are several guides in our [Routing and Pages section](https://www.gatsbyjs.com/docs/how-to/routing/) on using Markdown and MDX. You may also want to consider a git-based CMS like NetlifyCMS or Foresty.io to provide a UI for this workflow.

- JSON or YAML is a common choice for hierarchical data, for example, a site navigation tree, especially when the underlying content is stored in markdown.

- Web-based spreadsheets, like Airtable or Google Sheets, are common use cases for tabular data. Airtable used this to power their store locator, and ProPublica used this as a database for interactive data journalism graphics.

- Other vertical-specific solutions for specific parts of the website, eg having a Careers page pull data from Greenhouse or Lever.
