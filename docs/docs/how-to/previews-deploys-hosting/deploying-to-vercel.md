---
title: Deploying to Vercel
---

[Vercel](https://vercel.com/home) is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration. They support over 35 frontend frameworks, including Gatsby.

Vercel supports Gatsby features like SSG, SSR, DSG, API Routes, and more.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- A Vercel account

## Instructions

You can use Vercel with Gatsby in multiple ways:

- [Start from a template](https://vercel.com/guides/deploying-gatsby-with-vercel#start-from-a-template)
- With the [Vercel CLI](https://vercel.com/guides/deploying-gatsby-with-vercel#vercel-cli)
- With [Vercel for Git](https://vercel.com/guides/deploying-gatsby-with-vercel#vercel-for-git)

If you want to use a Custom Domain with your Vercel deployment, you can **Add** or **Transfer in** your domain via your Vercel [account Domain settings](https://vercel.com/dashboard/domains).

Vercel doesn't currently support `File` nodes inside of SSR/DSG, as well as the [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn).

## Additional resources

- [Example Source](https://github.com/vercel/vercel/tree/main/examples/gatsby)
- [Official Vercel Guide](https://vercel.com/guides/deploying-gatsby-with-vercel)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Vercel Custom Domain Docs](https://vercel.com/docs/custom-domains)
