---
title: "Adding a SEO component"
---

Every website on the web has basic _meta-tags_ like the title, favicon or description of the page in their `<head>` element. This information gets displayed in the browser and is used when someone, e.g. shares your website on Twitter. You can give your users and these websites additional data to embed your website with more data — and that's where this guide for a SEO component comes in. At the end you'll have a component you can place in your layout file and
have rich previews for other clients, smartphone users, and search engines.

_Note: This component will use StaticQuery. If you're unfamiliar with that, have a look at the [StaticQuery documentation](/docs/static-query/#static-query)._

## gatsby-config.js

Gatsby makes all data put into the `siteMetadata` section of your `gatsby-config` file automatically available in GraphQL and therefore input the needed information for the SEO component there.

```js:title=gatsby-config.js
module.exports = {
  siteMetadata: {},
}
```
