---
title: Deploying to Netlify
---

[Netlify](https://www.netlify.com) includes a free tier and features like a CDN, HTTPS, custom domains, and continuous deployment from repositories.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- A Netlify account
- A GitHub/GitLab/Bitbucket account

## Instructions

By default, when you link a repository for a project, Netlify automatically detects the framework. For Gatsby, it will install the [Essential Gatsby build plugin](https://github.com/netlify/netlify-plugin-gatsby#readme) and provide suggested configuration values.

Follow Netlify's [Getting Started guide](https://docs.netlify.com/get-started/) to set up your project. You can read the [Gatsby on Netlify guide](https://docs.netlify.com/integrations/frameworks/gatsby/) to learn more.

Make sure to also install `gatsby-plugin-netlify` and add it to your `gatsby-config`.

## Limitations

At the moment, Netlify has limited support for these features:

- [SSR](/docs/how-to/rendering-options/using-server-side-rendering/) and [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/) (local images/files not working)
- [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn)

<CloudCallout>
  For automatic setup of builds that are deployed straight to Netlify:
</CloudCallout>

You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup). Gatsby Cloud also supports Netlify as a CDN target, so you can build on Gatsby Cloud and use Netlify's CDN.

## Additional resources

- [Gatsby Image CDN on Netlify](https://github.com/netlify/netlify-plugin-gatsby/blob/main/docs/image-cdn.md)
- [Typical Gatsby build settings](https://docs.netlify.com/integrations/frameworks/#gatsby)
- [Netlify Blog: Gatsby posts](https://www.netlify.com/blog/tags/gatsby/)
