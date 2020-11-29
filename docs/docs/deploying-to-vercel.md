---
title: Deploying to Vercel
---

This guide walks through how to deploy and host your next Gatsby project to Vercel.

[Vercel](https://vercel.com/home) is a cloud platform that enables developers to host Jamstack websites and web services that deploy instantly, scale automatically, and requires no supervision, all with zero configuration. They provide a global edge network, SSL encryption, asset compression, cache invalidation, and more.

## Step 1: Deploying your Gatsby project to Vercel

To deploy your Gatsby project with a [Vercel for Git Integration](https://vercel.com/docs/git-integrations), make sure it has been pushed to a Git repository.

Import the project into Vercel using the [Import Flow](https://vercel.com/import/git). During the import, you will find all relevant [options](https://vercel.com/docs/build-step#build-&-development-settings) preconfigured for you with the ability to change as needed.

After your project has been imported, all subsequent pushes to branches will generate [Preview Deployments](https://vercel.com/docs/platform/deployments#preview), and all changes made to the [Production Branch](https://vercel.com/docs/git-integrations#production-branch) (commonly "master" or "main") will result in a [Production Deployment](https://vercel.com/docs/platform/deployments#production).

Once deployed, you will get a URL to see your app live, such as the following: https://gatsby-example.vercel.app/.

## Step 2 (optional): Using a Custom Domain

If you want to use a Custom Domain with your Vercel deployment, you can **Add** or **Transfer in** your domain via your Vercel [account Domain settings](https://vercel.com/dashboard/domains).

To add your domain to your project, navigate to your [Project](https://vercel.com/docs/platform/projects) from the Vercel Dashboard. Once you have selected your project, click on the "Settings" tab, then select the **Domains** menu item. From your projects **Domain** page, enter the domain you wish to add to your project.

Once the domain as been added, you will be presented with different methods for configuring it.

## Deploying a fresh Gatsby project

You can deploy a fresh Gatsby project, with a Git repository set up for you, with the following Deploy Button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/git?s=https%3A%2F%2Fgithub.com%2Fvercel%2Fvercel%2Ftree%2Fmaster%2Fexamples%2Fgatsby)

## References:

- [Example Source](https://github.com/vercel/vercel/tree/master/examples/gatsby)
- [Official Vercel Guide](https://vercel.com/guides/deploying-gatsby-with-vercel)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Vercel Custom Domain Docs](https://vercel.com/docs/custom-domains)
