---
Title: Guide on working with Etsy in Gatsby
---# Guide on working with Etsy in Gatsby

## Etsy in Gatsby

This guide will walk you through the steps needed in order to successfully work with Etsy e-commerce sites in Gatsby.

## Prerequisites

- Create a new [Etsy account](https://www.etsy.com/join) and store if you don’t have one.
- Create a private app in your store by navigating to Apps, then Manage private apps.
- Create a new private app, with any “Private app name” and leaving the default permissions as read access under Admin API.
- Enable the Etsy API by checking the box that says “Allow this app to access your storefront data using Storefront API”.
- Make sure to also grant access to read product and customer tags by checking their corresponding boxes.

## If you do not already have one ready, [create a Gatsby site](/docs/quick-start):

- From your terminal, you will want to cd or change directory into the folder where you would want your project to live.
- In your terminal put in the command `npm install -g gatsby -cli` to install the gatsby command-line interface.
- Next, you would want to create a new project using the command gatsby new [the name of your site].
- You would then want to cd into your project folder using cd [the name of your site].
- Run `gatsby develop` to view your project locally.

## [Gatsby-source-etsy ](/packages/gatsby-source-etsy/)

While in your terminal type the command `npm i gatsby-source-etsy`. You will then need to add the plugin to your gatsby-config.js file:

```jsx:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-etsy",

      options: {
        apiKey: "your api key here",

        shopId: "your shop id here",

        language: "en", // optional
      },
    },
  ],
}
```

## Etsy API

Etsy has a public API that developers can [query](/packages/gatsby-source-etsy/#example-graphql-queries) and use to update specific information from Etsy. The Etsy API provides a simple [RESTful](https://en.wikipedia.org/wiki/Representational_State_Transfer) interface with lightweight [JSON](https://en.wikipedia.org/wiki/JSON)-formatted responses to use many of Etsy's website features, including public profiles, shops, listings, tags, favorites, and sales data, using [OAuth](https://www.etsy.com/developers/documentation/getting_started/oauth) to allow both read and write access to users' public and private data. If you're a developer and want to access the Etsy API, start by [creating an Etsy account](https://help.etsy.com/hc/articles/115015568007) if you don't have one already. Once registered, you can obtain a key at the [Etsy Developer Community website](https://www.etsy.com/developers?segment=selling). After you receive an API key, we’d recommend reviewing the Etsy [documentation](https://www.etsy.com/developers/documentation) to get started.

## Opportunity for a new plugin/starter

Want to create a new Etsy starter or plugin for Gatsby? Check out our [contributing guide](/contributing/)!

## Other resources

[Gatsby Shopify Starter](/starters/AlexanderProd/gatsby-shopify-starter/)
