---
title: "Create a Site from a Template"
description: "How to create a Gatsby Cloud site from a template"
---

## Introduction

There are two workflows for adding a new Gatsby Cloud site:

1. Cloning a Starter from Gatsby's [Starter Library](https://www.gatsbyjs.com/starters/).
2. Importing from a Git Repository.

This guide covers the "Clone a Starter" flow. Note, cloning of starters is only supported for GitHub. If you use GitLab or BitBucket, you'll have to follow the [Create a Site from a Repository](/docs/how-to/cloud/create-site-from-repository/) guide instead.

### 1. Choose your starter template

From your Gatsby Cloud Dashboard, click the **Add a Site** button.

![Add a site](../../images/add-site.png)

On the right hand side, click on the card labeled "Gatsby Default Starter".

![Default Starter](../../images/default-starter.png)

### 2. Configure your repository

The first time you set up a Gatsby Cloud site, you will need to connect your Gatsby account to GitHub by clicking on the "GitHub" icon in the Create a Git repository card.

![Create a Git Repository](../../images/create-git-repo.png)

Next, a pop up window should appear and prompt you to install the Gatsby Cloud app to your GitHub personal account. Click **Install**.

![Install Gatsby Cloud App](../../images/install-gatsby-cloud-app.png)

After the GitHub app is installed, you will return to Gatsby Cloud. Here you can select a different GitHub organization to host the repository under as well as change the name of the repository that will be created if you prefer. Then click **Next** to create the site.

![Configure Git Repository](../../images/configure-repository.png)

### 3. Connect integrations

Next, you'll be prompted to connect any Integrations. Here is where you can connect your Gatsby Cloud site to your CMS instance. For the purposes of this tutorial, you can select **Skip this step**.

![Connect Integrations](../../images/connect-integrations.png)

### 4. Set-up summary

After the repository is created, you'll be given the option to configure any necessary environment variables. This step allows you to add both build and preview variables to your site.

![Setup Summary](../../images/setup-summary.png)

Next, click **Create Site** and you will be taken to the main tab of Site Overview page for your new site.

![Site Overview](../../images/site-overview.png)

### 5. Finish

Once your site is done building, you can view the site in two places:

#### Private build uRL

Use the build URL to preview the deployed site. This URL is not indexed and is only accessible via direct link.

![Private Build URL Link](../../images/private-build-link.png)

#### Public default domain

Use your Gatsby Hosting provided "default domain" to access the public deployment of your site. Gatsby Hosting is turned on by default and the default domain is listed under Site Settings > Hosting.

![Default Domain URL link](../../images/default-domain-link.png)
