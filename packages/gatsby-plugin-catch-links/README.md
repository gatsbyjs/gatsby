# gatsby-plugin-catch-links

Intercepts local links from markdown and other non-react pages and does a
client-side pushState to avoid the browser having to refresh the page.

For instance, in this markdown doc that uses normal linking (transformed
to `a` by 
[`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/)), this 
plugin replaces the behaviour 
with that of `navigateTo` (which is used by `gatsby-link`) preserving the 
SPA-like page change without reload.

## Install

`npm install --save gatsby-plugin-catch-links`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-catch-links`]
```
