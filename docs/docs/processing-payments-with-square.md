---
title: Processing Payments with Square
---

Square is a payment service that emphasizes quick, secure payments as well as a user-friendly and affordable point of sale (POS) system. You may have already seen their tiny credit card readers, which are great for mobile businesses like those that sell via food trucks or craft fairs. This guide explains how to begin using Square with your Gatsby site.

## Prerequisites

You'll need to [set up a developer account](https://squareup.com/signup?v=developers) to get started. Create a new application from your developer dashboard. The name of your application cannot include the word "square". Once that's done, you should see your new application on your dashboard. Each application has an application ID and access token associated with it.

## Choosing the right product

Square can handle most of your payment-related needs including accepting payments, managing product catalogs, and managing payroll. Begin by determining which of these products you want to incorporate into your business. This guide focuses on [accepting payments on your website](https://developer.squareup.com/docs/online-payment-options#square-payments-in-your-own-website) but you may wish to use their in-person or in-app options as well.

You've got two options for integrating Square payments: redirecting to a hosted checkout page with the Checkout API _or_ taking payments from your Gatsby site using the `SqPaymentForm` library with the Payments API.

### Redirecting to a hosted checkout page

Redirecting to a Square-hosted page takes some of the pressure off since you don't need to build a checkout page. However, getting that functionality "for free" does come with some restrictions. You will not be able to customize the UI of the page users are sent to once they're ready to checkout. Square only recommends this option for situations where accepting payments on your own site isn't feasible.

### Accepting Square payments

Square recommends using the Payments API instead because it offers much greater flexibility. You can customize not only the look and feel of the checkout process but also the checkout process itself, such as customizing the payment methods available.

This process is broken into two steps:

1. Generate a single-use token called a nonce.
2. Charge whatever payment source the user has provided (this could be a credit card, gift card, etc.) using the nonce.

To add a Square payment form to your Gatsby site, you'll need to load the JavaScript that runs Square's payment form into the `<head>` of your website. You can do this by creating a `<script>` element and appending it to the `<head>`. Wrapping this up into a function (such as `loadSquareSdk` in the following example) will allow you to load this script only when it's required (that is, only when you want to use the payment form).

```js:title=paymentForm.js
export const loadSquareSdk = () => {
  return new Promise((resolve, reject) => {
    const sqPaymentScript = document.createElement("script")
    sqPaymentScript.src = "https://js.squareup.com/v2/paymentform"
    sqPaymentScript.crossorigin = "anonymous"
    sqPaymentScript.onload = () => {
      resolve()
    }
    sqPaymentScript.onerror = () => {
      reject(`Failed to load ${sqPaymentScript.src}`)
    }
    document.getElementsByTagName("head")[0].appendChild(sqPaymentScript)
  })
}
```

You'll also need to create some variation of a `PaymentForm` component. Square maintains a few [payment form templates](https://github.com/square/connect-api-examples/tree/master/templates/web-ui/payment-form) you can base your component on. Try starting with the ["basic" JavaScript file](https://github.com/square/connect-api-examples/blob/master/templates/web-ui/payment-form/basic/sqpaymentform-basic.js). They also provide a [running example](https://codesandbox.io/s/4zjrv7kry9?from-embed) using their "basic-digital-wallet" template with React.

```js:title=paymentForm.js
import React, { Component } from "react"
import "./paymentForm.css"

const styles = {
  name: {
    verticalAlign: "top",
    display: "none",
    margin: 0,
    border: "none",
    fontSize: "16px",
    fontFamily: "Helvetica Neue",
    padding: "16px",
    color: "#373F4A",
    backgroundColor: "transparent",
    lineHeight: "1.15em",
    placeholderColor: "#000",
    _webkitFontSmoothing: "antialiased",
    _mozOsxFontSmoothing: "grayscale",
  },
  leftCenter: {
    float: "left",
    textAlign: "center",
  },
  blockRight: {
    display: "block",
    float: "right",
  },
  center: {
    textAlign: "center",
  },
}

export default class PaymentForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cardBrand: "",
      nonce: undefined,
      googlePay: false,
      applePay: false,
      masterpass: false,
    }
    this.requestCardNonce = this.requestCardNonce.bind(this)
  }

  requestCardNonce() {
    this.paymentForm.requestCardNonce()
  }

  componentDidMount() {
    const config = {
      applicationId: "sq0idp-rARHLPiahkGtp6mMz2OeCA",
      locationId: "GMT96A77XABR1",
      inputClass: "sq-input",
      autoBuild: false,
      inputStyles: [
        {
          fontSize: "16px",
          fontFamily: "Helvetica Neue",
          padding: "16px",
          color: "#373F4A",
          backgroundColor: "transparent",
          lineHeight: "1.15em",
          placeholderColor: "#000",
          _webkitFontSmoothing: "antialiased",
          _mozOsxFontSmoothing: "grayscale",
        },
      ],
      applePay: {
        elementId: "sq-apple-pay",
      },
      masterpass: {
        elementId: "sq-masterpass",
      },
      googlePay: {
        elementId: "sq-google-pay",
      },
      cardNumber: {
        elementId: "sq-card-number",
        placeholder: "• • • •  • • • •  • • • •  • • • •",
      },
      cvv: {
        elementId: "sq-cvv",
        placeholder: "CVV",
      },
      expirationDate: {
        elementId: "sq-expiration-date",
        placeholder: "MM/YY",
      },
      postalCode: {
        elementId: "sq-postal-code",
        placeholder: "Zip",
      },
      callbacks: {
        methodsSupported: methods => {
          console.log(methods)
          if (methods.googlePay) {
            this.setState({
              googlePay: methods.googlePay,
            })
          }
          if (methods.applePay) {
            this.setState({
              applePay: methods.applePay,
            })
          }
          if (methods.masterpass) {
            this.setState({
              masterpass: methods.masterpass,
            })
          }
          return
        },
        createPaymentRequest: () => {
          return {
            requestShippingAddress: false,
            requestBillingInfo: true,
            currencyCode: "USD",
            countryCode: "US",
            total: {
              label: "MERCHANT NAME",
              amount: "100",
              pending: false,
            },
            lineItems: [
              {
                label: "Subtotal",
                amount: "100",
                pending: false,
              },
            ],
          }
        },
        cardNonceResponseReceived: (errors, nonce, cardData) => {
          if (errors) {
            // Log errors from nonce generation to the Javascript console
            console.log("Encountered errors:")
            errors.forEach(function(error) {
              console.log("  " + error.message)
            })
            return
          }
          this.setState({
            nonce: nonce,
          })
          console.log(nonce)
        },
        unsupportedBrowserDetected: () => {},
        inputEventReceived: inputEvent => {
          switch (inputEvent.eventType) {
            case "focusClassAdded":
              break
            case "focusClassRemoved":
              break
            case "errorClassAdded":
              document.getElementById("error").innerHTML =
                "Please fix card information errors before continuing."
              break
            case "errorClassRemoved":
              document.getElementById("error").style.display = "none"
              break
            case "cardBrandChanged":
              if (inputEvent.cardBrand !== "unknown") {
                this.setState({
                  cardBrand: inputEvent.cardBrand,
                })
              } else {
                this.setState({
                  cardBrand: "",
                })
              }
              break
            case "postalCodeChanged":
              break
            default:
              break
          }
        },
        paymentFormLoaded: function() {
          document.getElementById("name").style.display = "inline-flex"
        },
      },
    }
    this.paymentForm = new this.props.paymentForm(config)
    this.paymentForm.build()
  }

  render() {
    return (
      <div className="container">
        <div id="form-container">
          <div id="sq-walletbox">
            <button
              style={{ display: this.state.applePay ? "inherit" : "none" }}
              className="wallet-button"
              id="sq-apple-pay"
            />
            <button
              style={{ display: this.state.masterpass ? "block" : "none" }}
              className="wallet-button"
              id="sq-masterpass"
            />
            <button
              style={{ display: this.state.googlePay ? "inherit" : "none" }}
              className="wallet-button"
              id="sq-google-pay"
            />
            <hr />
          </div>

          <div id="sq-ccbox">
            <p>
              <span style={styles.leftCenter}>Enter Card Info Below </span>
              <span style={styles.blockRight}>
                {this.state.cardBrand.toUpperCase()}
              </span>
            </p>
            <div id="cc-field-wrapper">
              <label>Card Number<div id="sq-card-number" /></label>
              <input type="hidden" id="card-nonce" name="nonce" />
              <label>Expiration Date<div id="sq-expiration-date" /></label>
              <label>CVV<div id="sq-cvv" /></label>
            </div>
            <label>Name
              <input
                id="name"
                style={styles.name}
                type="text"
                placeholder="Name"
              />
            </label>
            <label>Postal Code<div id="sq-postal-code" /></label>
          </div>
          <button
            className="button-credit-card"
            onClick={this.requestCardNonce}
          >
            Pay
          </button>
        </div>
        <p style={styles.center} id="error" />
      </div>
    )
  }
}
```

Once that's done, you can use the `SqPaymentForm` object available on the `window` (you get this from the Square JS you called in the `<head>`) and pass it in via props whenever you want the form to show up! In the example below, the `PaymentForm` has been added to the homepage from the [default starter](/starters/gatsbyjs/gatsby-starter-default/).

```js:title=index.js
import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import PaymentForm, { loadSquareSdk } from "../components/paymentForm"

const IndexPage = () => {
  const [squareStatus, setSquareStatus] = useState(null)

  useEffect(() => {
    loadSquareSdk()
      .then(() => {
        setSquareStatus("SUCCESS")
      })
      .catch(() => setSquareStatus("ERROR"))
  }, []) // on mount, add the js script dynamically

  return (
    <Layout>
      <SEO title="Home" />

      {squareStatus === "ERROR" &&
        "Failed to load SquareSDK. Please refresh the page."}
      {squareStatus === "SUCCESS" && (
        <PaymentForm paymentForm={window.SqPaymentForm} />
      )}

      <Link to="/page-2/">Go to page 2</Link>
    </Layout>
  )
}

export default IndexPage
```

## The Square sandbox

You can test your setup [using the Square sandbox](https://developer.squareup.com/docs/testing/sandbox). To do so, you'll need to return to your [developer dashboard](https://developer.squareup.com/apps). In the "Credentials" tab, you can toggle back and forth between your production and sandbox credentials!

## Other resources

- [`SqPaymentForm` documentation](https://developer.squareup.com/docs/api/paymentform#navsection-paymentform)
- [Square's tutorial for online payment options](https://developer.squareup.com/docs/online-payment-options)
- Square's blog post on [Online Payments with React + Square](https://developer.squareup.com/blog/online-payments-form-react/)
