---
title: Using Client-Side Only Packages
---

On occasion, you may need to use a function or library that only works client side. This usually is because the library in question accesses something that isn't available during server-side rendering (SSR), like [browser DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) methods.

You'll need to use one of the workarounds outlined below if your project fails to compile with `gatsby develop` or `gatsby build` with an error like:

```bash
Reference error: Window is not Defined
```

## Workaround 1: Use a different library or approach

Sometimes the simplest approach is to work around the problem. If you can re-implement your component using a plugin which _doesn't_ break SSR, that's probably best.

## Workaround 2: Add client-side package via CDN

In the component where you need it, load the package via CDN using a [`<script />`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) tag with `react-helmet`. You'll still need to check to see if `window` exists before using the library, so that SSR can still complete.

```jsx
import { Helmet } from 'react-helmet'


const MyComponent = (props) => {
  // check for browser DOM readiness
  if (typeof window !== undefined) {
    // use external package as needed here,
    // e.g. `window.externalLibrary.method()`
  }
  return (
    {/* load our dependency client-side using react-helmet */}
    <Helmet>
      <script src="https://cdn.example/path-to-external-library.js" />
    </Helmet>
  );
}
```

## Workaround 3: Load client-side dependent components with react-loadable

Install [react loadable](https://github.com/jamiebuilds/react-loadable) and use it as a wrapper for a component that wants to use a client side only package.

```jsx
import React, { Component } from "react"
import PropTypes from "prop-types"

import Loadable from "react-loadable"

// these two libraries are client-side only
import Client from "shopify-buy"
import ShopifyBuy from "@shopify/buy-button-js"

const ShopifyBuyButton = props => {
  // custom component using shopify client-side libraries
  return <div>etc</div>
}

const Loading = () => <LoadingSpinner /> // custom loader visualization component

const LoadableBuyButton = Loadable({
  loader: () => import("./ShopifyBuyButton"),
  loading: Loading,
})

export default LoadableBuyButton
```

> **Note:** There are other potential workarounds than those listed here. If you've had success with another method, check out the [contributing docs](/contributing/docs-contributions/) and add yours!

If all else fails, you may also want to check out the documentation on [Debugging HTML Builds](/docs/debugging-html-builds/).
