---
title: Optimizing plugins with Guess.js
---

This guide will walk you through integrating [Guess.js](https://github.com/guess-js/guess) into your Gatsby plugin.

> Guess.js is a collection of libraries & tools for enabling data-driven user-experience on the web.

Guess.js will fetch data from Google Analytics and use that data to generate a model for predictive pre-fetching. As a user browses the site, Guess will lookup which pages are most likely to be viewed next and pre-fetch that content. The data from Google Analytics is downloaded when the application builds and is included in the bundle.

### Installing Guess

`npm i guess-webpack --save-dev`

### Configuring Guess

```js
new GuessPlugin({
  // GA view ID.
  GA: GAViewID,

  // Tell Guess to pre-fetching or delegate this logic to its consumer.
  runtime: {
    delegate: true,
  },

  // set custom route mappings
  routeProvider: false,

  // Optional
  period: period ? period : undefined,
})
```

- `GA` - the view ID from Google Analytics
- `runtime` - configures the runtime of the GuessPlugin. In this case, the delegate property means that the Guess.js will not handle route changes
- `routeProvider` - establishes URL mappings between the Google Analytics report and the JavaScript bundles of the application.
- `period` - the period for the Google Analytics report that Guess.js will download when the application builds.

> the mapping between the JavaScript bundles of the application and the individual URLs from the Google Analytics report, is the most fragile part of the entire process.

You may need to provide custom bundle to URL mappings. You can do this by either setting the `routeProvider` to `false` or providing a custom `routeProvider` which returns an array of individual routing modules similar to the example below.

```js
export interface RoutingModule {
  // Entry point of the bundle associated with
  // the given route
  modulePath: string;

  // Entry point of the parent bundle
  parentModulePath: string | null;

  path: string;
  lazy: boolean;
}
```

### References:

- [Introducing Guess.js](https://blog.mgechev.com/2018/05/09/introducing-guess-js-data-driven-user-experiences-web/)
- [Gatsby Plugin Guess.js](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-guess-js)
- [Cutting Edge Static Sites](https://www.contentful.com/blog/2018/06/13/journey-cutting-edge-static-sites-gatsbyjs-v2/)
