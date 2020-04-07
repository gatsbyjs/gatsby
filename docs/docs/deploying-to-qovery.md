---
title: Deploying to Qovery
---

## Introduction

[Qovery](https://www.qovery.com) is a fully-managed cloud platform where you can host your modern applications. It can not only build and host your Gatsby site but also take care of your backend applications, databases, message brokers and other services.

> Trusted by developers from great companies - Google, Red Hat, Elastic and more

**Qovery include the following:**

- Continuous, automatic builds & deploys from GitHub, Gitlab and Bitbucket.
- [Custom domains](https://docs.qovery.com/services/network/dns).
- Automatic TLS certificates through [Let's Encrypt](https://letsencrypt.org).
- Microservices support.
- Auto-scaling support.
- Native HTTP/2 support.
- [Isolated environments](https://docs.qovery.com/extending-qovery/branches-and-environments) per git branch.
- Managed databases (PostgreSQL, MySQL, MongoDB, Elasticsearch, Redis, Memcached, Cassandra).
- Managed brokers (RabbitMQ, Kafka).
- Managed storage (S3).
- Custom URL redirects and rewrites.

## Prerequisites
To get started, you'll need:

- GitHub, GitLab or Bitbucket account.
- Gatsby website you want to share with the world.
- Qovery account. You can [sign up here](https://start.qovery.com).

## Deploy your application

You can set up a Gatsby site on Qovery in five quick steps:

**1/** **Install the Qovery CLI** - [how to install the Qovery CLI](https://docs.qovery.com/extending-qovery/cli)

**2/** **Sign up**

```shell
# Sign up with Github, Gitlab or Bitbucket
 qovery auth
```

**3/** **Initialize Qovery in your Gatsby project**

```shell
# generate the .qovery.yml at the root of your project directory
qovery init
```

`qovery init` is an interactive script that will help you configure your application deployment. You can read more about this process [here](https://docs.qovery.com/quickstart/getting-started#qovery-initialization).

### IMPORTANT
Qovery needs access to your repository to clone and build your application. During `qovery init` you'll be asked to grant Qovery permissions to your codebase. This is mandatory for the build and deployment process to work correctly.

**4/** **Create a Dockerfile at the root of your project using the following script:**

```Dockerfile
$ echo "FROM node:12-buster as build

RUN yarn global add gatsby-cli
WORKDIR /app
ADD . ./
RUN yarn
RUN gatsby build

FROM gatsbyjs/gatsby
COPY --from=build /app/public /pub

EXPOSE 80" >> Dockerfile
```

**4/** **Your site is being deployed**

```shell
# Git commit and push your code
 git add .qovery.yml Dockerfile
 git commit -m "add .qovery.yml and Dockerfile files"
 git push -u origin master
```

**5/** **Your site is being deployed**

You can check the status of deployment using:

```shell
qovery status
```

That's it! Your site will be live on your Qovery URL (which looks like `yoursite.qovery.io`) as soon as the build is done.

## Continuous Integration (CI) and Continuous Deployment (CD)

Now that Qovery is connected to your repository, it will **automatically build and publish your site** any time you push to your GitHub/Gitlab/Bitbucket.

You can also choose to [disable auto deploys](https://docs.qovery.com/extending-qovery/branches-and-environments#restrict-branches-deployments).

## Environments

Qovery brings the powerful [concept of environments](https://docs.qovery.com/extending-qovery/branches-and-environments) to never break the production and safely develop new features.

## Custom Domains

Add your own domains to your site easily using Qovery's [custom domains](https://docs.qovery.com/services/network/dns) guide.

## Support

Chat with Qovery developers and the #support team at [discord.qovery.com](https://discord.qovery.com) if you need help.

## References

- [Example project](https://docs.qovery.com/quickstart/examples/deploy-a-gatsby-application)
