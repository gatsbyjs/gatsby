# gatsby-plugin-google-analytics

Easily add Google Analytics to your Gatsby site.

## Install

`npm install --save gatsby-plugin-google-analytics`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "YOUR_GOOGLE_ANALYTICS_TRACKING_ID",
        // Puts tracking script in the head instead of the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
        // Avoids sending pageview hits from custom paths
        exclude: ["/preview/**", "/do-not-track/me/too/"],
        // Any additional create only fields (optional)
        sampleRate: 5,
        siteSpeedSampleRate: 10,
        cookieDomain: "example.com",
      },
    },
  ],
}
```

See below for the complete list of [Create Only Fields](#create-only-fields).

## `<OutboundLink>` component

To make it easy to track clicks on outbound links in Google Analytics,
the plugin provides a component.

To use it, simply import it and use it like you would the `<a>` element e.g.

```jsx
import React
import { OutboundLink } from 'gatsby-plugin-google-analytics'

export default () => {
  <div>
    <OutboundLink
      href="https://www.gatsbyjs.org/packages/gatsby-plugin-google-analytics/"
    >
      Visit the Google Analytics plugin page!
    </OutboundLink>
  </div>
}
```

## The "anonymize" option

Some countries (such as Germany) require you to use the
[\_anonymizeIP](https://support.google.com/analytics/answer/2763052) function for
Google Analytics. Otherwise you are not allowed to use it. The option adds two
blocks to the code:

```javascript
function gaOptout(){document.cookie=disableStr+'=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/',window[disableStr]=!0}var gaProperty='UA-XXXXXXXX-X',disableStr='ga-disable-'+gaProperty;document.cookie.indexOf(disableStr+'=true')>-1&&(window[disableStr]=!0);

...

ga('set', 'anonymizeIp', 1);
```

If your visitors should be able to set an Opt-Out-Cookie (No future tracking)
you can set a link e.g. in your imprint as follows:

`<a href="javascript:gaOptout();">Deactive Google Analytics</a>`

## The "respectDNT" option

If you enable this optional option, Google Analytics will not be loaded at all for visitors that have "Do Not Track" enabled. While using Google Analytics does not necessarily constitute Tracking, you might still want to do this to cater to more privacy oriented users.

## The "exclude" option

If you need to exclude any path from the tracking system, you can add it (one or more) to this optional array as glob expressions.

## Create Only Fields

This plugin supports all optional Create Only Fields documented in [Google Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#create):

- `name`: string, tracker name
- `clientId`: string
- `sampleRate`: number
- `siteSpeedSampleRate`: number
- `alwaysSendReferrer`: boolean
- `allowAnchor`: boolean
- `cookieName`: string
- `cookieDomain`: string, defaults to `'auto'` if not given
- `cookieExpires`: number
- `storeGac`: boolean
- `legacyCookieDomain`: string
- `legacyHistoryImport`: boolean
- `allowLinker`: boolean

These fields can be specified in the plugin's `options` as shown in the [How to use](#how-to-use) section.
