---
title: Processing Payments with Stripe
---

## Why Stripe and Gatsby?

Gatsby is an excellent choice for an e-commerce website because static sites are secure and incredibly fast. Whether you're running an online store, accepting donations for a charity, or billing based on usage, you'll need a way to accept payments. Payment processing platforms like Paypal and Stripe are ideal solutions for these use cases.

## Prerequisites

Stripe is a developer-friendly payment processing platform. With a Stripe account, you can process payments, create recurring payments, and send invoices. They offer many more products which you can explore on [the Stripe website](https://stripe.com/). Stripe provides an excellent dashboard to manage your account as well as a high-quality, well-documented API. The [Stripe API documentation](https://stripe.com/docs/api) is an excellent resource.

### Setting up your Stripe account

To get started, create a [Stripe account](https://dashboard.stripe.com/register). Choose the integrations and services you'd like to use like whether you want to just accept payments or also pay sellers/service providers. You can change your choices later. Stripe uses your choices to recommend services like Payments and Billing. After registering, you'll need to activate your account with your business details such as address and banking information.

### Getting your Stripe test keys

Once logged into the Stripe dashboard, you can find your API keys under the Developers menu. Before you activate your account, you'll only have access to your test API keys. You'll need to use your publishable and secret keys as described in the documentation for any plugins, starters, or other integrations you use. Test keys allow you to test your Stripe integration without making real payments. To access your live API keys, activate your account. The e-commerce tutorial describes how to [add your Stripe keys when using the gatsby-source-stripe plugin](/tutorial/ecommerce-tutorial/#add-the-stripe-source-plugin).

While testing, you must use the key(s) that include the word test. For production code, you will need to use the live keys. As the names imply, your publishable key may be included in code that you share publicly (for example, on the frontend, and in GitHub), whereas your secret key should not be shared with anyone or committed to any public repo. It’s important to restrict access to this secret key because anyone who has it could potentially read or send requests from your Stripe account and see information about charges or purchases or even refund customers.

## Existing plugins and starters using Stripe

Several plugins and starters exist to help you get up and running with Stripe.

### Plugins

- [gatsby-plugin-stripe](https://www.gatsbyjs.org/packages/gatsby-plugin-stripe/)
- [gatsby-source-stripe](https://www.gatsbyjs.org/packages/gatsby-source-stripe/)
- [gatsby-plugin-stripe-checkout](https://www.gatsbyjs.org/packages/gatsby-plugin-stripe-checkout/)

### Starters

- [gatsby-starter-ecommerce](https://www.gatsbyjs.org/starters/parmsang/gatsby-starter-ecommerce/)
- [gatsby-starter-stripe](https://www.gatsbyjs.org/starters/brxck/gatsby-starter-stripe/)

## One-time transactions

Stripe offers two solutions to create payment forms for one-time transactions. According to the Stripe documentation, "Checkout creates a secure, Stripe-hosted payment page that lets you collect payments with just a few lines of code". Stripe Elements is an alternative to Checkout if you need more control of the look and feel of the form.

### Creating products

Whether you're using Checkout or Elements, you'll need to create a product on Stripe. The Stripe [Product API](https://stripe.com/docs/api/products/create) can be used to create products, or you can use the dashboard to manually create products. Select Products in the navigation, click `+ New` and fill out the form with your product info. Once you create your product, you'll be able to add SKUs, view the product ID, and more.

### Checkout

The [Stripe Checkout documentation](https://stripe.com/docs/payments/checkout/one-time) provides detailed information on how to setup Checkout if you're interested. Because of how Gastby is rendered, there are a few changes you'll need to make like using the `gatsby-plugin-stripe`.

Check out the [Gatsby E-Commerce Tutorial](https://www.gatsbyjs.org/tutorial/ecommerce-tutorial/#installing-the-stripejs-plugin) to learn how to set up your account to use the "Checkout client-only integration", create products on the Stripe dashboard, and integrate Checkout with Gatsby. The tutorial will explain everything you need to start selling your products.

### Stripe Elements

Stripe Elements are prebuilt UI components that help you create checkout flows on the web. Unlike Checkout, Elements give you complete control over the payment experience. Elements require you to write both client-side and server-side code.

React Stripe Elements is a wrapper around Stripe Elements that help you add Elements to React applications and manage the state and lifecycle of Elements. Documentation can be found at the [React Stripe Elements GitHub](https://github.com/stripe/react-stripe-elements).

The Stripe documentation explains how to [accept a payment](https://stripe.com/docs/payments/accept-a-payment-charges#node) using Elements.

As described in the documentation, you'll need to:

1. Set up Stripe (client-side)
2. Create a payment form with Elements (client-side)
3. Create a token (client-side)
4. Submit the token to your server (client-side)
5. Create a charge with the token (server-side)

Because of how Gatsby is rendered, you'll need to make sure the window is available before loading Stripe. One way to do this is using the `useState` hook to save an instance of Stripe and the useEffect hook to load Stripe if the window is not undefined. The code snippet below shows a small example of these changes. Instead of passing your API key to the `<StripeProvider />`, you'll pass the `stripe` variable.

```javascript
import { Elements, StripeProvider } from "react-stripe-elements"
import CustomForm from "./CustomForm"

const CheckoutForm = props => {
  const [stripe, setStripe] = useState(null)
  useEffect(() => {
    if (typeof window !== undefined && typeof window.Stripe !== undefined) {
      setStripe(window.Stripe("pk_YOUR_PUBLISHABLE_API_KEY"))
    }
  }, [])

  return (
    <StripeProvider stripe={stripe}>
      <Elements>
        <CustomForm />
      </Elements>
    </StripeProvider>
  )
}
```

## Recurring payments

Stripe Billing is an excellent tool for creating recurring payments, even providing the ability to charge based on usage or tiered subscription plans. The [Billing documentation](https://stripe.com/docs/billing) explains the different options to set up recurring payments. The [Subscription documentation](https://stripe.com/docs/billing/subscriptions/set-up-subscription) shows how to create subscription plans, payment methods, and customers.

## Other resources

- [Stripe website](https://stripe.com/)
- [Stripe API documentation](https://stripe.com/docs/api)
- [Stripe testing documentation](https://stripe.com/docs/testing).
- [React Stripe Elements GitHub](https://github.com/stripe/react-stripe-elements)
- [Making an e-commerce Gatsby Site with Stripe](https://www.gatsbyjs.org/tutorial/ecommerce-tutorial/)
