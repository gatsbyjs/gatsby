---
title: Processing Payments with Stripe
examples:
  - label: Using Stripe
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/ecommerce-tutorial-with-stripe"
---

## Why Stripe and Gatsby?

Gatsby is an excellent choice for an e-commerce website because static sites are secure and incredibly fast. Whether you're running an online store, accepting donations for a charity, or billing based on usage, you'll need a way to accept payments. Payment processing platforms like PayPal and Stripe are ideal solutions for these use cases.

## Prerequisites

Stripe is a developer-friendly payment processing platform. With a Stripe account, you can process payments, create recurring payments, and send invoices. They offer many more products which you can explore on [the Stripe website](https://stripe.com/). Stripe provides an excellent dashboard to manage your account as well as a high-quality, well-documented API. The [Stripe API documentation](https://stripe.com/docs/api) is an excellent resource.

### Setting up your Stripe account

To get started, create a [Stripe account](https://dashboard.stripe.com/register). Choose the integrations and services you'd like to use like whether you want to just accept payments or also pay sellers/service providers. You can change your choices later. Stripe uses your choices to recommend services like Payments and Billing. After registering, you'll need to activate your account with your business details such as address and banking information.

### Getting your Stripe test keys

Once logged into the Stripe dashboard, you can find your API keys under the Developers menu. Before you activate your account, you'll only have access to your test API keys. You'll need to use your publishable and secret keys as described in the documentation for any plugins, starters, or other integrations you use. Test keys allow you to test your Stripe integration without making real payments. To access your live API keys, activate your account. The e-commerce tutorial describes how to [add your Stripe keys when using the gatsby-source-stripe plugin](/tutorial/ecommerce-tutorial/#add-the-stripe-source-plugin).

While testing, you must use the key(s) that include the word test. For production code, you will need to use the live keys. As the names imply, your publishable key may be included in the code that you share publicly (for example, on the frontend, and in GitHub), whereas your secret key should not be shared with anyone or committed to any public repo. It’s important to restrict access to this secret key because anyone who has it could potentially read or send requests from your Stripe account and see information about charges or purchases or even refund customers.

## Resources for using Stripe

Several tutorials, plugins and starters exist to help you get up and running with Stripe.

### Tutorials & Videos

- [Gatsby E-commerce Tutorial](/tutorial/ecommerce-tutorial): A step-by-step tutorial for adding Stripe Checkout to your Gatsby site.
- [Learn with Jason Episode](https://youtu.be/g4aCBNt5Pcg): Build an E-commerce Site Using Stripe and Gatsby.

### Plugins

- [gatsby-source-stripe](/plugins/gatsby-source-stripe/): This plugin allows you to bring your product and SKU data into your Gatsby site at build time to be [used with Stripe Checkout](/tutorial/ecommerce-tutorial/#example-2-import-skus-via-source-plugin).

### Starters & Examples

- [Example site from the Gatsby Stripe tutorial](https://github.com/gatsbyjs/gatsby/tree/master/examples/ecommerce-tutorial-with-stripe)
- [gatsby-starter-ecommerce](/starters/parmsang/gatsby-starter-ecommerce/)
- [gatsby-starter-stripe](/starters/brxck/gatsby-starter-stripe/)

## Other resources

- [Stripe website](https://stripe.com/)
- [Stripe docs](https://stripe.com/docs)
- [Stripe testing docs](https://stripe.com/docs/testing)
