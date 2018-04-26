---
title: How Gatsby Changes Teams' Website Development Workflow
date: "2018-04-25"
author: "Sam Bhagwat"
excerpt: Gatsby is more than just a new website framework -- it changes the way your team works together.
tags: ["collaboration"]
---

Gatsby is more than just a new website framework -- creating websites in Gatsby is a fundamentally different paradigm than in a CMS-specific framework.

Website teams adopting Gatsby report improved collaboration at each stage -- from architecture and user research, to design and development, to testing and launch. Many of these derive from Gatsby features: faster development cycles, easy compatibility with React component libraries, a CMS-agnostic development environment, the ability to easily deploy static build artifacts.

To fully take advantage of new, Gatsby-enabled workflows, consider adopting some of these techniques:

### Architecture

_Take advantage of extended evaluation periods to build a component library_

Larger companies considering adopting Gatsby often plan in terms of migrating multiple sites (or internationalized versions of sites) over a timeframe of a few months to two years. These projects can have long preparation times before active development starts.

One high-leverage activity during these time windows is to focus development on a React component library. Then, when development begins the team is able to quickly assemble Gatsby React pages from these pre-built components. Consider designating senior UI developers as "component architects" in this process.

_Consider a less-expensive CMS or multi-modal architecture_

Choosing Gatsby frees your CMS from doing a lot of the heavy lifting, such as scaling to meet peak load and having a rich, modern web development experience. If you're using an expensive enterprise CMS, Gatsby can help your project stay within budget by allowing you to choose a simpler, cheaper option, such as a hosted Drupal instance, or a content management SaaS like Contentful.

Another consideration is that not all of your content _has_ to live in one system. Often, you can save time and money by create a multi-modal content architecture with best-in-class solutions for each of the different workflows & capabilities you require. You might choose to manage your e-commerce product catalog in Shopify, company-specific marketing pages in Contentful, and form-based event data in Google Sheets & Forms. Gatsby offers plugins to pull data from multiple sources, while building with one stack.

### User Research

_Utilize developers to prototype faster_

In order to do user testing, usually user researchers work with designers to construct pixel perfect prototypes of various options, either static or clickable. Constructing and iterating on these artifacts can take days or weeks.

Gatsby makes another option possible. Some Gatsby users report [setting up a production site](https://www.gatsbyjs.org/blog/2018-01-18-how-boston-gov-used-gatsby-to-be-selected-as-an-amazon-hq2-candidate-city/) with live UI that is building and deploying in under an hour.

Especially if your organization already uses a React or HTML-based component library, your team may consider bringing in a developer to construct live wireframe-level prototypes. This may enable you to accelerate the user research process, start the development process with a working prototype rather than from scratch, and ultimately let you arrive at a better version of your site.

### Development

_Make progress without access to the client CMS_

Sometimes website development teams don't gain access to the client's CMS until development has already started. This can happen for a variety of reasons -- internal client policies, the need to onboard content editors, and so forth. Typically this is a difficult situation where development can be blocked or delayed, and can lead to timeline slippage, crunch time at the end of the project, and so on.

With Gatsby, the CMS-agnostic development workflow gives teams tools to continue to make progress even without access to client content. One common approach is to develop and prototype UIs pulling placeholder content from markdown files stored in the repo. When the team gains access, it only takes a few lines of code to reconfigure the site to pull content from the CMS.

## QA and Testing

Gatsby's extensible system of API hooks, tight integration with static hosts like Netlify, and use of React's modular component architecture, allow website teams to enable more effective QA <-> Development workflows.

_Use development pages to communicate project status & collaborate with designers_

One option some teams have found powerful is to create static page components within Gatsby to [handle necessary parts of the development/QA workflow](https://www.gatsbyjs.org/blog/2018-04-11-trying-out-gatsby-at-work-and-co/#1-pre-integration-qa).

This could include:
* Checking UI implementation of various components to ensure behavior is intended
* Enabling QA visibility into desired site-specific page-level validations, such as "don't end a page in a carousel"
* Communicating build history and last build status

_Use branch and pull request-based artifacts to collaborate on specific pieces of work_

Using the [branch and pull request-based artifacts](https://www.gatsbyjs.org/blog/2018-04-11-trying-out-gatsby-at-work-and-co/#building-staging-urls
) automatically created by a service like Netlify for collaboration between developers, designers, and QA. Because generated artifacts are static, pull request collaboration workflows are resilient to underlying content schema changes, such as field deletion, that might break a typical CMS development environment.

