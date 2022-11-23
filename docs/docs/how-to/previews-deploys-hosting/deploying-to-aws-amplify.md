---
title: Deploying to AWS Amplify
---

[AWS Amplify](https://aws.amazon.com/amplify/) is a combination of client library, CLI toolchain, and a console for continuous deployment and hosting. The Amplify CLI and library allow developers to get up & running with full-stack cloud-powered applications with features like authentication, storage, serverless GraphQL or REST APIs, analytics, Lambda functions, & more. Hosting includes features such as globally available CDNs, easy custom domain setup + HTTPS, feature branch deployments, and password protection.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- A GitHub account

## Instructions

You can get started with AWS Amplify by following their [Gatsby with AWS Amplify guide](https://docs.amplify.aws/guides/hosting/gatsby/q/platform/js/).

## Limitations

AWS Amplify doesn't support advanced features like [SSR](/docs/how-to/rendering-options/using-server-side-rendering/), [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/), or [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn). You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup).

## Additional resources

- If you want more control over hosting on AWS you can also [deploy your Gatsby site to AWS S3](/docs/how-to/previews-deploys-hosting/deploying-to-s3-cloudfront/).
