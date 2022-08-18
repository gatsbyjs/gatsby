---
title: "Create a Site from a Repository"
description: "How to create a Gatsby Cloud site from a repository"
---

## Introduction

There are two workflows for adding a new Gatsby Cloud site:

- Cloning a Starter.
- Importing from a Git Repository.

You'll learn how to import a site from a Git repository.

### 1. Prepare a repository

You can use the [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) as a starting point. Since this is a [Gatsby starter](https://www.gatsbyjs.com/starters/?v=2), you can use Gatsby CLI to prepare this project on your machine.

```shell
gatsby new my-gatsby-project https://github.com/gatsbyjs/gatsby-starter-blog
```

Alternatively, you can clone the repository using Git.

```shell
git clone https://github.com/gatsbyjs/gatsby-starter-blog
```

After you have the project, push it to your remote GitHub repository.

### 2. Select a git provider

From your Gatsby Cloud Dashboard, click the **Add a Site** button.

![Add a Site](../../images//add-site.png)

In the "Import from a Git repository" section, choose your Git provider and install the Gatsby Cloud app. For the sake of this article you'll use GitHub, however GitLab and Bitbucket are also supported.

![Import from a Repository](../../images/import-from-repo.png)

### 3. Specify repository details

Once connected to your Git provider, find the repository you would like to add to Gatsby Cloud and click **Import**. You can then provide the details for your site:

1. The site name (defaults to `<repo name>-<branch name>`).
2. The branch to import from and set as your "production" branch in Gatsby Cloud (in this case, the `main` branch).
3. The base directory, i.e., the directory containing the Gatsby site (the root directory, `/`, is default).

![Basic site configuration](../../images/basic-configuration.png)

After you enter the site details, click **Next**.

### 4. Add optional integrations

Next you will be prompted to connect an optional content management system (CMS) to your site. This step will vary depending on the CMS provider, so there are [separate tutorials](https://support.gatsbyjs.com/hc/en-us/articles/1500000746742) for each supported CMS. However, for this specific example, you can scroll past this card to continue on.

![No Supported Integrations Found](../../images/no-integrations.png)

### 5. Configure environment variables

Now, you will be asked to [set up environment variables](../../reference/cloud/managing-environment-variables) for your site. The "Default" starter does not use any environment variables so you will skip this step as well. Click **Build Site** to continue.

![No Environment Variables](../../images/no-environment-variables.png)

### 6. Finish

Once your site is done building, you can view the site in two places:

#### Private build URL

Use the build URL to preview the deployed site. This URL is not indexed and is only accessible via direct link.

![Private Build URL link](../../images/private-build-link.png)

#### Public default domain

Use your Gatsby Hosting provided default domain to access the public deployment of your site. Gatsby Hosting is turned on by default and the default domain is listed under Site Settings > Hosting.

![Default Domain](../../images/default-domain.png)

### Troubleshooting

When creating a site from a Github repository, you'll be asked to authenticate with Github. In instances where you're having trouble authenticating and importing your site:

1. Log out and log back in. If you are still aren't able to import the site, your Github repository is part of a Github organization, and you are not an owner of that organization, then you may not have sufficient permission to install the Gatsby Cloud app to Github.
2. When you try to import your repository to Gatsby Cloud, an email is sent to the owner(s) of that organization to authorize Gatsby Cloud. Once they authorize via the link in that email, then you will be able to import your repository into Gatsby Cloud.
