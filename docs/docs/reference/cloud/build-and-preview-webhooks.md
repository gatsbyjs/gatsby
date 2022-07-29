---
title: "Build and Preview Webhooks"
description: "A webhook is an action that runs when the application providing the webhook is notified. The webhook has a URL which can receive HTTP requests (usually POST). A request sent to this URL lets the application know that an event has happened and it may or may not contain a message."
---

## Using Webhooks
For every site, Gatsby Cloud provides two webhooks:

A **Build** Webhook which triggers a Production Build
and a **Preview** Webhook which triggers a CMS Preview build
These webhooks can be found by going to **Site Settings** then clicking **General > Webhook** in the sidebar menu.

![webhook settings on the dashboard](../../images/webhooks-settings.png) 

When you connect a content management system (CMS) to your site (manually or via Quick Connect), it uses these webhooks to trigger your builds.

You can use any tool (Postman, Zapier, etc.) to send a `POST` request to either of the webhooks. For example, here's the structure for a `curl` request to some site's Preview Webhook:

```
curl -X POST https://webhook.gatsbyjs.com/hooks/data_source/<site id>
```
 
## How Do You Know a Webhook Worked?
You can tell when a build is triggered via webhook by inspecting the build card. For example, a build triggered via the Build Webhook will say "Triggered by Gatsby Build Webhook."

![image of webhook build in the dashboard](../../images/webhook-image.png) 

 

However, if the build is triggered by one of the officially supported CMSs, the build card will indicate the name of the CMS that triggered it.

![webhook triggered from CMS integration](../../images/cms-webhook.png) 

 
## Specifying a Data Source
You can use the `x-gatsby-cloud-data-source` HTTP header to specify the data source you want to refresh. For example, if your source plugin is called `gatsby-source-awesome` then you want to send `"x-gatsby-cloud-data-source": "gatsby-source-awesome"` as a header value in the webhook. 

Note: The `x-gatsby-cloud-data-source` header value must include "gatsby-source" in the name for it to be considered a valid source.

 
## Clearing the Cache
If you need to trigger a cache clear before you build, you can do this by making a POST request to `https://webhook.gatsbyjs.com/hooks/builds/trigger/:siteId` with the header `x-gatsby-cache:` false will trigger a build with no cache. If you want to use this for previews, add an additional header: `x-runner-type: PREVIEW`
Using curl, the request would look like this for clearing cache on a build: 

``` 
>curl -X POST https://webhook.gatsbyjs.com/hooks/builds/trigger/<site id> --header "x-gatsby-cache: false"
```