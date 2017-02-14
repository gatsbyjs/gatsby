# gatsby-plugin-catch-links

Intercepts local links from markdown and other non-react pages and does
a client-side pushState to avoid the browser having to refresh the page.

## Install

`npm install --save gatsby-plugin-catch-links`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-catch-links`,
]
```
