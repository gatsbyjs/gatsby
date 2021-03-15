---
title: Deploying to Qovery
---

[Qovery](https://qovery) is a fully-managed cloud platform that runs on your AWS account where you can host static sites, backend APIs, databases, cron jobs, and all your other apps in one place.

Static sites are **completely free** on Qovery and include the following features:

- Continuous, automatic builds & deploys from GitHub, Bitbucket, and GitLab.
- Automatic SSL certificates through [Let's Encrypt](https://letsencrypt.org).
- Free managed PostgreSQL.
- Unlimited collaborators.
- Unlimited [custom domains](https://docs.qovery.com/guides/getting-started/setting-custom-domain/).
- Automatic HTTP → HTTPS redirects.

## Prerequisites

This guide assumes you already have a Gatsby project to deploy. If you need a project, use the [Quick Start](/docs/quick-start) to get started.

## Setup

Follow the procedure below to set up a Gatsby on Qovery:

### 1. Create a Qovery account.

Visit the [Qovery dashboard](https://console.qovery.com) to create an account if you don't already have one.

### 2. Create a project

Click on the create a project button and give a name to your project.

Click on next.

### 3. Add your Gatsby site

Click on the create an application button and select your Github or Gitlab repository where your Gatsby site is located.

Click on next.

### 4. Add a PostgreSQL database

Click on add a PostgreSQL database.

Select the version.

Give a name to your PostgreSQL databse.

Click on next.

### 5. Add a storage

Click on add a Storage.

Give a name to your storage.

Select the storage type between Slow HDD, HDD, SSD, and Fast SSD. (SSD is recommended).

Select the size.

Give a mount point.

### Deploy

Click on the Deploy button. Your app should be deployed: you can see the status in real time by clicking on Deployment logs.

## Continuous deploys

Now that Qovery is connected to your repo, it will **automatically build and publish your site** any time you push to GitHub.

## Custom domains

Add your own domains to your site easily using Qovery's [custom domains](https://docs.qovery.com/guides/getting-started/setting-custom-domain/) guide.

## Support

Chat with Qovery developers on [Discord](https://discord.qovery.com) if you need help.
