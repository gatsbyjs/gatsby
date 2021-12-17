---
title: Adding a Shopping Cart with Snipcart
---

Snipcart is a shopping cart solution designed to drop neatly into any web project. Including it in your project allows any HTML you write to instantly become a "buy button" with the addition of several Snipcart-specific attributes.

Combine it with a source of products (like a CMS or an e-commerce platform such as [Etsy](https://www.etsy.com/)) and a payment processor (like [Stripe](https://www.stripe.com/)) to build a complete e-commerce experience for your customers.

## Prerequisites

To get started, you'll need to have the following set up:

- A Gatsby site with [`gatsby-plugin-snipcart`](/plugins/gatsby-plugin-snipcart/) installed
- A [Snipcart](https://snipcart.com/) account
- A Snipcart test API key
- A list of products to sell

Installing the plugin adds Snipcart's shopping cart JavaScript for you, so you can get right to building your e-commerce site. It's okay if you're not sure what you'd like to sell quite yet. Using sample products is fine to begin with!

## Defining Products

Adding products with Snipcart involves writing HTML representing your product and adding a set of attributes to that HTML. You might write something similar to the following code block for each item in your catalog. This code could be part of a page like `index.js` or anywhere else you list a product.

```jsx
<section>
  <h2>Silver Stacking Ring</h2>
  <p>$19.99</p>
  <p>Wear one or seventeen! These rings are fun to mix and match.</p>
</section>
```

Including this information allows a visitor to see what you have for sale, but they can't do anything with that information quite yet. You'll need a way for customers to add individual items to their cart. Try adding a button with the following attributes.

```jsx
<section>
  <h2>Silver Stacking Ring</h2>
  <p>$19.99</p>
  <p>Wear one or seventeen! These rings are fun to mix and match.</p>
  <!-- highlight-start -->
  <button
    class="snipcart-add-item"
    data-item-id="silver-stacking-ring"
    data-item-price="19.99"
    data-item-url="/"
    data-item-name="Silver Stacking Ring"
  >
    Add to cart
  </button>
  <!-- highlight-end -->
</section>
```

Snipcart uses these attributes (`data-item-*`) to figure out what your customer is trying to buy and how much to charge them. The ID, price, URL, and name attributes are all required but there are several other attributes that you can add to enhance the shopping cart.

Importantly, `data-item-url` denotes the URL of the webpage displaying the product(s). Snipcart needs to crawl this page to validate the order. The web crawler looks for the HTML element with the `snipcart-add-item` CSS class as well as the `data-item-id` and checks what it finds there against whatever is in the cart.

> Note that, while you're testing, a `data-item-url` value of `"/"` is fine. For the checkout flow to work, you will eventually need to replace this with the actual URL at which you've published your catalog or product page.

To learn more about defining products, see the [Snipcart documentation](https://docs.snipcart.com/v3/setup/products).

### Adding product variants

Snipcart refers to variations like size and color as "product options" or "custom fields". You can add these custom fields to your products to allow customers to refine their orders.

Building on the stacking ring example, suppose that you wanted to give your customer a choice between available sizes. You would do this by adding a custom field with a name and options.

```jsx
<section>
  <h2>Silver Stacking Ring</h2>
  <p>$19.99</p>
  <p>Wear one or seventeen! These rings are fun to mix and match.</p>
  <button
    class="snipcart-add-item"
    data-item-id="silver-stacking-ring"
    data-item-price="19.99"
    data-item-url="/"
    data-item-name="Silver Stacking Ring"
    <!--highlight-start-->
    data-item-custom1-name="Size"
    data-item-custom1-options="6|6.5|7|7.5|8|8.5|9"
    <!-- highlight-end -->
    >
    Add to cart
  </button>
</section>
```

You can add multiple custom fields by incrementing the index of the `data-item-custom` attribute. Perhaps you want customers to have the ability to mark each item in their cart as a gift.

```jsx
<section>
  <h2>Silver Stacking Ring</h2>
  <p>$19.99</p>
  <p>Wear one or seventeen! These rings are fun to mix and match.</p>
  <button
    class="snipcart-add-item"
    data-item-id="silver-stacking-ring"
    data-item-price="19.99"
    data-item-url="/"
    data-item-name="Silver Stacking Ring"
    data-item-custom1-name="Size"
    data-item-custom1-options="6|6.5|7|7.5|8|8.5|9"
    <!--highlight-start-->
    data-item-custom2-name="This is a gift" data-item-custom2-type="checkbox"
   >
    <!-- highlight-end -->
    Add to cart
  </button>
</section>
```

### Selling digital products

Snipcart enables the sale of digital goods such as e-books, photography, and other artwork. To sell a file for others to download, you'll need to upload it to your Snipcart dashboard and then add the resulting GUID as the value of the `data-item-file-guid` attribute to your product's markup. You can specify a file access expiry in days and a maximum number of downloads per order from the dashboard.

```jsx
<section>
  <h2>Silver Stacking Ring</h2>
  <p>$19.99</p>
  <p>Wear one or seventeen! These rings are fun to mix and match.</p>
  <button
    class="snipcart-add-item"
    data-item-id="silver-stacking-ring"
    data-item-price="19.99"
    data-item-url="/"
    data-item-name="Silver Stacking Ring"
    <!--highlight-start-->
    data-item-file-guid="your-digital-product-guid">
    <!-- highlight-end -->
    Add to cart
  </button>
</section>
```

## Customizing the cart

Using Snipcart allows you to retain nearly complete control over your customers' experience on your e-commerce site. You can configure and customize the cart behavior as well as the product options. Look through your [Snipcart account settings](https://app.snipcart.com/dashboard/account/settings) to change things like currency, shipping options, and email templates.

### Preventing automatic popups

By default, the shopping cart will pop up every time a customer adds a product. To prevent this behavior, set the value of `autopop` to `false` in your `gatsby-config.js` file.

```js:title=gatsby-config.js
{
  resolve: 'gatsby-plugin-snipcart',
  options: {
    apiKey: 'your-api-key',
    autopop: false // highlight-line
  }
},
```

If you choose to prevent this popup, you'll need to give your customers some other way to access their shopping carts. Create a "show cart" button by giving a `button` element a class of `snipcart-checkout`.

```jsx
<button className="snipcart-checkout">View Cart</button>
```

### Styling the cart

You can override most aspects of the shopping cart, including the CSS. Try inspecting the element you'd like to customize and using your browser's developer tools to find the correct Snipcart class to override.

```css
.snip-header {
  background: #663399;
}

.snip-layout__main-container {
  border: 2px solid black;
  padding: 3px;
}
```

You can also customize the cart template itself. For a complete list of Snipcart's components (with code examples), check out their [default theme reference](https://docs.snipcart.com/v3/themes/default/reference).

## Connecting a payment processor

Once you're ready to receive payments, connect your chosen payment processor to your Snipcart account from the dashboard. You'll also need to input your credit card information in order to get your live Snipcart key.

The following quote is from the Snipcart [payment gateway page](https://app.snipcart.com/dashboard/account/gateway):

> Please note that you can select only one payment gateway. However, you can also enable PayPal Express Checkout on top of any gateway you choose.
>
> Also, you can switch from a gateway to another whenever you want.

## Other resources

- [Build an E-commerce Site with Gatsby, DatoCMS, and Snipcart](/tutorial/e-commerce-with-datocms-and-snipcart/) tutorial
- [`gatsby-plugin-snipcart`](/plugins/gatsby-plugin-snipcart/)
- [OneShopper Gatsby starter](/starters/rohitguptab/OneShopper/)
- Reference guide on [sourcing from Etsy](/docs/sourcing-from-etsy/)
- Reference guide on [processing payments with Stripe](/docs/how-to/adding-common-features/processing-payments-with-stripe/)
- [Snipcart documentation](https://docs.snipcart.com/v3/setup/installation)
