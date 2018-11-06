# gatsby-plugin-google-gtag

Easily add Google Global Site Tag to your Gatsby site.

## Install

`npm install --save gatsby-plugin-google-gtag`

## How to use

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // You can add multiple tracking ids and a pageview event will be fired for all of them.
        trackingIds: [
          "GA-TRACKING_ID", // Google Analytics / GA
          "AW-CONVERSION_ID", // Google Ads / Adwords / AW
          "DC-FLOODIGHT_ID", // Marketing Platform advertising products (Display & Video 360, Search Ads 360, and Campaign Manager)
        ],
        // This object gets passed directly to the gtag config command
        // This config will be shared accross all trackingIds
        gtagConfig: {
          optimize_id: "OPT_CONTAINER_ID",
          anonymize_ip: true,
        },
        // This object is used for configuration specific to this plugin
        pluginConfig: {
          // Puts tracking script in the head instead of the body
          head: false,
          // Setting this parameter is also optional
          respectDNT: true,
          // Avoids sending pageview hits from custom paths
          exclude: ["/preview/**", "/do-not-track/me/too/"],
        },
      },
    },
  ],
}
```

## Custom Events

This plugin automatically sends a "pageview" event to all products given as "trackingIds" on every Gatsbys route change.

If you want to call a custom event you have access to `window.gtag` where you can call an event for all products:

```js
window.gtag("event", "click", { ...data })
```

or you can target a specific product:

```js
window.gtag("event", "click", { send_to: "AW-CONVERSION_ID", ...data })
```

In either case don't forget to guard against SSR:

```js
typeof window !== "undefined" && window.gtag("event", "click", { ...data })
```

## `<OutboundLink>` component

To make it easy to track clicks on outbound links the plugin provides a component.

To use it, simply import it and use it like you would the `<a>` element e.g.

```jsx
import React from "react"
import { OutboundLink } from "gatsby-plugin-google-gtag"

export default () => {
  <div>
    <OutboundLink href="https://www.gatsbyjs.org/packages/gatsby-plugin-google-gtag/">
      Visit the Google Global Site Tag plugin page!
    </OutboundLink>
  </div>
}
```

## The "gtagConfig.anonymize_ip" option

Some countries (such as Germany) require you to use the
[\_anonymizeIP](https://support.google.com/analytics/answer/2763052) function for
Google Site Tag. Otherwise you are not allowed to use it. The option adds the
block of code below:

```js
function gaOptout() {
  ;(document.cookie =
    disableStr + "=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/"),
    (window[disableStr] = !0)
}

var gaProperty = "UA-XXXXXXXX-X",
  disableStr = "ga-disable-" + gaProperty
document.cookie.indexOf(disableStr + "=true") > -1 && (window[disableStr] = !0)
```

If your visitors should be able to set an Opt-Out-Cookie (No future tracking)
you can set a link e.g. in your imprint as follows:

`<a href="javascript:gtagOptout();">Deactive Google Tracking</a>`

## The "pluginConfig.respectDNT" option

If you enable this optional option, Google Global Site Tag will not be loaded at all for visitors that have "Do Not Track" enabled. While using Google Global Site Tag does not necessarily constitute Tracking, you might still want to do this to cater to more privacy oriented users.

## The "pluginConfig.exclude" option

If you need to exclude any path from the tracking system, you can add it (one or more) to this optional array as glob expressions.

## The "gtagConfig.optimize_id" option

If you need to use Google Optimize for A/B testing, you can add this optional Optimize container id to allow Google Optimize to load the correct test parameters for your site.
