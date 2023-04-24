---
title: Build
disableTableOfContents: true
---

Learn what _build_ means and how to set up a build process for your Gatsby project.

## What is a build?

_Build_ refers to the process of compiling your site. During a build, or at _build time_, your project gets transformed from component files to optimized HTML, CSS, and JavaScript files that you can [deploy](/docs/glossary#deploy) to your hosting provider.

There are a few ways to create a build. You can build your site locally on your computer using the [Gatsby CLI](/docs/reference/gatsby-cli/#build), and then deploy changes to your [host](/docs/glossary#hosting). If you use [Gatsby Cloud](https://www.gatsbyjs.com/), you can take advantage of [Gatsby Builds](/blog/2020-01-27-announcing-gatsby-builds-and-reports/), a feature available with every Gatsby Cloud account. You can also use a [continuous deployment](/docs/glossary/continuous-deployment/) service such as [AWS Amplify](/docs/how-to/previews-deploys-hosting/deploying-to-aws-amplify/) or [Netlify](/docs/how-to/previews-deploys-hosting/deploying-to-netlify/).

For larger teams or larger projects, you may want to use a continuous deployment approach to create builds. Each CD/CI service works slightly differently. Almost all of them, however, use the contents of a Git repository to build your site.

Gatsby Cloud, for example, integrates with [GitHub](https://github.com/), and a number of hosted [content management systems](/docs/glossary#cms). Gatsby Cloud creates a new build after every commit or content change, although you can also trigger a build manually.

### Using Gatsby CLI

For smaller teams and projects, use `gatsby build`. The `gatsby build` command is part of the Gatsby command line interface (or CLI). You'll need to install the CLI interface to create a site with Gatsby. Install it globally using [npm](/docs/glossary/#npm).

```shell
npm install -g gatsby-cli
```

Installing `gatsby-cli` globally makes Gatsby commands available system-wide. You'll use `gatsby new` to [create a new site](/docs/tutorial/getting-started/part-0/#create-a-gatsby-site), and `gatsby develop` to start a development server on your local machine.

When you're ready to publish your project, run the `gatsby build` command to create a production-ready version of your site. Once built, you can use an SFTP client, the [rsync](https://en.wikipedia.org/wiki/Rsync) utility, or similar tool to transfer these files to your host.

### Learn more about builds

- [Deploying and Hosting](/docs/deploying-and-hosting/) from the Gatsby docs
- How to enable super fast [Distributed Builds](/docs/distributed-builds/) for Gatsby Cloud
