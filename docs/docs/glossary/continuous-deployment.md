---
title: Continuous Deployment
disableTableOfContents: true
---

## What is continuous deployment?

Continuous deployment (CD) is the automation of code deployments. In a continuous deployment system, you don't push a <q>Deploy</q> button or run a `deploy` command. Instead, you build a _pipeline_ — a process that [builds](/docs/glossary/build/) and releases code automatically, without human intervention.

You'll most likely use a service to create your continuous deployment pipeline. Services such as [Netlify](https://www.netlify.com/), [AWS Amplify](https://aws.amazon.com/amplify/), [Azure](https://azure.microsoft.com/en-us/), and [Vercel](https://vercel.com/) are popular with Gatsby users. Or you can use [Gatsby Builds](/blog/2020-01-27-announcing-gatsby-builds-and-reports/), a feature of the [Gatsby Cloud](https://www.gatsbyjs.com/) service.

A continuous deployment pipeline begins with a [Git](https://git-scm.com/) repository. Git is source control management software, and you use it to manage changes to your site's code. Most continuous deployment services require a hosted Git service such as [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/), or [Bitbucket](https://bitbucket.org/).

Your continuous deployment pipeline also requires a configuration file. Gatsby Builds, for example, uses `package.json`. This configuration file contains the list of packages that your software project requires, and which tests it should run. It also ensures that your test, staging, and production environments stay in sync.

Committing a change to your Git repository triggers the build and test process. Your continuous deployment service will download and install the packages listed in your configuration file. Once that's complete, it will run your test suite.

If your changes pass the tests, they'll be published to your production environment. If any of your tests fail, the changes won't be published. Continuous deployment enables small changes from multiple developers to be deployed quickly, without breaking a site in production.

### <q>Continuous deployment</q> versus <q>continuous delivery</q>

You'll sometimes see the phrase _continuous delivery_ instead of <q>continuous deployment</q>. Continuous delivery also uses a pipeline to build and test code, but may not deploy it. Continuous deployment builds and deploys code but may not test it. In practice, these services overlap. Most services that offer continuous delivery also provide automated deployments; you probably won't use continuous deployment without tests.

## Learn more about continuous deployment

- [Preparing a Site for Deployment](/docs/preparing-for-deployment/)
- [Deploying and Hosting](/docs/deploying-and-hosting/) in the Gatsby docs
- [Announcing Gatsby Builds and Reports](/blog/2020-01-27-announcing-gatsby-builds-and-reports/)
