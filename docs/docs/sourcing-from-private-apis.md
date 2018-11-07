---
title: Sourcing from Private APIs
---

Gatsby allows you to pull data from headless CMSs, databases, SaaS services, public API, and your private APIs.

From Gatsby perspective, there is no difference between sourcing from a public or private API. The only difference is the availability of the API to Gatsby to query the data and there is probably no plugin that you can use to extract your data.

There are 2 approches that you can use to source your data from your private API:

1. treat the data as unstructured data and fetch it during build time, as described by the guide "[Using unstructured data](/docs/using-unstructured-data/)". As highlighted in the guide, this approach is more straightforward and simpler, but with its tradeoffs.
2. create your source-plugin, as described in the tutorial "[Source plugin tutorial](/docs/source-plugin-tutorial/)".

### Other considerations

1. It may makes more sense to query the data directly during runtime if the data of your private API updated very frequently or the expectation of the site is to be updated in real-time.

2. If your private API is just a thin layer on top of MongoDB and you have access to the mongoDB directly, consider using [`gatsby-source-mongodb`](/https://www.gatsbyjs.org/packages/gatsby-source-mongodb/).

3. Depending on your build process and availability of your private API, you may need to configure your `gatsby-config.js` accordingly.

   - If your private API is only available within your company network, then you would need to expose the private API to your CI server that runs the build, else you would need to run the gatsby build in your own computer.
   - You may also need to configure the endpoints of the API differently for development or production. Refer the [environment variables](/docs/environment-variables/) guide to learn how to do that.

4. To ensure your site does not show outdated data, you may need to setup some automated process to trigger the process to rebuild your site whenever the data is updated. For instance, if you host your site in Netlify, you can [make a request to its webhook to trigger a new build](https://www.netlify.com/docs/webhooks/).
