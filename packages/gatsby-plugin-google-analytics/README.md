# gatsby-plugin-google-analytics

Easily add Google Analytics to your Gatsby site.

## Install

`npm install --save gatsby-plugin-google-analytics`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-google-analytics`,
    options: {
      trackingId: "YOUR_GOOGLE_ANALYTICS_TRACKING_ID",
      // Puts tracking script in the head instead of the body
      head: false,
      // Setting this parameter is optional
      anonymize: true,
    },
  },
];
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
