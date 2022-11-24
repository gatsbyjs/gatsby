---
title: Deploying to Vercel
---

[Vercel](https://vercel.com/home) is a cloud platform that enables developers to host Jamstack websites and web services that deploy instantly, scale automatically, and requires no supervision, all with zero configuration. They provide a global edge network, SSL encryption, asset compression, cache invalidation, and more.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- A Vercel account

## Instructions

You can use Vercel with Gatsby in multiple ways:

- [Start from a template](https://vercel.com/guides/deploying-gatsby-with-vercel#start-from-a-template)
- With the [Vercel CLI](https://vercel.com/guides/deploying-gatsby-with-vercel#vercel-cli)
- With [Vercel for Git](https://vercel.com/guides/deploying-gatsby-with-vercel#vercel-for-git)

If you want to use a Custom Domain with your Vercel deployment, you can **Add** or **Transfer in** your domain via your Vercel [account Domain settings](https://vercel.com/dashboard/domains).

Vercel doesn't support advanced features like [SSR](/docs/how-to/rendering-options/using-server-side-rendering/), [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/), or [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn). You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup).

## Additional resources

- [Example Source](https://github.com/vercel/vercel/tree/main/examples/gatsby)
- [Official Vercel Guide](https://vercel.com/guides/deploying-gatsby-with-vercel)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Vercel Custom Domain Docs](https://vercel.com/docs/custom-domains)
