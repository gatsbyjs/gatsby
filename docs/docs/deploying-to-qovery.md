---
title: Deploying to Qovery
---

## Introduction

[Qovery](https://www.qovery.com) is a fully-managed Cloud platform where you can host your modern application (web, database, broker, storage).

> Trusted by developers from great companies - Google, Red Hat, Elastic and more

Qovery include the following:

- Continuous, automatic builds & deploys from GitHub, Gitlab and Bitbucket.
- [Custom domains](https://docs.qovery.com/services/network/dns).
- Automatic TLS certificates through [Let's Encrypt](https://letsencrypt.org).
- Microservices support.
- Auto-scaling support.
- Native HTTP/2 support.
- [Isolated environment](https://docs.qovery.com/extending-qovery/branches-and-environments) per git branch.
- Managed databases (PostgreSQL, MySQL, MongoDB, Elasticsearch, Redis, Memcached, Cassandra).
- Managed brokers (RabbitMQ, Kafka).
- Managed storage (S3).
- Custom URL redirects and rewrites.

## Prerequisites
To get started, you'll need:

- You have an account with GitHub, GitLab or Bitbucket.
- You have completed the Quick Start or have a Gatsby website you are ready to deploy and share with the world.
- You have a Qovery account. You can sign up at [start.qovery.com](https://start.qovery.com).

## Deploy your application

You can set up a Gatsby site on Qovery in five quick steps:

**1/** Install the Qovery CLI
Here is [how to install the Qovery CLI](https://docs.qovery.com/extending-qovery/cli) documentation

**2/** Sign up

```bash
# Sign up with Github, Gitlab, Bitbucket
$ qovery auth
```

**3/** Configure your project and generate a .qovery.yml

```bash
# generate the .qovery.yml at the root of your project directory
$ qovery init
```

**4/** Add this Dockerfile at the root of your repository

```Dockerfile
FROM node:12-buster as build

RUN yarn global add gatsby-cli
WORKDIR /app
ADD . ./
RUN yarn
RUN gatsby build

FROM gatsbyjs/gatsby
COPY --from=build /app/public /pub

EXPOSE 80
```

**4/** Git commit, push and your Gatsby site is deployed

```bash
# Git commit and push your code
$ git add .qovery.yml Dockerfile
$ git commit -m "add .qovery.yml and Dockerfile files"
$ git push -u origin master
```

**5/** Get your public URL

```bash
$ qovery status
```

That's it! Your site will be live on your Qovery URL (which looks like `yoursite.qovery.io`) as soon as the build is done.

## Continuous Integration (CI) and Continuous Deployment (CD)

Now that Qovery is connected to your repository, it will **automatically build and publish your site** any time you push to your GitHub/Gitlab/Bitbucket.

You can also choose to [disable auto deploys](https://docs.qovery.com/extending-qovery/branches-and-environments#restrict-branches-deployments).

## Environments

Qovery brings the powerful [concept of environment](https://docs.qovery.com/extending-qovery/branches-and-environments) to never break the production and safely develop new feature.

## Custom Domains

Add your own domains to your site easily using Qovery's [custom domains](https://docs.qovery.com/services/network/dns) guide.

## Support

Chat with Qovery developers and the #support team at [discord.qovery.com](https://discord.qovery.com) if you need help.

## References

- [Example project](https://docs.qovery.com/quickstart/examples/deploy-a-gatsby-application)
