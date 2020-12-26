---
title: Using Gatsby For E-commerce
---

Businesses selling products online typically need a variety of software to support their experience. At a minimum, their website needs product pages, product catalog navigation, a shopping cart, and checkout. 

Most have additional functionality like customer account creation, discount codes, customer reviews, tax calculation, user tracking via analytics, and content personalization.

The website functions because these front-end capabilities integrate with a wide swath of software on the backend, such as inventory management, order fulfillment, business analytics, and customer engagement via email. 

Most medium-to-large sized businesses typically choose a central e-commerce platform, such as Shopify or Bigcommerce, as their source of truth for these functionality. 

Some businesses choose to run entirely on these platforms. Others want a more customized experience for their users, and select other software applications and technologies to use. They might choose a CMS like Contentful for complex content modelling, or Wordpress for blog content authoring. They might choose Yotpo for customer reviews or Salsify to store product SKUs. 

And for their development environment and framework, they may choose Gatsby. If they do so, it’s typically for a combination of three reasons: they want to embrace a modern development framework (React), they want to optimize performance, and they want a web framework that’s already integrated with the systems they’re using (via Gatsby’s plugin system and pre-built integrations). 

From a conversion perspective, Gatsby’s lightning-fast performance is a huge win: Gatsby automates code splitting, image optimization, inlining critical styles, lazy-loading, prefetching resources, and more to ensure your site is fully optimized. 

And with Gatsby’s pre-built integrations, it can pull data in from all of these sources (Shopify, plus Wordpress, Contentful, Yotpo, etc) and make it available for the React components. 

E-commerce tends to have a number of specific requirements. When building a Gatsby site sourced from an ecommerce backend like Shopify, developers will typically have to think through a few additional touchpoints between the systems:

- **Persisting a cart across site pages and between sessions** (ie, if the user closes their browser and reopens it tomorrow, the items should still be there). This can handled either through local-storage or through the shopify-buy JS library.
- **Product search** can be done client-side if the SKU count is small enough to store all products in a global state. Alternatively, it can be handled through the e-commerce provider’s search features, or if those aren’t robust enough, a third-party search provider like Algolia.
- **Surfacing price adjustments** like tax, shipping, discounts/promos to the user while browsing the site. Different e-commerce solutions provide different levels of API access to these objects. 
- **Handling checkout.** Many Gatsby sites, like Strivectin, choose to whitelabel their e-commerce provider’s checkout pages under their own domain (Strivectin whitelabels myshopify.com at shop.strivectin.com)
- **Handling account pages.** Again, many sites choose to whitelabel their e-commerce provider’s account pages. 

Resources:
- [Gatsby Shopify Starter](https://github.com/AlexanderProd/gatsby-shopify-starter)
- Sell Things Fast With Gatsby and Shopify by Trevor Harmon [blog post](https://thetrevorharmon.com/blog/sell-things-fast-with-gatsby-and-shopify), [video](https://www.youtube.com/watch?v=tUtuGAFOjYI&t=16m59s) and [Github repo](https://github.com/thetrevorharmon/sell-things-fast/)
- [Gatsby Use Cases: E-commerce](https://www.gatsbyjs.com/use-cases/e-commerce)
