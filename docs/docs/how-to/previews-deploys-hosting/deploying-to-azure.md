---
title: Deploying to Azure Static Web Apps
---

[Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/overview) is a service that automatically builds and deploys full stack web apps to Azure from a code repository. Azure is a large cloud platform with hundreds of services working together to give you serverless, databases, AI, and static website hosting. The Azure Static Web Apps service is meant to be used with static websites. It provides features like hosting, [CDN](/docs/glossary/content-delivery-network/), authentication/authorization, [continuous deployment](/docs/glossary/continuous-deployment/) with Git-triggered builds, HTTPS, the ability to add a serverless API, and much more.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- A GitHub account
- An Azure account

## Instructions

You can get started with Azure Static Web Apps by following their [Publish a Gatsby site to Azure Static Web Apps guide](https://learn.microsoft.com/en-gb/azure/static-web-apps/publish-gatsby?WT.mc_id=staticwebapps-github-chnoring).

## Limitations

Azure Static Web Apps doesn't support advanced features like [SSR](/docs/how-to/rendering-options/using-server-side-rendering/), [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/), or [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn). You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup).

## Additional resources

There's much more to learn about Azure Static Web Apps such as working with routes, setting up custom domains, adding a Serverless API, and much more. Below are some useful links:

- [Docs: Azure Static Web Apps, overview page](https://docs.microsoft.com/en-gb/azure/static-web-apps?WT.mc_id=staticwebapps-github-chnoring)
- [Docs: Azure Static Web Apps, add Serverless API](https://docs.microsoft.com/en-us/azure/static-web-apps/apis?WT.mc_id=staticwebapps-github-chnoring)
- [Docs: Azure Static Web Apps, setup Custom domain](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain?WT.mc_id=staticwebapps-github-chnoring)
- [LEARN module: Gatsby and Azure Static Web Apps](https://docs.microsoft.com/learn/modules/create-deploy-static-webapp-gatsby-app-service?WT.mc_id=staticwebapps-github-chnoring)
- [LEARN module: SPA applications + Serverless API and Azure Static Web Apps](https://docs.microsoft.com/learn/modules/publish-app-service-static-web-app-api?WT.mc_id=staticwebapps-github-chnoring)
- [Docs: Azure Static Web Apps, Routing](https://docs.microsoft.com/en-us/azure/static-web-apps/routes?WT.mc_id=staticwebapps-github-chnoring)
- [Docs: Azure Static Web Apps, Authentication & Authorization](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?WT.mc_id=staticwebapps-github-chnoring)
- [Quickstart: Azure Static Web Apps + Gatsby](https://docs.microsoft.com/en-gb/azure/static-web-apps/publish-gatsby?WT.mc_id=staticwebapps-github-chnoring)
