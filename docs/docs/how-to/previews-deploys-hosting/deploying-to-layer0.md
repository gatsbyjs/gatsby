---
title: Deploying to Layer0
---

This guide walks through how to deploy and host your next Gatsby project to Layer0.

[Layer0](https://www.layer0.co) is an all-in-one platform to develop, deploy, preview, experiment on, monitor, and run your headless frontend. It is focused on large, dynamic websites and best-in-class performance through EdgeJS (a JavaScript-based Content Delivery Network), predictive prefetching, and performance monitoring. Layer0 offers a free tier.

## Step 1: Getting Started

- Sign up for a free account on [Layer0's signup page](https://app.layer0.co/signup)
- Install the [Layer0 CLI](https://docs.layer0.co/guides/cli)

   ```shell
   npm i -g @layer0/cli
   ```
   
Once deployed, you will get a URL to see your app live, such as the following: https://layer0-docs-layer0-gatsby-example-default.layer0-limelight.link/.
   
## Step 2: Configure your project for Layer0

Run the following in the root folder of your project:

   ```shell
   0 init
   ```

This will automatically update your package.json and add all of the required Layer0 dependencies and files to your project. These include:
- The `@layer0/core` package - Allows you to declare routes and deploy your application on Layer0
- The `@layer0/prefetch` package - Allows you to configure a service worker to prefetch and cache pages to improve browsing speed
- `layer0.config.js` - A configuration file for Layer0
- `routes.js` - A default routes file that sends all requests to Gatsby.

## Running and deploying your project

- To test your app locally, run the following in your project directory:

  ```shell
  0 dev
  ```

- To deploy your app, run the following in your project directory:

  ```shell
  0 deploy
  ```

## Deploying a fresh Gatsby project

You can deploy a fresh Gatsby project, with a Git repository set up for you, with the following Deploy Button:

[![Deploy with Layer0](https://docs.layer0.co/button.svg)](https://app.layer0.co/deploy?repo=https://github.com/layer0-docs/layer0-gatsby-example)

## References:

- [Example Source](https://github.com/layer0-docs/layer0-gatsby-example)
- [Official Layer0 Guide](https://docs.layer0.co/guides/gatsby)
- [Layer0 Deployment Docs](https://docs.layer0.co/docs)
