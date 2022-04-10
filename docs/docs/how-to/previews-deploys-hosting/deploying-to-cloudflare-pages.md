---
title: Deploying to Cloudflare Pages
---

In this guide you'll walk through how to deploy your Gatsby site to [Cloudflare Pages](https://pages.cloudflare.com/).

**Cloudflare** is a **global network** designed to make everything you _connect to the Internet secure, private, fast, and reliable_.

**Cloudflare Pages** is a JAMstack platform for frontend developers to collaborate and deploy websites. Sign Up. Read docs. Developer-focused with effortless Git integration. Advanced collaboration built-in with unlimited seats.


## Pre-requisites

1. **[Get an Cloudflare Account](https://dash.cloudflare.com/sign-up)**

2. Have an Gatsby site in a **[GitHub Repo](https://github.com/new/)**.

<ins>**Quick note:**</ins> _This guide assumes you had installed **Gatsby** and you have a **Gatsby** site_. **_If you don't have Gatsby installed, [click here](https://www.gatsbyjs.com/docs/tutorial/part-0/#installation-guide) for a guide on installing Gatsby..._**

## Deploying

To start, login into your [**Cloudflare Dashboard**](https://dash.cloudflare.com/) > **Account Home** (_Login if needed_) > **Pages** > **Create a project**.

_When you click **Create a project**, you will see a page telling you either to choose **GitLab** or **GitHub**_.


In this guide, we will use **GitHub**, so we will click it. In this case, we will install **Cloudflare Pages** on one repository, if you prefer all repositories, it's also **OK**.

Next step, _click **Install & Authorize**_


Now, _select the GitHub account where the repo is located and select which repo is your **Gatsby** site!_

Once you choosed your repo and clicked **Begin**, provide the following information in the table:

| | **Configuration Option** | **Value** | |
|:----|:----|:----|:----|
| | _Production branch_ | `main` | |
| | _Build command_ | `gatsby build` | |
| | Build directory	| `public` | |

Once you configure the options, _you are able to start your first deploy!_ Before deployment, **Cloudflare Pages** is going to:

1. _**Install** **`gatsby`**_

2. _**Install** dependencies_

3. _**Build** your site_

## After deployment

When deployment has been **done**, you will receive a _unique sub-domain made for you_ on `*.pages.dev`, the `*` can be anything, like a random word.

<ins>**Quick Note:**</ins> _Every time you commit to your **Gatsby** site on **GitHub**, **Cloudflare Pages** will rebuild your project, and also, deploy it automatically!_

## Other recourses

- [Deploy a Gatsby site](https://developers.cloudflare.com/pages/framework-guides/deploy-a-gatsby-site/)
- [Deploy to Cloudflare Workers](https://www.gatsbyjs.com/docs/deploying-to-cloudflare-workers/)
- [Cloudflare Developers Docs](https://developers.cloudflare.com/)
- [Cloudflare Docs Engine](https://github.com/cloudflare/cloudflare-docs-engine)
