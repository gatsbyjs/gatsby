---
title: Deploying to KintoHub
---

[KintoHub](https://www.kintohub.com) is a next-gen cloud package manager. Making it easy to host and manage websites, backend APIs, cron jobs, databases and more in a production grade fashion for all your apps.

KintoHub has a free tier that you can use to deploy your static sites. Here are some features that come with it:

- **CICD from GitHub** - You can build different branches and tag them to make sure the websites you deploy into staging and production environments are the same.
- Automatic **[Let's Encrypt](https://letsencrypt.org) certificates.**
- **Teams** - invite your collaborators on your workspace to work with you.
- Setup **custom domain names** with automatic Let's Encrypt certificates.
- Multiple **environments** (development, staging, production).
- **Password Protection**.

## Prerequisites

This guide assumes you already have a Gatsby project to deploy. If you need a project, you can use the [Quick Start](/docs/quick-start) or KintoHub's template [Gatsby Template](https://github.com/kintohub/gatsby-example) before continuing.

## Setup

In order to deploy a Gatsby site on KintoHub, you will need to create and deploy a **KintoBlock** into an **Environment** (development, staging, production).

_Note: A **KintoBlock** is connected to a Github repository. Accessing the kintoblock page will allow you to build, manage or tags any branches of your repository._

### Create a KintoBlock

1. Register on [KintoHub](https://beta.kintohub.com).
2. Create a new **KintoBlock** of type **Website** and give KintoHub permission to access your GitHub repo.
3. Select your Github repo from the list and press **Continue**.
4. Choose **Static from Build** with the following values:

   |                         |                                                            |
   | ----------------------- | ---------------------------------------------------------- |
   | **Name**                | `Gatsby Website` (or your own name)                        |
   | **Language**            | `Node.js`                                                  |
   | **Version**             | `latest` (or your own node.js version)                     |
   | **Build Command**       | `npm install && npm run build` (or your own build command) |
   | **Build Output Folder** | `public` (or your own output directory)                    |

5. Press **Create Website**.

The build will automatically start on the default Github branch of your repository.
Wait for your build to be successful (green).

#### Multiple Branches

When you create a new **KintoBlock**, KintoHub imports all your branches and you can access them from your kintoblock page (new branches will also be automatically picked up).
You can switch from one branch to another by pressing the branch name on the side panel on the left.

#### Continuous Integration

By default, KintoHub will build all the changes you push on your default branch.
If you want to disable it:

1. Disable the toggle **Build New Commits**.
2. Press **Save Changes**.

Your new changes will not be automatically picked up anymore and you will have to press **Build Latest Commit** to trigger a build.

### Deploy your KintoBlock

From your KintoBlock page, you will need to deploy your website first before accessing it.

1. Press **Deploy Now** and then **New Project**.
2. You can change the default values (optional).
3. Press **Create New Project**.

The deployment will start.
Wait for it to be successful (green).

_Note: you can disable Continuous Deployments for future builds._

### Access your KintoBlock

From your Project page.

1. Scroll down to the **Added KintoBlocks** list.
2. Press **Open** on your kintoblock (`Gatsby Website`).

And that's it!

## Deployment Configuration

You can configure additional features directly from your Project page.
If you're not already there, select **Projects** on the left-hand navigation bar, and then click on the project you want to configure.

### Basic Auth

1. Scroll down to the **Added KintoBlocks** list.
2. Click on the cog next to your kintoblock (`Gatsby Website`).
3. Enable **Password Protected**.
4. Enter **Username** and **Password**.
5. Press **Done Configuring** and then **Deploy**.
6. You'll see a **Compare Versions** screen. Click **Confirm Deployment**.

Wait for the deployment to be successful.
Refresh the page, your website is now protected.

### Custom domain

1. Scroll down to the **Added KintoBlocks** list.
2. Click on the cog next to your kintoblock (`Gatsby Website`).
3. Under **Custom Domain**, enter your custom domain name.
4. Follow the instructions under _Setup_.
5. Press **Done Configuring** and then **Deploy**.
6. You'll see a **Compare Versions** screen. Click **Confirm Deployment**.

Wait for the deployment to be successful.
Access your new custom domain.

## Support

Chat with KintoHub developers on [Discord](https://discordapp.com/invite/QVgqWuw) or email `ben@kintohub.com`.
