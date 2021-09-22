---
title: Sourcing from Private APIs
---

Gatsby allows you to pull data from headless CMSs, databases, SaaS services, public API, and your private APIs.

From the Gatsby perspective, there is no difference between sourcing from a public or private API. The only difference is the availability of the API to Gatsby to query the data.

There are 3 approaches that you can use to source data from your private API:

1. If your private API is a GraphQL API, you can use [`gatsby-source-graphql`](/plugins/gatsby-source-graphql/).
2. If your private API is not a GraphQL API and you are new to GraphQL, treat the data as unstructured data and fetch it during build time, as described by the guide "[Using Gatsby without GraphQL](/docs/how-to/querying-data/using-gatsby-without-graphql/)". However, as highlighted in the guide, this approach comes with some tradeoffs.
3. Create a source plugin, as described in the tutorial "[Source plugin tutorial](/docs/how-to/plugins-and-themes/creating-a-source-plugin/)".

## Other considerations

1. If the data of your private API is updated very frequently or the expectation of the site is to be updated in real-time, it may make more sense to query the data directly during runtime.

2. If you can source the data through a plugin, consider that as an alternative to sourcing via the API. For instance, if you have access to the MongoDB database that stores the data, [`gatsby-source-mongodb`](/plugins/gatsby-source-mongodb/) will be handy. Browse the [Gatsby Plugin Library](/plugins/) to see what plugins that you could utilize.

3. Depending on your build process and the availability of your private API, you may need to make other adjustments accordingly.

   - If your private API is only available within your company network, then you would need to expose the private API to your CI server that runs the build, else you would need to run the gatsby build in your own computer.
   - You may also need to configure the endpoints of the API differently for development or production. Refer the [environment variables](/docs/how-to/local-development/environment-variables/) guide to learn how to do that.

4. To ensure your site does not show outdated data, you may want to set up an automated process to trigger the process to rebuild your site whenever the data is updated. For instance, if you host your site in Netlify, you can [make a request for its webhook to trigger a new build](https://docs.netlify.com/site-deploys/notifications/).
