# gatsby-plugin-guess-js

Gatsby plugin for integrating [Guess.js](https://github.com/guess-js/guess) with Gatsby.

Guess.js is a library for enabling data-driven user-experiences on the web.

When this plugin is added to your site, it will automatically download Google Analytics
data and use this to create a model to predict which page a user is most likely to visit
from a given page.

The plugin uses this information to do two things.

- When generating HTML pages, it automatically adds `<link prefetch>` for resources on pages
  the user is likely to visit. This means that as soon as a person visits your site, their browser
  will immediately start downloading in the background code and data for links they'll likely click on which
  can dramatically improve the site performance.
- Once the person has loaded your site and visits additional pages, the plugin will continue to predict
  which pages will be visited and prefetch their resources as well.

## Demo

https://guess-gatsby-wikipedia-demo.firebaseapp.com

## Install

`npm install --save gatsby-plugin-guess-js`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-guess-js",
      options: {
        // Find the view id in the GA admin in a section labeled "views"
        GAViewID: `VIEW_ID`,
        minimumThreshold: 0.03,
        // The "period" for fetching analytic data.
        period: {
          startDate: new Date("2018-1-1"),
          endDate: new Date(),
        },
      },
    },
  ],
}
```

## Integrating with CI

Integrating this plugin within a CI pipeline may cause errors because the plugin will prompt the user/machine to log into the Google Analytics account - you need to send a jwt to authenticate properly

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-guess-js",
      options: {
        // Find the view id in the GA admin in a section labeled "views"
        GAViewID: `VIEW_ID`,
        minimumThreshold: 0.03,
        // Set Google Analytics jwt with Google Service Account email and private key
        jwt: {
          client_email: `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
          private_key: `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`,
        },
        // The "period" for fetching analytic data.
        period: {
          startDate: new Date("2018-1-1"),
          endDate: new Date(),
        },
      },
    },
  ],
}
```
