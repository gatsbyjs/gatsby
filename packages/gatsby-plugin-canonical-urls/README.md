# gatsby-plugin-canonical-urls

Add canonical links to HTML pages Gatsby generates.

This implementation is primarily helpful for distinguishing between
https/http, www/no-www but could possibly be extended to help with
when sites add multiple paths to the same page.

## Install

`npm install --save gatsby-plugin-canonical-urls`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-canonical-urls`,
    options: {
      siteUrl: `https://www.example.com`,
    }
  }
]
```

With the above configuration, the plugin will add to the head of every HTML page
a `rel=canonical` e.g.

```html
<link rel="canonical" href="http://www.example.com/about-us/" />
```
