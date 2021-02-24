---
title: Deploying to Bip
---

[Bip](https://bip.sh) is a commercial hosting service which provides zero downtime deployment, a global CDN, SSL, unlimited bandwidth and more for Gatsby websites. Plans are available on a pay as you go, per domain basis.

The following guide will show you how to deploy your Gatsby site to Bip in just a couple simple steps.

## Prerequisites

- You have a Gatsby project ready to deploy and share with the world. If you need a project, use the [Quick Start](/docs/quick-start) before continuing.
- You have the Bip CLI installed, along with a Bip account and domain ready to use. Visit the [Bip Get Started guide](https://bip.sh/getstarted) for further instructions.

## Step 1: Initial setup

You'll first need to initialize your project with Bip. This only needs to be done once.

```shell
bip init
```

Follow the prompts, where you'll be asked which domain you'd like to deploy to. Bip will detect that you're using Gatsby, and set project settings like the source file directory automatically.

## Step 2: Deploy

You're now ready to deploy your website. To do so, run:

```shell
gatsby build && bip deploy
```

That's it! After a few moments, your website will be deployed.

## References:

- [Bip Get Started Guide](https://bip.sh/getstarted)
