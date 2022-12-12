---
title: Using Gatsby For E-commerce
---

Businesses selling products online typically need a variety of software to support their experience. At a minimum, their website needs product pages, product catalog navigation, a shopping cart, and checkout.

Most have additional functionality like customer account creation, promotions, discounts, and loyalty, customer reviews, tax calculation, user tracking via analytics, and content personalization.

The website functions because these front-end capabilities integrate with a wide swath of software on the backend, such as inventory management, order fulfillment, accounting and business analytics, and customer engagement via email.

### Choosing a main e-commerce platform

Most businesses choose a central e-commerce platform as their source of truth for these functionalities. Some businesses choose to run entirely on these platforms, which can be quicker to get started with but lock you in to their choices for website creation (e.g. Liquid Templates for Shopify).

If you're using or considering Gatsby, your organization is likely optimizing for specific properties of your website (such as performance, development environment, design, user experience, and security) and are therefore considering a "JAMstack", "decoupled" or "content mesh" architecture.

In this case, your options are likely between a technologically forward e-commerce vendor with headless capabilities, such as Shopify or BigCommerce, or a new, specialized JAMStack e-commerce vendor, like Elastic Path, Snipcart, Nacelle, or CommerceLayer. All of these have out-of-the box Gatsby integrations.

### Choosing additional content systems

Once an organization selects a main e-commerce platform, it may also want or need other content stores that will get pulled into the website. They might choose a CMS like Contentful for complex content modelling, or WordPress for blog content authoring. They might choose Yotpo for customer reviews or Salsify for product information management.

### Why organizations build e-commerce sites with Gatsby

Organizations looking for a JAMStack e-commerce site that go with Gatsby typically do so for a combination of three reasons: they want to embrace a modern development framework (React), they want to optimize performance, and they want a web framework that’s already integrated with the systems they’re using (via Gatsby’s plugin system and pre-built integrations).

From a conversion perspective, Gatsby’s lightning-fast performance is a huge win: Gatsby automates code splitting, image optimization, inlining critical styles, lazy-loading, prefetching resources, and more to ensure your site is fully optimized.

And with Gatsby’s pre-built integrations, it can pull data in from all of these sources (Shopify, plus WordPress, Contentful, Yotpo, etc) and make it available for the React components.

### Specific e-commerce development considerations

E-commerce tends to have a number of specific requirements. When building a Gatsby site (or other decoupled/JAMStack site, for that matter) sourced from an ecommerce backend like Shopify, developers will typically have to think through a few additional touchpoints between the systems:

- **Persisting a cart across site pages and between sessions** (ie, if the user closes their browser and reopens it tomorrow, the items should still be there). This can be handled either through local-storage or through the shopify-buy JS library.
- **Product search** can be done client-side if the SKU count is small enough to store all products in a global state. Alternatively, it can be handled through the e-commerce provider’s search features, or if those aren’t robust enough, a third-party search provider like Algolia.
- **Surfacing price adjustments** like tax, shipping, discounts/promos to the user while browsing the site. Different e-commerce solutions provide different levels of API access to these objects.
- **Handling checkout.** In order to comply with PCI regulations around storing credit card information, e-commerce providers typically exert strong control over the "buy" or "checkout" experience. Shopify requires all checkout flows using their platform to use their hosted checkout pages, though it's common to wrap them in a subdomain of the main site (e.g. the Gatsby/Shopify site [strivectin.com](https://www.strivectin.com/) wraps a `myshopify.com` URL under a `shop.strivectin.com` URL for checkout).
- **Handling account pages.** Again, many sites choose to wrap their e-commerce provider’s account pages under their own domain.

## Additional resources:

<Announcement>

Check out our [e-commerce demo](https://shopify-demo.gatsbyjs.com/) built with our Shopify Starter, a proof of concept showcasing 10,000 products and 30,000 SKUs (variants).
Clone our Shopify Starter, host it on Gatsby and connect it to your own Shopify data to develop your own proof of concept in as little as an hour.

</Announcement>

- [What is Headless Commerce?](https://www.bigcommerce.com/articles/headless-commerce/#unlocking-flexibility-examples-of-headless-commerce-in-action), an overview from BigCommerce.
- [Gatsby Shopify Starter](https://shopify-demo.gatsbyjs.com/)
- Sell Things Fast With Gatsby and Shopify by Trevor Harmon [blog post](https://thetrevorharmon.com/blog/sell-things-fast-with-gatsby-and-shopify), [video](https://www.youtube.com/watch?v=tUtuGAFOjYI&t=16m59s) and [GitHub repo](https://github.com/thetrevorharmon/sell-things-fast/)
- [Gatsby Use Cases: E-commerce](https://www.gatsbyjs.com/use-cases/e-commerce)
- [Best e-commerce solutions for Jamstack websites](https://bejamas.io/blog/jamstack-ecommerce/) from the Bejamas blog.
