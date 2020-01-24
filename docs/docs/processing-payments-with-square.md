---
title: Processing Payments with Square
---

## Introductory paragraph

Square is a payment service that emphasizes quick secure payments as well as user-friendly and affordable point of sale (POS) system. You may have already seen their tiny credit card readers, which are great for mobile businesses like those that sell via food trucks or craft fairs. This guide explains how to begin using Square with your Gatsby site.

## Prerequisites (if any)

You'll need to [set up a developer account](https://squareup.com/signup?v=developers) to get started. Create a new application from your developer dashboard. The name of your application cannot include the word "square". Once that's done, you should see your new application on your dashboard. Each application has an application ID and access token associated with it.

## Choosing the right product

Square can handle most of your payment-related needs including accepting payments, managing product catalogs, and managing payroll. Begin by determining which of these products you want to incorporate into your business. This guide focuses on [accepting payments on your website](https://developer.squareup.com/docs/online-payment-options#square-payments-in-your-own-website) but you may wish to use their in-person or in-app options as well.

You've got two options for integrating Square payments: redirecting to a hosted checkout page with the Checkout API as well as using payments on your Gatsby site with the `SqPaymentForm` library and Payments API.

## Redirecting to a hosted checkout page

Redirecting to a Square-host page takes some of the pressure off since you don't need to build a checkout page. However, getting that functionality "for free" does come with some restrictions. You will not be able to customize the UI of the page users are sent to once they're ready to checkout. Square only recommends this option for situations where accepting payments on your own site isn't feasible.

## Accepting Square payments

Using the Payments API offers much greater flecxibility. You can customize not only the look and feel of the checkout process but also the checkout process itself. You may choose 

This process is broken into two steps:

1. Generate a single-use token called a nonce.
2. Charge whatever payment source the user has provided (this could be a credit card, gift card, etc.) using the nonce.

## The Square sandbox

You can test your setup using the Square sandbox. 

## Other resources

- [Square documentation for online payment options](https://developer.squareup.com/docs/online-payment-options)
- Square's blog post on [Online Payments with React + Square](https://developer.squareup.com/blog/online-payments-form-react/)