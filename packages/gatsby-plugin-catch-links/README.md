# gatsby-plugin-catch-links

Intercepts local links from markdown and other non-react pages and does a
client-side pushState to avoid the browser having to refresh the page.

For instance, in a markdown file with relative links (transformed
to `a` tags by
[`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/)), this
plugin replaces the default link behaviour
with that of [`gatsby-link`'s `navigate`](https://gatsbyjs.org/docs/gatsby-link/#programmatic-navigation), preserving the
SPA-like page change without reload.

Check out the [_Using Remark_ example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-remark) to see this plugin in action.

## Install

`npm install --save gatsby-plugin-catch-links`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-catch-links`]
```
