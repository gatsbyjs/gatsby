---
title: Integrating and Partnering with Gatsby (for Vendors)
---

If you've a vendor in the website space -- whether that's content management, analytics, forms, e-commerce, or so on, you may have considered whether integrating or partnering with Gatsby makes sense.

This document explains a bit what exactly that would look like.

## About Gatsby

Gatsby is a web framework for creating blazing fast, compelling apps and websites without needing to become a performance expert.

Created in 2015 by [Kyle Mathews](/contributors/kyle-mathews/), it’s now backed by the commercial entity Gatsby Inc.

Gatsby has a 100,000+ strong community of users and contributors that have built [750+ plugins](/plugins/) and [250+ integrations](/plugins/?=gatsby-source) (as of Mar 2019).

You can read more at [gatsbyjs.com](https://www.gatsbyjs.com/).

## Why Work Together?

While vendor partners have many reasons for working with Gatsby and investing in tight integrations, some top reasons include:

- Customers are asking for a Gatsby integration, or asking you about how to use your solution and Gatsby together well.

- You’re investing in "headless", and you’re trying to add integrations with other systems providing website functionality, rather than force your customers into one specific templating language, set of tools, and/or deployment options. [BigCommerce](https://www.bigcommerce.com/blog/flexible-headless-commerce-solutions/#overview-of-bigcommerce-for-react-gatsby) is a good example of a vendor with this strategy.

- Drive "bottom-up" adoption of your tool from developers

## How to Work With Gatsby

We’d love to have you as part of our community. One of our values is "[you belong here](/blog/2018-09-07-gatsby-values/#you-belong-here)." We’d love for some of our community to use and adopt your solution.

Typically, there are four key phases or stages of partnership, depending on at any given time how much it makes sense for us to work together.

These stages are:

- **First,** your team building a Gatsby integration

- **Second,** your team launching the integration

- **Third,** co-marketing, and

- **Fourth,** integrating with Gatsby Preview and co-selling.

### Step One: Building a Gatsby Integration

If you haven’t yet integrated with Gatsby, [developer documentation](/docs/creating-a-source-plugin/) for creating a Gatsby "source plugin" is here.

In addition, you’ll probably want to create an "example" application. We call this a “starter”.

However development is most convenient, when you publish these, they should be in separate code repositories on GitHub.

Current partners have reported development timelines of 2-3 days when the content schema is fully defined by their platform, around up to 2 weeks when their platforms allowing the user to completely define the content schema, for a team of 1-2 developers.

If you have a GraphQL-based API, you **may not need to build an integration at all** -- Gatsby supports integration with GraphQL APIs via so-called ["schema stitching"](/blog/2018-09-25-announcing-graphql-stitching-support/).

If you have questions while building your Gatsby integrations, try reading other supporting documentation such as the [general plugin authoring guide](/docs/creating-plugins/) and [source plugin tutorial](/tutorial/pixabay-source-plugin-tutorial/).

If you still have questions, please [raise an issue on GitHub](https://github.com/gatsbyjs/gatsby/issues), ask a question in [Discord chat](https://gatsby.dev/discord), or reach out to our team at [developer-relations@gatsbyjs.com](mailto:developer-relations@gatsbyjs.com).

### Step Two: Launching Your Gatsby Integration

To launch your Gatsby integration, there are two steps:

1. **Publishing your integration to our [plugin library](/plugins/)**. If you built the integration, we have [developer documentation](/docs/plugin-authoring/#publishing-a-plugin-to-the-library) for publishing that integration to the Node.js package registry (npm). Once you publish it, over the next 24 hours, our system will automatically pull it in.

2. **Add your example to our [starter library](/starters/)**. Most Gatsby users find it easier to try a new integration when they can start with a ready-made code example. We created [a starter library](https://gatsbyjs.org/starters/) to showcase these plugins to the community. [Here’s how you add your starter to it](/contributing/submit-to-starter-library/).

### Step Three: Co-Marketing With Gatsby

By now, you’ve built and launched a Gatsby integration (or a community member has) -- congratulations!

We’d love to work together to share with the community how to use our products together to build modern website.

Depending on your size and reach, there are a few ways we can work together.

1. **Sharing your Gatsby-related content on Twitter.** After you publish your content, and blog about it, just tweet about it and we’re happy to retweet your content to the Gatsby community. We currently (March 2019) have an audience of over 22,000 on Twitter and a typical tweet is seen by around 7,000 developers.

2. **Blogging about your integration.** Our [gatsbyjs.org](/blog/) developer blog is open to quality posts from key partners to share about how to use our solutions together. A typical blog post gets 3,000 reads in the first 7 days, and around 10,000 reads over the course of a year.

If you’re an established vendor adding a Gatsby integration, we’d love for you to tell that story on our blog (e.g. [Kentico Cloud](/blog/2018-12-19-kentico-cloud-and-gatsby-take-you-beyond-static-websites/)). Here is a [guide to posting this in the blog](/docs/how-to-contribute/#contributing-to-the-blog).

3. **Writing a case study**. If you have customers using Gatsby & your solution, you can work with our marketing team at marketing@gatsbyjs.com to put together a joint case study of how our solutions work together, and post this on the gatsbyjs.org blog

### Step Four: Integrating with Gatsby Preview and Co-Selling

Our [Preview](https://www.gatsbyjs.com/preview/) product is currently in [closed beta](/blog/2019-03-22-introducing-gatsby-preview-beta/), and only supports Contentful as a CMS.

We’re in the process of opening it to more users and building support in for additional CMS systems. If this is interesting to you, we’d love to chat more.

In terms of what a "first-class" Gatsby Preview integration and partnership looks like, there are several components:

#### Engineering:

- A staging environment accessible by API. Some examples: [Contentful’s Preview API](https://www.contentful.com/developers/docs/references/content-preview-api/), [DatoCMS staging environment](https://www.datocms.com/changelog/multiple-deployment-environments), etc

- A way to alert Gatsby Preview about changes to content. If your API includes a way to subscribe to updates, then your Gatsby source plugin can directly subscribe to updates. This is our preferred method as it also works while developers and designers are working on the site. Another way to alert us of content changes is by sending webhooks when content is updated. You should send a webhook in under 3 seconds after the content changes.

- A button in the CMS editor where users can click through to Preview

- Featured on a plugin marketplace, if applicable. E.g., [Contentful Marketplace](https://www.contentful.com/developers/marketplace/gatsby-preview-sidebar/)

#### Marketing & Sales:

- Coordination and communication between our team and your marketing team. Executive buy-in or support on your end for co-marketing.

- Co-marketing, such as co-branded campaigns or content discussing [YOUR SOLUTION] + Gatsby Preview.

- Our team working to train your sales team (both account executives and sales engineers) on describing the benefits of Gatsby to prospective customers. If relevant, we can work to train your customer success team as well.

## Conclusion: The Content Mesh

One of the trends we’re seeing is that the CMS is becoming a "[content mesh](/blog/2018-10-04-journey-to-the-content-mesh/)" -- best of breed tools are emerging with distinct feature set -- headless CMS, specialized CMS, forms, analytics, auth, A/B testing, UI frameworks, and so on.

In this new world, the key to producing really high quality sites is making it easy for developer teams to choose best of breed tools that are tightly integrated with each other.

As you build and strengthen your Gatsby integration, you’re building a bridge into this new world, gaining access to the excited and enthusiastic Gatsby community, and making it much easier for your customers to build really, really high quality websites.

We look forward to having you here!
