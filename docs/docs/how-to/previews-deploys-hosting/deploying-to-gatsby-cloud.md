---
title: Deploying to Gatsby Cloud
---

This guide will walk you through building and deploying your Gatsby site on [Gatsby Cloud](/cloud).

## Why Use Gatsby Cloud

Gatsby Cloud is a platform of stable, trusted tools launched by the team behind Gatsby in late 2019 that enables web creators to build better websites. It offers unique features that remove friction in your team's workflow including:

- [**Quick Connect**](https://support.gatsbyjs.com/hc/en-us/articles/360061317133-Quick-Connect) that empowers new users to create projects in minutes with a Content Management System (CMS), sample content, and connected Gatsby starter.
- [**Real-time Preview**](https://support.gatsbyjs.com/hc/en-us/articles/360055676874-CMS-Previews) to simplify content creation and collaboration. Preview offers a private playground for developers, designers, marketers, and content creators by providing a shareable temporary URL for viewing changes immediately and in context. With instant updates triggered by a CMS or webhooks, it’s a shareable, hot-reloading preview.
- **Numerous CMS Integrations**, many of which are automatic
- **Builds** is the fastest continuous deployment solution for Gatsby sites and apps- up to 20x faster build times compared to other solutions. Build with Gatsby and deploy to your favorite CDN.
- **Hosting** allows you to easily host your site and connect a domain with a free TLS certificate.
- **Reports** provide automated Lighthouse performance checks and deploy previews to fix errors before they’re published.

Best of all, Gatsby Cloud includes a [free tier](/pricing/) designed to comfortably support personal and small sites.

## Integrations

Gatsby Cloud integrates with the tools you already use to build sites. By connecting your Gatsby project's GitHub repo, Gatsby Cloud automatically builds and deploys your site when you make changes.

### CMS Integrations

Gatsby Cloud offers integrations with a wide variety of CMSs. The below CMSs have first-class, automatic integrations with Gatsby Cloud:

- Contentful
- Cosmic
- Dato CMS
- Sanity.io

If you want to work with a CMS without automatic integration support you still can. There are specific documents available for the below integration points:

- Contentstack
- Drupal
- Strapi

In addition, Gatsby Cloud offers a `POST` endpoint for manually integrating with CMSs that support webhooks.

### Hosting Integrations

While Gatsby Cloud offers hosting, you can also configure automatic integration with the following 3rd party hosting providers:

- Netlify
- Amazon S3
- Firebase
- Google Cloud Storage
- Fastly

Please refer to the [Gatsby Cloud Docs](https://support.gatsbyjs.com/hc/en-us/articles/360058357013-What-hosting-providers-are-supported-) for full details on available integrations.

## Set up a new Gatsby site from scratch

1. Head over to [Gatsby Cloud](/dashboard/signup/) and sign-up/sign-in with your GitHub account if you haven't already.

2. Click the **Create new site** button on your [Dashboard](https://www.gatsbyjs.com/dashboard/sites).

3. Choose the **I don't have a Gatsby site yet** option.

4. On _Tab 1_ choose from the Starter options and click **Next**.

5. On _Tab 2_, enter a name for your new project and click **Next**. This will be the name of the project repo added to your GitHub account.

   > Note, you will need to set your [GitHub permissions](https://github.com/settings/installations) to enable "All Repositories" access in order to allow Gatsby Cloud to create a new repo.

6. On _Tab 3_, click **Connect** to authenticate with your chosen CMS provider.

   > If you're looking for instructions on configuring Gatsby Cloud with a specific CMS, check out the [Gatsby Cloud Docs](https://support.gatsbyjs.com/hc/en-us/sections/360011112314-Connecting-to-a-Content-Management-System).

7. Once you successfully configure your CMS, click **Start my site**, prompting Gatsby Cloud to provision your starter project.

8. On _Tab 4_ click **Finish**. On your site's dashboard page, under the _Production_ tab, you'll see an in-progress build.

   > Once the build has finished, a URL will appear for you to view the live build of your site.

9. Under the _Preview_ tab you can find your site's preview URL.

   > This preview URL will allow your team to make changes to your CMS and automatically view updates to your site in real-time without having to rebuild.

10. If a build fails, you can click **View Details** to view the warning, errors, and raw logs for the build.

## Set up an existing Gatsby site

1. Head over to [Gatsby Cloud](/dashboard/signup/) and sign-up/sign-in with your GitHub account if you haven't already.

2. Click the **Create new site** button on your [Dashboard](https://www.gatsbyjs.com/dashboard/sites).

3. Choose the **I already have a Gatsby site** option.

4. On _Tab 1_, select your repo containing your Gatsby site from the list of options.

   > If you don't see your repo in the list, you can adjust your repository access by clicking the **Connect a new GitHub Organization** link or configuring the Gatsby Cloud app installation in your [GitHub settings](https://github.com/settings/installations).

5. With your repo selected, you can modify the _Production Branch_ and _Base Directory_ that will be used to build and deploy your site.

   > If you are setting up a monorepo, you will need to set the _Base Directory_ as the directory containing your Gatsby project. Gatsby Cloud supports `npm`, `yarn`, yarn workspaces and `lerna` with yarn workspaces or `npm`.

6. Click the **Next** button. On _Tab 2_ you can choose from the automatic integration providers to connect one or more CMSs to provide data to your Gatsby Cloud preview instance.

7. By clicking **Connect** next to any integration option, you will be prompted to authenticate with that CMS platform and choose your data source within that CMS.

   > If you're looking for instructions on configuring Gatsby Cloud with a specific CMS, check out the [Gatsby Cloud Docs](https://support.gatsbyjs.com/hc/en-us/sections/360011112314-Connecting-to-a-Content-Management-System).

   > If your CMS provider isn't listed but supports webhooks, you can attempt to manually connect to it using the Gatsby Cloud POST endpoint. This will keep your Preview automatically updated when you make changes to your CMS.

8. Once you have connected your desired integrations, click **Set up your site**. On _Tab 3_, you can configure any environment variables that you wish to set for your preview and build.

9. Click **Create site**. You will be brought to the dashboard page for your site and under the _Production_ tab you will see that your build has been triggered and is underway.

   > Once the build has finished, a URL will appear for you to view the live build of your site.

10. Under the _Preview_ tab you can find your site's preview URL.

    > This preview URL will allow your team to make changes to your CMS and automatically view updates to your site in real time without having to rebuild.

11. If a build fails, you can click **View Details** to view the warning, errors, and raw logs for the build.

## Set up Hosting for your site

1. Navigate to your site in your Gatsby Cloud [Dashboard](https://www.gatsbyjs.com/dashboard/sites). Under the _Site Settings_ tab, navigate to the _Hosting_ subsection.

2. If your site has built, you can click on the url for `YOUR-SITE-NAME.gatsbyjs.io` to see it live!

3. You can also connect a custom domain by clicking the "Add Domain" button and following instructions there to set up your DNS records.

   > The [Gatsby Cloud Docs](https://support.gatsbyjs.com/hc/en-us/sections/360012243573-Deploying-to-a-Hosting-Service) provide specific instructions on how to connect your domain and add DNS records.

4. Once the TLS certificate for your site has been generated, you will be able to see you site live on your own domain!

5. Now when a production build is triggered, your site will be deployed to your domains.

## Additional Resources

- [Gatsby Cloud Docs](https://support.gatsbyjs.com/hc/en-us/)
- [Announcing Gatsby Cloud](/blog/2019-11-14-announcing-gatsby-cloud/)
