---
title: Sourcing from Etsy
---

[Etsy](https://www.etsy.com/) is an online marketplace for buying and selling handmade, vintage, and custom items. It's long been a home for creative entrepreneurs and can be used as a data source for your Gatsby site.

## Prerequisites

This guide assumes you already have a functioning Gatsby site as well as an open Etsy shop. You can start a new Gatsby site in a few steps with the [Quick Start guide](/docs/quick-start) and then [start selling on Etsy](https://www.etsy.com/your/shop/create)!

## Getting an API key

You'll need to make sure you have two-factor authentication enabled for your Etsy account. If you don't already have it, you'll be prompted when you go to [register a new application](https://www.etsy.com/developers/register). Fill in the required information as completely as you can, read Etsy's terms and conditions, and create your app.

Note that Etsy expects developers to test the API using real data. That means your shop and listings will be live even as you're working on this site. If you're already an active Etsy seller, this shouldn't change your usual workflow much. If you're starting a new shop, be mindful of [Etsy's testing policies](https://www.etsy.com/developers/documentation/getting_started/testing#section_etsy_api_testing_policies) as you test your work.

## Using the Etsy source plugin

You can use the [`gatsby-source-etsy`](/plugins/gatsby-source-etsy/) plugin to pull featured listings and images from your Etsy shop into your Gatsby site. To install it, run:

```shell
npm install gatsby-source-etsy
```

### Configuring the plugin

You will then need to add the plugin, your API key, and your shop ID to your `gatsby-config.js` file. That said, finding your shop ID can be confusing. While your shop does have an ID _number_, you don't actually need this to make requests against the Etsy API. You can use your shop's _name_ as a unique identifier if you don't know your shop ID.

```js:title=gatsby-config.js
plugins: [
  {
    resolve: "gatsby-source-etsy",
    options: {
      // highlight-start
      api_key: "your api key here",
      shop_id: "your shop id or shop name here",
      // highlight-end
      language: "en", // optional
    },
  },
],
```

### Testing your queries

Once you have everything set up, run `gatsby develop` to start your site locally. At that point, you should be able to query for data related to your featured listings in [GraphiQL](/docs/how-to/querying-data/running-queries-with-graphiql/). As an example, the following query gets the total number of featured listings in the shop as well as the price, title, and description of each item.

```graphql
allFeaturedEtsyListing {
  totalCount
    nodes {
      price
      title
      description
    }
  }
```

Make sure you have _featured_ items! To edit your store, go to the Shop Manager and select your Etsy shop under "Sales Channels". You should see an option to edit or enable featured items.

## Displaying Etsy listings

You can pull your Etsy listing data into a page or component by composing a GraphQL query and specifying the data you would like to display. For example, consider the following query, which gets the title, price, URL, and an image of each featured listing.

```graphql
allFeaturedEtsyListing {
  nodes {
    id
    title
    price
    url
    description
    childEtsyListingImage {
      childFile {
        childImageSharp {
          fixed(width: 400, height: 400) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  }
}
```

Using this query on a page or in a component will allow you to display your listings. The following example loops through the featured items and displays them within a component.

```jsx
{
  data.allFeaturedEtsyListing.nodes.map(item => (
    <section key={item.id}>
      <a href={item.url}>
        <h2>{item.title}</h2>
      </a>
      <Img fixed={item.childEtsyListingImage.childFile.childImageSharp.fixed} />
      <p>${item.price}</p>
      <p>{item.description}</p>
    </section>
  ))
}
```

Note that, in this example, there is no alt text passed to the `Img` component because this image can be considered presentational. All images appear in association with their title and description. Therefore, including the same information as alt text would be repetitive for anyone using a screen reader.

## Gatsby advantages

If you are familiar with Etsy, you are aware of the restrictions around branding within the platform. Shops have an extremely similar look, which limits the creativity any individual shop owner can display. In addition, you have no control over Etsy's policies.

However, there are great benefits to selling on Etsy. What you lose in individuality you gain in discoverability. Etsy's advertising budget is enormous compared to what a shop owner, operating alone, could afford. You benefit from the trust Etsy has built up over the years. Because people are familiar with Etsy, they'll often go straight there to purchase their handmade or vintage items.

Building your own site with Gatsby allows you to have the best of both worlds. You can take control over your customers' experience and drive traffic to your own blazing fast website. You're also able to avoid links to others' listings competing for your customers' attention. At the same time, you maintain all the benefits of having your products listed on Etsy.

## Other resources

- [`gatsby-source-etsy`](/plugins/gatsby-source-etsy/)
- Etsy's [API documentation](https://www.etsy.com/developers/documentation/)
