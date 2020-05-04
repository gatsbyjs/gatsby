---
title: Deploying to Gatsby Cloud
---

This guide will walk you through building and deploying your Gatsby site on [Gatsby Cloud](https://www.gatsbyjs.com/cloud).

## Why Use Gatsby Cloud

Gatsby Cloud is a platform of stable, trusted tools launched by the team behind Gatsby.js in late 2019 that enables web creators to build better websites. It offers unique features that remove friction in your team's workflow including:

- [**Autoprovisioning**](https://www.gatsbyjs.com/docs/autoprovisioning) that empowers new users to create projects in minutes with a Content Management System (CMS), sample content, and connected Gatsby starter.
- [**Real-time Preview**](https://www.gatsbyjs.com/docs/viewing-preview/) to simplify content creation and collaboration. Preview offers a private playground for developers, designers, marketers, and content creators by providing a shareable temporary URL for viewing changes immediately and in context. With instant updates triggered by a CMS or webhooks, it’s a shareable, hot-reloading preview.
- **Numerous CMS Integrations**, many of which are automatic
- **Builds** is the fastest continuous deployment solution for Gatsby sites and apps- up to 20x faster build times compared to other solutions. Build with Gatsby and deploy to your favorite CDN.
- **Reports** provide automated Lighthouse performance checks and deploy previews to fix errors before they’re published.

Best of all, Gatsby Cloud includes a [free tier](https://www.gatsbyjs.com/pricing/) designed to comfortably support personal and small sites.

## Integrations

Gatsby Cloud integrates with the tools you already use to build sites. By connecting your Gatsby project's Github repo, Gatsby Cloud automatically builds and deploys your site when you make changes.

### CMS Integrations

Gatsby Cloud offers integrations with a wide variety of CMSs. The below CMSs have first-class, automatic integrations with Gatsby Cloud:

- Contentful
- Cosmic JS
- Dato CMS
- Sanity.io

If you want to work with a CMS without automatic integration support you still can. There are specific documents available for the below integration points:

- Contentstack
- Drupal
- Strapi

In addition, Gatsby Cloud offers a POST endpoint for manually integrating with CMSs that support webhooks.

### Hosting Integrations

Gatsby Cloud offers automatic integration with the following hosting providers:

- Netlify
- Amazon S3
- Firebase
- Google Cloud Storage
- Fastly

Please refer to the [Gatsby Cloud Docs](https://www.gatsbyjs.com/docs/) for full details on available integrations.

## Set up a new Gatsby site from scratch

1. Head over to [Gatsby Cloud](https://www.gatsbyjs.com/get-started/) and sign-up/sign-in with your GitHub account if you haven't already.

2. Click the **Create new site** button on your [Dashboard](https://www.gatsbyjs.com/dashboard/sites).

3. Choose the **I don't have a Gatsby site yet** option.

4. On _Tab 1_ choose from the Starter options and click **Next**.

5. On _Tab 2_, enter a name for your new project and click **Next**. This will be the name of the project repo added to your GitHub account.

   > Note, you will need to set your [GitHub permissions](https://github.com/settings/installations) to enable "All Repositories" access in order to allow Gatsby Cloud to create a new repo.

6. On _Tab 3_, click **Connect** to authenticate with your chosen CMS provider.

   > If you're looking for instructions on configuring Gatsby Cloud with a specific CMS, check out the [Gatsby Cloud Docs](https://www.gatsbyjs.com/docs/).

7. Once you successfully configure your CMS, click **Start my site**, prompting Gatsby Cloud to provision your starter project.

8. On _Tab 4_ click **Finish**. On your site's dashboard page, under the _Production_ tab, you'll see an in-progress build.

   > Once the build has finished, a URL will appear for you to view the live build of your site.

9. Under the _Preview_ tab you can find your site's preview URL.

   > This preview URL will allow your team to make changes to your CMS and automatically view updates to your site in real-time without having to rebuild.

10. If a build fails, you can click **View Details** to view the warning, errors, and raw logs for the build.

## Set up an existing Gatsby site

1. Head over to [Gatsby Cloud](https://www.gatsbyjs.com/get-started/) and sign-up/sign-in with your GitHub account if you haven't already.

2. Click the **Create new site** button on your [Dashboard](https://www.gatsbyjs.com/dashboard/sites).

3. Choose the **I already have a Gatsby site** option.

4. On _Tab 1_, select your repo containing your Gatsby site from the list of options.

   > If you don't see your repo in the list, you can adjust your repository access by clicking the **Connect a new GitHub Organization** link or configuring the Gatsby Cloud app installation in your [GitHub settings](https://github.com/settings/installations).

5. With your repo selected, you can modify the _Production Branch_ and _Base Directory_ that will be used to build and deploy your site.

   > If you are setting up a monorepo, you will need to set the _Base Directory_ as the directory containing your Gatsby project. Gatsby Cloud supports `npm`, `yarn`, yarn workspaces and `lerna` with yarn workspaces or `npm`.

6. Click the **Next** button. On _Tab 2_ you can choose from the automatic integration providers to connect one or more CMSs to provide data to your Gatsby Cloud preview instance.

7. By clicking **Connect** next to any integration option, you will be prompted to authenticate with that CMS platform and choose your data source within that CMS.

   > If you're looking for instructions on configuring Gatsby Cloud with a specific CMS, check out the [Gatsby Cloud Docs](https://www.gatsbyjs.com/docs/).

   > If your CMS provider isn't listed but supports webhooks, you can attempt to manually connect to it using the Gatsby Cloud POST endpoint. This will keep your Preview automatically updated when you make changes to your CMS.

8. Once you have connected your desired integrations, click **Set up your site**. On _Tab 3_, you can configure any environment variables that you wish to set for your preview and build.

9. Click **Create site**. You will be brought to the dashboard page for your site and under the _Production_ tab you will see that your build has been triggered and is underway.

   > Once the build has finished, a URL will appear for you to view the live build of your site.

10. Under the _Preview_ tab you can find your site's preview URL.

    > This preview URL will allow your team to make changes to your CMS and automatically view updates to your site in real time without having to rebuild.

11. If a build fails, you can click **View Details** to view the warning, errors, and raw logs for the build.

## Set up hosting for your site

1. Navigate to your site in your Gatsby Cloud [Dashboard](https://www.gatsbyjs.com/dashboard/sites). Under the _Site Settings_ tab, navigate to the _Integrations_ > _Hosting_ subsection.

2. To setup an integration, click **Connect** next to the hosting provider of your choice.

3. Follow the prompts to authorize with your hosting provider.

   > The [Gatsby Cloud Docs](https://www.gatsbyjs.com/docs/) provide specific tutorials for each hosting provider.

4. At this point your hosting integration should be setup.

   > You can verify this by returning to _Site Settings_ > _Integrations_ > _Hosting_ where your new integration should show as _Connected_ in green.

5. Now when a build is triggered, your site will be deployed to your hosting target(s).

## Additional Resources

- [Gatsby Cloud Docs](https://www.gatsbyjs.com/docs/)
- [Announcing Gatsby Cloud](/blog/2019-11-14-announcing-gatsby-cloud/)
