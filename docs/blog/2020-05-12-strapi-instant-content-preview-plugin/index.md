---
title: "Instant Content: Strapi CMS + Gatsby for Fast and Friendly Editing"
date: 2020-05-12
author: Maxime Castres
excerpt: "Strapi, the open source headless CMS that developers love, now has a new Gatsby source plugin to help developers and content creators gain velocity in two different ways. Gatsby Preview now seamlessly integrates with Strapi for full hot-loading visibility so you can edit your site fast. Then Gatsby Incremental Builds means getting your changes live faster than ever before -- ten seconds or less!"
tags:
  - case-studies
  - performance
  - building-sites-faster
  - strapi
  - gatsby-preview
---

![](./gatsby_strapi.jpg "Gatsby and Strapi logos")

Strapi is the #1 open source headless CMS frontend developers all over the world love. You can easily and quickly manage your content through an API and it's made entirely with Node & React. Gatsby developers will feel right at home in a Javascript environment that they know like the back of their hand.

A lot of developers in the community are already familiar with setting up Gatsby with Strapi, and happy with how easy it is to combine the two. People really appreciate how [the Gatsby source plugin](/packages/gatsby-source-strapi/) works great for easily and seamlessly pulling any Strapi content into any Gatsby application.

However, with the arrival of [Gatsby Preview](https://www.gatsbyjs.com/preview/), things got even better between Strapi and Gatsby!

Gatsby Preview gives you a live URL where you can see changes made in a CMS before publishing -- sort of like “hot reloading” but for content editing! To take maximum advantage of Preview, then, we shipped a new version of our original using [Strapi Webhooks](https://strapi.io/blog/webhooks) to instantly rebuild Gatsby applications on Gatsby Cloud as content changes. No manual rebuilds -- create, update or delete content and then instantly see what it really looks like to end users.

We built a [Gatsby Blog starter](https://github.com/strapi/strapi-starter-gatsby-blog) for you to quickly visualize the association between Strapi and Gatsby! Here's how to set it up.

To get started with minimal configurations, the very first step is to fork the [Strapi Starter for Gatsby repository](https://github.com/strapi/strapi-starter-gatsby-blog)

## Stage One: Strapi deployment

1. We are going to deploy a Strapi instance on Heroku, so you will need to create an account if you don't already have one. Here's what you'll need:

- [A free Heroku account](https://signup.heroku.com/)
- [A free Cloudinary account to save images](https://cloudinary.com/users/register/free)

2. Once you have created the two accounts you can deploy your instance by clicking this button:

[![Deploy to Heroku button](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/strapi/strapi-starter-gatsby-blog "clickable button for deploying to Heroku")

3. Heroku will automatically deploy the `backend` Strapi server from the Starter.

_Note: You'll be asked to fill in your Cloudinary tokens during the deployment, you'll find them in your Cloudinary dashboard._

4. Your instance should be deployed in just a few minutes. You'll then need to create an admin user to access your Strapi admin panel. Existing content-types such as articles and categories filled with data should already be there.

Now it's time to deploy your Gatsby app!

## Stage Two: Gatsby deployment

1. Point your browser to [Gatsby Cloud](https://www.gatsbyjs.com/dashboard/sites/create) and connect your instance by choosing the option `I already have a Gatsby site`

![https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/create-a-new-site.png](https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/create-a-new-site.png "Gatsby Cloud landing page with selected option")

(Deploying your Gatsby site on Gatsby Cloud means builds are now faster than ever, thanks to Gatsby's brand new [Incremental Builds feature](/blog/2020-04-22-announcing-incremental-builds/) for data changes!

2. When asked to select the repository you want to use:

- Select the new forked Strapi Starter Gatsby Blog repository and specify the Gatsby project folder, ie `frontend` in the starter.

![https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/repository.png](https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/repository.png "Strapi starter for Gatsby blog repository screen shot")

3. You can copy the Webhook url to skip this step.

![https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/skip.png](https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/skip.png "screen shot of sample cut and paste webhook url")

4. Paste your Strapi `API_URL` for both of your Builds Environment variables and Preview Environment variables. That usually means pasting the url of your Strapi instances deployed on Heroku (eg: `https://your-app.herokuapp.com`)

_Note: Be sure to paste your Heroku url without the trailing slash (eg: `https://your-app.herokuapp.com` and not `https://your-app.herokuapp.com/`)._

![https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/env.png](https://raw.githubusercontent.com/strapi/strapi-starter-gatsby-blog/master/medias/env.png "screen shot of environment variables form")

5. Now you'll need to create a Webhook on your Strapi instance in order to tell Gatsby Cloud to build your Gatsby project every time you create/update/delete content.

- Open your Strapi admin panel and go to Settings.

  ![https://www.gatsbyjs.com/static/da5810d7276c731b836cee44d97e0187/21b4d/strapi-global-settings.png](https://www.gatsbyjs.com/static/da5810d7276c731b836cee44d97e0187/21b4d/strapi-global-settings.png "screen shot of Strapi admin panel")

- Create a new Webhook with the following properties:
  - **Name**: `Gatsby Cloud Preview`
  - **Url**: The first Webhook Url Gatsby Cloud provides in your Gatsby Dashboard Sites. It should be something like this: `https://webhook.gatsbyjs.com/hooks/data_source/...` just without `/publish/`
  - Check all Events for `Entry` and `Media`

![https://www.gatsbyjs.com/static/6120945fd467a5052994cbef6734f19c/b0de5/strapi-webhook-example.png](https://www.gatsbyjs.com/static/6120945fd467a5052994cbef6734f19c/b0de5/strapi-webhook-example.png "screen shot of Strapi webhook interface")

## Stage Three: Go create stuff

That's it! If everything is working correctly, Strapi will now inform Gatsby Cloud to build your Gatsby project every time you create/update/delete content in less than 5 seconds after applying modifications. If you're having trouble, visit https://strapi.io/support for further information and assistance.

<CloudCallout>
  Sites built with Gatsby are fast no matter where they run. But when a Gatsby
  site runs on Gatsby Cloud, its builds get even faster!
</CloudCallout>
